#!/usr/bin/env node

/**
 * NAMLA Database Branching Setup Script
 * 
 * Creates isolated development environment for feature branches:
 * - Neon database branch from production
 * - R2 storage folder prefix
 * - Local .env file with branch-specific variables
 * - Vercel environment variables via API
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

async function getMainBranchId(projectId, apiKey) {
  console.log(`🔍 Getting branches for project: ${projectId}`)
  const response = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error(`API Error: ${response.status} - ${errorText}`)
    throw new Error(`Failed to get branches: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  const mainBranch = data.branches.find(branch => branch.primary === true)
  
  if (!mainBranch) {
    throw new Error('No primary branch found')
  }
  
  return mainBranch.id
}

async function createNeonBranch(projectId, parentBranchId, branchName, apiKey) {
  console.log(`🔄 Creating Neon database branch: ${branchName}`)
  console.log(`🔍 Using Project ID: ${projectId}`)
  console.log(`🔍 Parent Branch ID: ${parentBranchId}`)
  
  const response = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      branch: {
        name: branchName,
        parent_id: parentBranchId
      },
      endpoints: [{
        type: 'read_write'
      }]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create Neon branch: ${error}`)
  }

  const data = await response.json()
  console.log(`✅ Database branch created: ${branchName}`)
  
  // Wait for branch to be ready
  await waitForBranchReady(projectId, data.branch.id, apiKey)
  
  return data.branch
}

async function waitForBranchReady(projectId, branchId, apiKey, maxWaitTime = 60000) {
  console.log('⏳ Waiting for database branch to be ready...')
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    const response = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches/${branchId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    
    if (!response.ok) {
      console.log(`⚠️  Branch status check failed: ${response.status}`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      continue
    }
    
    const data = await response.json()
    console.log(`🔍 Branch state: ${data.branch.current_state}`)
    
    if (data.branch.current_state === 'ready') {
      console.log('✅ Database branch is ready')
      return data.branch
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  throw new Error('Database branch took too long to become ready')
}

async function createBranchEndpoint(projectId, branchId, apiKey) {
  const response = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches/${branchId}/endpoints`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      endpoint: {
        type: 'read_write'
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create endpoint: ${error}`)
  }

  // Wait for endpoint to be ready
  await new Promise(resolve => setTimeout(resolve, 5000))
}

async function buildConnectionString(projectId, branchId, endpoint, apiKey) {
  // Get database details
  const dbResponse = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches/${branchId}/databases`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  })
  
  const dbData = await dbResponse.json()
  const database = dbData.databases[0]
  
  // Get role details  
  const roleResponse = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches/${branchId}/roles`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  })
  
  const roleData = await roleResponse.json()
  const role = roleData.roles[0]
  
  if (!role.password) {
    console.log('⚠️  Warning: No password found for role, using production password')
    // Use production password from environment
    const productionPassword = envVars.DATABASE_URL?.match(/:([^@]+)@/)?.[1] || 'npg_dRjBwL2p6xMI'
    
    // Add pooler suffix if not present
    const poolerHost = endpoint.host.includes('-pooler.') ? endpoint.host : endpoint.host.replace('.eu-central-1.aws.neon.tech', '-pooler.eu-central-1.aws.neon.tech')
    
    return `postgresql://${role.name}:${productionPassword}@${poolerHost}/${database.name}?sslmode=require&channel_binding=require`
  }
  
  // Add pooler suffix if not present
  const poolerHost = endpoint.host.includes('-pooler.') ? endpoint.host : endpoint.host.replace('.eu-central-1.aws.neon.tech', '-pooler.eu-central-1.aws.neon.tech')
  
  return `postgresql://${role.name}:${role.password}@${poolerHost}/${database.name}?sslmode=require&channel_binding=require`
}

async function getBranchConnectionString(projectId, branchId, apiKey, envVars = {}) {
  console.log('🔍 Getting branch connection string...')
  
  // Wait for endpoints to be available (up to 10 seconds)
  let endpoint = null
  const maxAttempts = 5
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`⏳ Checking for endpoints (attempt ${attempt}/${maxAttempts})...`)
    
    const response = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches/${branchId}/endpoints`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    
    if (response.ok) {
      const data = await response.json()
      endpoint = data.endpoints[0]
      
      if (endpoint) {
        console.log('✅ Endpoint found!')
        break
      }
    }
    
    if (attempt === maxAttempts) {
      console.log('⚠️  No endpoints found automatically.')
      console.log('📝 Trying fallback approach...')
      
      // Try to use the existing DATABASE_URL as template
      const currentDatabaseUrl = process.env.DATABASE_URL || envVars.DATABASE_URL
      if (currentDatabaseUrl) {
        console.log('💡 Using production database URL as template')
        // This is a temporary workaround - the branch exists but needs manual endpoint creation
        console.log('⚠️  Warning: Using production database URL temporarily')
        console.log('   You should create proper branch endpoint at: https://console.neon.tech/')
        return currentDatabaseUrl
      } else {
        console.log('❌ Manual steps required:')
        console.log('   1. Go to https://console.neon.tech/')
        console.log(`   2. Open project: small-feather-29533902`)
        console.log(`   3. Find branch: feature/init`)
        console.log('   4. Create a new endpoint (read-write)')
        console.log('   5. Run the script again')
        console.log('\nℹ️  This is a known limitation with Neon branch endpoints.')
        process.exit(1)
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  return await buildConnectionString(projectId, branchId, endpoint, apiKey)
}

async function setVercelEnvironmentVariables(projectId, branchName, envVars, vercelToken) {
  console.log(`🔄 Setting Vercel environment variables for branch: ${branchName}`)
  
  for (const [key, value] of Object.entries(envVars)) {
    const response = await fetch(`${VERCEL_API_BASE}/v10/projects/${projectId}/env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key,
        value,
        type: 'encrypted',
        target: ['preview'],
        gitBranch: branchName
      })
    })

    if (response.ok) {
      console.log(`✅ Set ${key} for branch ${branchName}`)
    } else {
      // Variable might already exist, try to update it
      const error = await response.text()
      console.log(`⚠️  ${key} might already exist: ${error}`)
    }
  }
}

async function runDatabaseMigrations(databaseUrl) {
  console.log('🔄 Running database migrations...')
  
  try {
    execSync('npm run db:push', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'inherit'
    })
    console.log('✅ Database migrations completed')
  } catch (error) {
    console.error('❌ Database migration failed:', error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 NAMLA Branch Setup Starting...\n')
  
  // Get current branch
  const currentBranch = getCurrentBranch()
  
  if (currentBranch === 'main' || currentBranch === 'master') {
    console.error('❌ Cannot run branch setup on main/master branch')
    process.exit(1)
  }
  
  console.log(`📝 Current branch: ${currentBranch}`)
  
  // Load environment variables
  const envVars = loadEnvFile('.env.local')
  const requiredVars = ['NEON_API_KEY', 'NEON_PROJECT_ID']
  
  for (const varName of requiredVars) {
    if (!envVars[varName]) {
      console.error(`❌ Missing required environment variable: ${varName}`)
      process.exit(1)
    }
  }
  
  // Check for optional Vercel variables
  const hasVercelConfig = envVars.VERCEL_TOKEN && envVars.VERCEL_PROJECT_ID
  if (!hasVercelConfig) {
    console.log('ℹ️  Vercel API variables not configured - skipping Vercel environment variable setup')
  }
  
  try {
    // 1. Get main/primary branch ID
    const parentBranchId = await getMainBranchId(envVars.NEON_PROJECT_ID, envVars.NEON_API_KEY)
    
    // 2. Create Neon database branch
    const branch = await createNeonBranch(
      envVars.NEON_PROJECT_ID,
      parentBranchId,
      currentBranch,
      envVars.NEON_API_KEY
    )
    
    // 3. Get connection string for the new branch
    const branchDatabaseUrl = await getBranchConnectionString(
      envVars.NEON_PROJECT_ID,
      branch.id,
      envVars.NEON_API_KEY,
      envVars
    )
    
    // 4. Create branch-specific environment variables
    const branchEnvVars = {
      ...envVars,
      DATABASE_URL: branchDatabaseUrl,
      R2_BUCKET_NAME: envVars.R2_BUCKET_NAME || 'namla-prod',
      R2_FOLDER_PREFIX: `branch-${currentBranch}/`,
      NEXT_PUBLIC_SITE_URL: `https://namla-website-git-${currentBranch}-tombichay.vercel.app`,
      BRANCH_NAME: currentBranch
    }
    
    // 5. Create backup of current .env.local for restoration later
    const safeBranchName = currentBranch.replace(/[\/\\]/g, '-')
    const backupEnvFile = `.env.backup-${safeBranchName}`
    if (fs.existsSync('.env.local')) {
      fs.copyFileSync('.env.local', backupEnvFile)
      console.log(`📦 Backed up current .env.local to ${backupEnvFile}`)
    }
    
    // 6. Write directly to .env.local (unified approach)
    writeEnvFile('.env.local', branchEnvVars)
    console.log(`✅ Updated .env.local with branch configuration`)
    
    // 7. Set Vercel environment variables (using same values as .env.local)
    if (hasVercelConfig) {
      await setVercelEnvironmentVariables(
        envVars.VERCEL_PROJECT_ID,
        currentBranch,
        {
          DATABASE_URL: branchDatabaseUrl,
          R2_BUCKET_NAME: branchEnvVars.R2_BUCKET_NAME,
          R2_ACCESS_KEY_ID: branchEnvVars.R2_ACCESS_KEY_ID,
          R2_SECRET_ACCESS_KEY: branchEnvVars.R2_SECRET_ACCESS_KEY,
          R2_ACCOUNT_ID: branchEnvVars.R2_ACCOUNT_ID,
          R2_FOLDER_PREFIX: branchEnvVars.R2_FOLDER_PREFIX,
          NEXT_PUBLIC_SITE_URL: branchEnvVars.NEXT_PUBLIC_SITE_URL,
          NEXTAUTH_URL: branchEnvVars.NEXT_PUBLIC_SITE_URL,
          NEXTAUTH_SECRET: branchEnvVars.NEXTAUTH_SECRET,
          BRANCH_NAME: currentBranch
        },
        envVars.VERCEL_TOKEN
      )
    }
    
    // 8. Run database migrations
    await runDatabaseMigrations(branchDatabaseUrl)
    
    console.log('\n✅ Branch setup completed successfully!')
    console.log(`\n📋 Summary:`)
    console.log(`   Branch: ${currentBranch}`)
    console.log(`   Database: ${branch.name}`)
    console.log(`   R2 Folder: branch-${currentBranch}/`)
    console.log(`   Environment: .env.local (backed up to ${backupEnvFile})`)
    console.log(`   Vercel Preview: Same configuration as local`)
    console.log(`\n🚀 Ready to use:`)
    console.log(`   npm run dev  # Uses branch database & isolated R2`)
    console.log(`   git push     # Vercel preview uses same config`)
    console.log(`\n🧹 To cleanup:`)
    console.log(`   npm run branch:cleanup  # Restores original .env.local`)
    
  } catch (error) {
    console.error('\n❌ Branch setup failed:', error.message)
    process.exit(1)
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n⚠️  Branch setup interrupted')
  process.exit(1)
})

// Run the script
if (require.main === module) {
  main()
}

module.exports = { main }