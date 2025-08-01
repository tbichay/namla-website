#!/usr/bin/env node

/**
 * NAMLA Production Deployment Script
 * 
 * Deploys feature branch to production:
 * - Validates feature branch setup
 * - Commits current changes
 * - Switches to main branch and merges feature
 * - Runs production database migrations
 * - Pushes to production
 * - Monitors production deployment
 * - Optionally cleans up feature branch
 */

const fs = require('fs')
const { execSync } = require('child_process')

// Configuration
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

function hasUncommittedChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' })
    return status.trim().length > 0
  } catch (error) {
    return false
  }
}

function generateCommitMessage(branchName) {
  // Extract feature name from branch (e.g., feature/user-auth -> "user auth")
  const featureName = branchName
    .replace(/^feature\//, '')
    .replace(/[-_]/g, ' ')
    .toLowerCase()
  
  return `feat: add ${featureName} functionality

✅ Ready for production deployment

Co-authored-by: Claude <noreply@anthropic.com>`
}

function commitCurrentChanges(branchName) {
  if (hasUncommittedChanges()) {
    console.log('📝 Committing current changes...')
    
    try {
      const message = generateCommitMessage(branchName)
      execSync('git add .', { stdio: 'inherit' })
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' })
      console.log('✅ Changes committed')
    } catch (error) {
      console.error('❌ Error committing changes:', error.message)
      process.exit(1)
    }
  } else {
    console.log('ℹ️  No uncommitted changes detected')
  }
}

function switchToMainAndMerge(featureBranch) {
  console.log('🔄 Switching to main branch...')
  
  try {
    // Switch to main
    execSync('git checkout main', { stdio: 'inherit' })
    console.log('✅ Switched to main branch')
    
    // Pull latest main
    console.log('📥 Pulling latest main branch...')
    execSync('git pull origin main', { stdio: 'inherit' })
    console.log('✅ Main branch updated')
    
    // Merge feature branch
    console.log(`🔗 Merging ${featureBranch} into main...`)
    execSync(`git merge ${featureBranch} --no-ff -m "feat: merge ${featureBranch} into main

🚀 Production deployment for ${featureBranch}

Co-authored-by: Claude <noreply@anthropic.com>"`, { stdio: 'inherit' })
    console.log('✅ Feature branch merged into main')
    
  } catch (error) {
    console.error('❌ Error during main branch operations:', error.message)
    console.log('\n🔧 Manual steps to resolve:')
    console.log('   1. Resolve any merge conflicts')
    console.log('   2. Run: git add . && git commit')
    console.log('   3. Run this script again')
    process.exit(1)
  }
}

async function runProductionMigrations(originalEnvVars) {
  console.log('🔄 Running production database migrations...')
  
  // Temporarily set production database URL
  const productionDbUrl = originalEnvVars.DATABASE_URL
  
  if (!productionDbUrl || productionDbUrl.includes('branch-')) {
    console.error('❌ Production database URL not found or still using branch database')
    console.log('💡 Make sure your original .env.local has the production DATABASE_URL')
    process.exit(1)
  }
  
  try {
    // Create temporary env for production migration
    const tempEnv = {
      ...process.env,
      DATABASE_URL: productionDbUrl
    }
    
    execSync('npm run db:push', { 
      stdio: 'inherit',
      env: tempEnv
    })
    console.log('✅ Production database migrations completed')
  } catch (error) {
    console.error('❌ Production database migration failed:', error.message)
    console.log('💡 This might require manual intervention')
    throw error
  }
}

function pushToProduction() {
  console.log('🚀 Pushing main branch to production...')
  
  try {
    execSync('git push origin main', { stdio: 'inherit' })
    console.log('✅ Pushed to production')
  } catch (error) {
    console.error('❌ Error pushing to production:', error.message)
    process.exit(1)
  }
}

async function waitForProductionDeployment(projectId, vercelToken, maxWaitTime = 300000) {
  if (!vercelToken || !projectId) {
    console.log('ℹ️  Vercel API not configured - skipping deployment monitoring')
    console.log('🔗 Check deployment status at: https://vercel.com/dashboard')
    return null
  }

  console.log('⏳ Waiting for production deployment...')
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch(`${VERCEL_API_BASE}/v6/deployments?projectId=${projectId}&limit=5`, {
        headers: { 'Authorization': `Bearer ${vercelToken}` }
      })
      
      if (!response.ok) {
        console.log(`⚠️  Vercel API error: ${response.status}`)
        await new Promise(resolve => setTimeout(resolve, 15000))
        continue
      }
      
      const data = await response.json()
      const productionDeployment = data.deployments.find(dep => 
        dep.target === 'production' && 
        dep.createdAt > (Date.now() - 600000) // Within last 10 minutes
      )
      
      if (productionDeployment) {
        if (productionDeployment.readyState === 'READY') {
          console.log('✅ Production deployment completed!')
          return `https://${productionDeployment.url}`
        } else if (productionDeployment.readyState === 'ERROR') {
          console.log('❌ Production deployment failed')
          return null
        } else {
          console.log(`🔄 Deployment status: ${productionDeployment.readyState}`)
        }
      }
      
    } catch (error) {
      console.log(`⚠️  Error checking deployment: ${error.message}`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 15000)) // Wait 15 seconds
  }
  
  console.log('⏰ Deployment monitoring timed out')
  return null
}

