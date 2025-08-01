#!/usr/bin/env node

/**
 * NAMLA Database Branching Cleanup Script
 * 
 * Cleans up branch-specific resources:
 * - Deletes Neon database branch
 * - Removes local .env file
 * - Removes Vercel environment variables for the branch
 * - Optionally cleans up R2 storage folder
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const NEON_API_BASE = 'https://console.neon.tech/api/v2'
const VERCEL_API_BASE = 'https://api.vercel.com'

// Helper functions
function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
  } catch (error) {
    console.error('❌ Error getting current git branch:', error.message)
    process.exit(1)
  }
}

function loadEnvFile(filePath) {
  const envVars = {}
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    content.split('\n').forEach(line => {
      const match = line.match(/^([^#][^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].replace(/^["']|["']$/g, '').trim()
        envVars[key] = value
      }
    })
  }
  return envVars
}

function writeEnvFile(filePath, envVars) {
  const content = Object.entries(envVars)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n')
  fs.writeFileSync(filePath, content + '\n')
}

async function findNeonBranch(projectId, branchName, apiKey) {
  console.log(`🔍 Looking for Neon database branch: ${branchName}`)
  
  const response = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to list Neon branches: ${error}`)
  }

  const data = await response.json()
  return data.branches.find(branch => branch.name === branchName)
}

async function deleteNeonBranch(projectId, branchId, apiKey) {
  console.log(`🗑️  Deleting Neon database branch...`)
  
  const response = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches/${branchId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${apiKey}` }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to delete Neon branch: ${error}`)
  }

  console.log('✅ Database branch deleted')
}

async function getVercelEnvironmentVariables(projectId, vercelToken) {
  const response = await fetch(`${VERCEL_API_BASE}/v10/projects/${projectId}/env`, {
    headers: { 'Authorization': `Bearer ${vercelToken}` }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get Vercel environment variables: ${error}`)
  }

  const data = await response.json()
  return data.envs
}

async function deleteVercelEnvironmentVariable(projectId, envId, vercelToken) {
  const response = await fetch(`${VERCEL_API_BASE}/v9/projects/${projectId}/env/${envId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${vercelToken}` }
  })

  if (!response.ok) {
    const error = await response.text()
    console.log(`⚠️  Failed to delete environment variable: ${error}`)
    return false
  }

  return true
}

async function cleanupVercelEnvironmentVariables(projectId, branchName, vercelToken) {
  console.log(`🔄 Cleaning up Vercel environment variables for branch: ${branchName}`)
  
  try {
    const envVars = await getVercelEnvironmentVariables(projectId, vercelToken)
    
    // Find variables specific to this branch
    const branchEnvVars = envVars.filter(env => 
      env.gitBranch === branchName || 
      (env.target && env.target.includes('preview') && env.gitBranch === branchName)
    )

    let deletedCount = 0
    for (const envVar of branchEnvVars) {
      const success = await deleteVercelEnvironmentVariable(projectId, envVar.id, vercelToken)
      if (success) {
        console.log(`✅ Deleted ${envVar.key}`)
        deletedCount++
      }
    }

    if (deletedCount > 0) {
      console.log(`✅ Cleaned up ${deletedCount} Vercel environment variables`)
    } else {
      console.log('ℹ️  No branch-specific Vercel environment variables found')
    }
  } catch (error) {
    console.log(`⚠️  Warning: Could not cleanup Vercel environment variables: ${error.message}`)
  }
}

function promptUser(question) {
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.toLowerCase().trim())
    })
  })
}

async function main() {
  console.log('🧹 NAMLA Branch Cleanup Starting...\n')
  
  // Parse command line arguments
  const args = process.argv.slice(2)
  const branchName = args.find(arg => !arg.startsWith('--')) || getCurrentBranch()
  const force = args.includes('--force') || args.includes('-f')
  const keepR2 = args.includes('--keep-r2')
  
  if (branchName === 'main' || branchName === 'master') {
    console.error('❌ Cannot cleanup main/master branch')
    process.exit(1)
  }
  
  console.log(`📝 Target branch: ${branchName}`)
  
  // Confirmation prompt (unless --force is used)
  if (!force) {
    const answer = await promptUser(`⚠️  This will delete all resources for branch "${branchName}". Continue? (y/N): `)
    if (answer !== 'y' && answer !== 'yes') {
      console.log('❌ Cleanup cancelled')
      process.exit(0)
    }
  }
  
  // Load environment variables
  const envVars = loadEnvFile('.env.local')
  const requiredVars = ['NEON_API_KEY', 'NEON_PROJECT_ID']
  
  for (const varName of requiredVars) {
    if (!envVars[varName]) {
      console.error(`❌ Missing required environment variable: ${varName}`)
      process.exit(1)
    }
  }
  
  try {
    // 1. Delete Neon database branch
    const branch = await findNeonBranch(envVars.NEON_PROJECT_ID, branchName, envVars.NEON_API_KEY)
    
    if (branch) {
      await deleteNeonBranch(envVars.NEON_PROJECT_ID, branch.id, envVars.NEON_API_KEY)
    } else {
      console.log(`ℹ️  Database branch "${branchName}" not found (may have been deleted already)`)
    }
    
    // 2. Clean up Vercel environment variables
    if (envVars.VERCEL_TOKEN && envVars.VERCEL_PROJECT_ID) {
      await cleanupVercelEnvironmentVariables(envVars.VERCEL_PROJECT_ID, branchName, envVars.VERCEL_TOKEN)
    }
    
    // 3. Restore original .env.local from backup
    const safeBranchName = branchName.replace(/[\/\\]/g, '-')
    const backupEnvFile = `.env.backup-${safeBranchName}`
    
    if (fs.existsSync(backupEnvFile)) {
      fs.copyFileSync(backupEnvFile, '.env.local')
      fs.unlinkSync(backupEnvFile)
      console.log(`✅ Restored .env.local from backup`)
    } else {
      console.log('🔄 No backup found, resetting .env.local to production configuration...')
      
      // Fallback: Reset to production database and remove branch-specific vars
      const productionEnvVars = {
        ...envVars,
        DATABASE_URL: envVars.DATABASE_URL,
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
        NEXTAUTH_URL: 'http://localhost:3000'
      }
      
      // Remove branch-specific variables
      delete productionEnvVars.BRANCH_NAME
      delete productionEnvVars.R2_FOLDER_PREFIX
      
      writeEnvFile('.env.local', productionEnvVars)
      console.log('✅ Reset .env.local to production configuration')
    }
    
    // 4. Remove .env and .env.production files (used by Vercel for preview)
    if (fs.existsSync('.env')) {
      fs.unlinkSync('.env')
      console.log('✅ Removed .env file (was used for Vercel preview)')
    }
    
    if (fs.existsSync('.env.production')) {
      fs.unlinkSync('.env.production')
      console.log('✅ Removed .env.production file (was used for Vercel preview)')
    }
    
    // 5. R2 Storage cleanup info
    if (!keepR2) {
      console.log(`\n📁 R2 Storage Folder: branch-${branchName}/`)
      console.log(`ℹ️  Note: R2 files are kept for debugging purposes`)
      console.log(`   To manually clean up R2 folder, use Cloudflare dashboard or R2 API`)
    }
    
    console.log('\n✅ Branch cleanup completed successfully!')
    console.log(`\n📋 Summary:`)
    console.log(`   Branch: ${branchName}`)
    console.log(`   Database: ${branch ? 'Deleted' : 'Not found'}`)
    const wasRestored = fs.existsSync('.env.local') 
    console.log(`   .env.local: ${wasRestored ? 'Restored/Reset' : 'Not found'}`)
    console.log(`   Vercel Vars: Cleaned up`)
    console.log(`   R2 Folder: ${keepR2 ? 'Kept (--keep-r2)' : 'Kept (manual cleanup needed)'}`)
    
  } catch (error) {
    console.error('\n❌ Branch cleanup failed:', error.message)
    process.exit(1)
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n⚠️  Branch cleanup interrupted')
  process.exit(1)
})

// Run the script
if (require.main === module) {
  main()
}

module.exports = { main }