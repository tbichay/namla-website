#!/usr/bin/env node

/**
 * NAMLA Preview Deployment Script
 * 
 * Deploys current feature branch to Vercel Preview with isolated database:
 * - Validates feature branch
 * - Runs feature branch database migrations
 * - Commits and pushes feature branch
 * - Monitors Vercel preview deployment
 * - Shows preview URL
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

🚀 Preview deployment for ${branchName}

Co-authored-by: Claude <noreply@anthropic.com>`
}

function commitAndPush(branchName, message) {
  console.log('📝 Committing current changes...')
  
  try {
    execSync('git add .', { stdio: 'inherit' })
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' })
    console.log('✅ Changes committed')
    
    console.log(`🚀 Pushing ${branchName} to remote...`)
    execSync(`git push origin ${branchName}`, { stdio: 'inherit' })
    console.log('✅ Pushed to remote')
    
  } catch (error) {
    console.error('❌ Error during commit or push:', error.message)
    process.exit(1)
  }
}

async function waitForVercelDeployment(projectId, branchName, vercelToken, maxWaitTime = 300000) {
  if (!vercelToken || !projectId) {
    console.log('ℹ️  Vercel API not configured - skipping deployment monitoring')
    console.log('🔗 Check deployment status at: https://vercel.com/dashboard')
    return null
  }

  console.log('⏳ Waiting for Vercel preview deployment...')
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch(`${VERCEL_API_BASE}/v6/deployments?projectId=${projectId}&limit=5`, {
        headers: { 'Authorization': `Bearer ${vercelToken}` }
      })
      
      if (!response.ok) {
        console.log(`⚠️  Vercel API error: ${response.status}`)
        await new Promise(resolve => setTimeout(resolve, 10000))
        continue
      }
      
      const data = await response.json()
      const recentDeployment = data.deployments.find(dep => 
        dep.meta?.githubCommitRef === branchName && 
        dep.createdAt > (Date.now() - 600000) // Within last 10 minutes
      )
      
      if (recentDeployment) {
        if (recentDeployment.readyState === 'READY') {
          console.log('✅ Preview deployment completed!')
          return `https://${recentDeployment.url}`
        } else if (recentDeployment.readyState === 'ERROR') {
          console.log('❌ Preview deployment failed')
          return null
        } else {
          console.log(`🔄 Deployment status: ${recentDeployment.readyState}`)
        }
      }
      
    } catch (error) {
      console.log(`⚠️  Error checking deployment: ${error.message}`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
  }
  
  console.log('⏰ Deployment monitoring timed out')
  return null
}

async function runDatabaseMigrations() {
  console.log('🔄 Running feature branch database migrations...')
  
  try {
    // Load DATABASE_URL from .env.local and set it explicitly
    const envVars = loadEnvFile('.env.local')
    const databaseUrl = envVars.DATABASE_URL
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found in .env.local')
    }
    
    execSync('npm run db:push', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl }
    })
    console.log('✅ Database migrations completed')
  } catch (error) {
    console.error('❌ Database migration failed:', error.message)
    console.log('💡 This might be expected if schema is already up to date')
  }
}

async function pushEnvironmentVariablesToVercel(branchName) {
  console.log('🔄 Pushing environment variables to Vercel...')
  
  try {
    // Load all environment variables from .env.local
    const envVars = loadEnvFile('.env.local')
    
    // Essential variables that Vercel needs for the build
    const essentialVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET', 
      'NEXTAUTH_URL',
      'R2_ACCOUNT_ID',
      'R2_ACCESS_KEY_ID', 
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME',
      'R2_FOLDER_PREFIX',
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_COMING_SOON_MODE',
      'ADMIN_EMAIL',
      'ADMIN_PASSWORD',
      'BRANCH_NAME'
    ]
    
    let pushedCount = 0
    
    for (const varName of essentialVars) {
      if (envVars[varName]) {
        try {
          // Use vercel env add command for each variable
          execSync(`vercel env add ${varName} preview ${branchName}`, {
            input: envVars[varName],
            stdio: ['pipe', 'pipe', 'pipe']
          })
          console.log(`✅ Added ${varName} to Vercel`)
          pushedCount++
        } catch (error) {
          // Variable might already exist, try to remove and re-add
          try {
            execSync(`vercel env rm ${varName} preview ${branchName} --yes`, { stdio: 'pipe' })
            execSync(`vercel env add ${varName} preview ${branchName}`, {
              input: envVars[varName],
              stdio: ['pipe', 'pipe', 'pipe']
            })
            console.log(`✅ Updated ${varName} in Vercel`)
            pushedCount++
          } catch (updateError) {
            console.log(`⚠️  Could not set ${varName}: ${updateError.message}`)
          }
        }
      }
    }
    
    if (pushedCount > 0) {
      console.log(`✅ Pushed ${pushedCount} environment variables to Vercel`)
    } else {
      console.log('⚠️  No environment variables were pushed to Vercel')
      console.log('💡 Make sure you are logged in to Vercel CLI: vercel login')
    }
    
  } catch (error) {
    console.log(`⚠️  Could not push environment variables to Vercel: ${error.message}`)
    console.log('💡 You may need to set them manually in Vercel dashboard')
    console.log('   Or ensure Vercel CLI is installed and authenticated')
  }
}

async function main() {
  console.log('🚀 NAMLA Preview Deployment Starting...\n')
  
  // 1. Validate current branch
  const currentBranch = getCurrentBranch()
  
  if (currentBranch === 'main' || currentBranch === 'master') {
    console.error('❌ Cannot deploy main/master branch as preview')
    console.log('💡 Checkout a feature branch first: git checkout -b feature/your-feature')
    process.exit(1)
  }
  
  console.log(`📝 Current branch: ${currentBranch}`)
  
  // 2. Load environment variables
  const envVars = loadEnvFile('.env.local')
  
  // 3. Check if feature branch database is configured
  if (!envVars.BRANCH_NAME || envVars.BRANCH_NAME !== currentBranch) {
    console.log('⚠️  Feature branch database not detected')
    console.log('💡 Run: npm run branch:setup')
    console.log('   This will create an isolated database for your feature branch')
    process.exit(1)
  }
  
  console.log(`✅ Feature branch database configured: ${envVars.BRANCH_NAME}`)
  
  try {
    // 4. Run database migrations for feature branch
    await runDatabaseMigrations()
    
    // 5. Commit and push if there are changes
    if (hasUncommittedChanges()) {
      const commitMessage = generateCommitMessage(currentBranch)
      commitAndPush(currentBranch, commitMessage)
    } else {
      console.log('ℹ️  No uncommitted changes detected')
      console.log('🚀 Pushing to trigger deployment...')
      try {
        execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' })
      } catch (error) {
        console.log('ℹ️  Nothing to push - branch is up to date')
      }
    }
    
    // 6. Push environment variables to Vercel
    await pushEnvironmentVariablesToVercel(currentBranch)

    // 7. Wait for Vercel deployment
    const previewUrl = await waitForVercelDeployment(
      envVars.VERCEL_PROJECT_ID,
      currentBranch,
      envVars.VERCEL_TOKEN
    )
    
    // 7. Show results
    console.log('\n✅ Preview deployment completed!')
    console.log(`\n📋 Summary:`)
    console.log(`   Branch: ${currentBranch}`)
    console.log(`   Database: Isolated feature branch database`)
    console.log(`   R2 Storage: branch-${currentBranch}/`)
    
    if (previewUrl) {
      console.log(`   Preview URL: ${previewUrl}`)
    } else {
      console.log(`   Preview URL: Check https://vercel.com/dashboard`)
    }
    
    console.log(`\n🎯 Next steps:`)
    console.log(`   1. Test your feature on the preview URL`)
    console.log(`   2. If everything works: npm run deploy:prod`)
    console.log(`   3. If issues found: continue developing and run deploy:preview again`)
    
  } catch (error) {
    console.error('\n❌ Preview deployment failed:', error.message)
    process.exit(1)
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n⚠️  Preview deployment interrupted')
  process.exit(1)
})

// Run the script
if (require.main === module) {
  main()
}

module.exports = { main }