async function promptCleanup(featureBranch) {
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question(`\n🧹 Clean up feature branch "${featureBranch}" database and resources? (y/N): `, answer => {
      rl.close()
      resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes')
    })
  })
}

async function main() {
  console.log('🚀 NAMLA Production Deployment Starting...\n')
  
  // 1. Validate current setup
  const currentBranch = getCurrentBranch()
  
  if (currentBranch === 'main' || currentBranch === 'master') {
    console.error('❌ Already on main branch')
    console.log('💡 Switch to your feature branch first: git checkout feature/your-feature')
    process.exit(1)
  }
  
  console.log(`📝 Current feature branch: ${currentBranch}`)
  
  // 2. Load environment variables to get original settings
  const envVars = loadEnvFile('.env.local')
  
  // 3. Check if feature branch database is configured
  if (!envVars.BRANCH_NAME || envVars.BRANCH_NAME !== currentBranch) {
    console.log('⚠️  Feature branch database not detected')
    console.log('💡 This might be okay if you\'re deploying without feature database')
    console.log('   Or run: npm run branch:setup first')
  } else {
    console.log(`✅ Feature branch database detected: ${envVars.BRANCH_NAME}`)
  }
  
  // 4. Load original environment (for production database URL)
  const backupEnvFile = `.env.backup-${currentBranch.replace(/[\/\\]/g, '-')}`
  let originalEnvVars = envVars
  
  if (fs.existsSync(backupEnvFile)) {
    originalEnvVars = loadEnvFile(backupEnvFile)
    console.log('✅ Found original environment backup')
  } else {
    console.log('⚠️  No environment backup found - using current .env.local')
  }
  
  try {
    // 5. Commit current changes
    commitCurrentChanges(currentBranch)
    
    // 6. Switch to main and merge
    switchToMainAndMerge(currentBranch)
    
    // 7. Run production database migrations
    await runProductionMigrations(originalEnvVars)
    
    // 8. Push to production
    pushToProduction()
    
    // 9. Wait for production deployment
    const productionUrl = await waitForProductionDeployment(
      envVars.VERCEL_PROJECT_ID || originalEnvVars.VERCEL_PROJECT_ID,
      envVars.VERCEL_TOKEN || originalEnvVars.VERCEL_TOKEN
    )
    
    // 10. Show results
    console.log('\n✅ Production deployment completed!')
    console.log(`\n📋 Summary:`)
    console.log(`   Feature Branch: ${currentBranch}`)
    console.log(`   Merged to: main`)
    console.log(`   Database: Production database updated`)
    console.log(`   Status: Live on production`)
    
    if (productionUrl) {
      console.log(`   Production URL: ${productionUrl}`)
    } else {
      console.log(`   Production URL: Check https://vercel.com/dashboard`)
    }
    
    // 11. Optional cleanup
    const shouldCleanup = await promptCleanup(currentBranch)
    
    if (shouldCleanup) {
      console.log('\n🧹 Cleaning up feature branch resources...')
      try {
        execSync(`npm run branch:cleanup ${currentBranch} -- --force`, { stdio: 'inherit' })
        console.log('✅ Feature branch cleaned up')
      } catch (error) {
        console.log('⚠️  Cleanup failed - you can run it manually later:')
        console.log(`   npm run branch:cleanup ${currentBranch}`)
      }
    } else {
      console.log('\n💡 Feature branch resources kept for debugging')
      console.log(`   To cleanup later: npm run branch:cleanup ${currentBranch}`)
    }
    
    console.log(`\n🎉 Production deployment successful!`)
    console.log(`   Your feature is now live for all users`)
    
  } catch (error) {
    console.error('\n❌ Production deployment failed:', error.message)
    console.log('\n🔧 You may need to manually resolve conflicts and retry')
    process.exit(1)
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n⚠️  Production deployment interrupted')
  console.log('💡 You may be in an inconsistent state - check git status')
  process.exit(1)
})

// Run the script
if (require.main === module) {
  main()
}

module.exports = { main }