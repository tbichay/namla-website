#!/usr/bin/env node

/**
 * Cleanup script to remove preview environment variables from Vercel dashboard
 * This fixes the mistake of polluting the dashboard with API-set variables
 */

const fs = require('fs')

const VERCEL_API_BASE = 'https://api.vercel.com'

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

async function getVercelEnvironmentVariables(projectId, vercelToken) {
  const response = await fetch(`${VERCEL_API_BASE}/v10/projects/${projectId}/env`, {
    headers: { 'Authorization': `Bearer ${vercelToken}` }
  })
  
  if (response.ok) {
    const data = await response.json()
    return data.envs || []
  }
  return []
}

async function deleteVercelEnvironmentVariable(projectId, envId, vercelToken) {
  const response = await fetch(`${VERCEL_API_BASE}/v9/projects/${projectId}/env/${envId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${vercelToken}` }
  })
  
  return response.ok
}

async function main() {
  console.log('🧹 Cleaning up Vercel Dashboard Environment Variables...\n')
  
  const envVars = loadEnvFile('.env.local')
  
  if (!envVars.VERCEL_TOKEN || !envVars.VERCEL_PROJECT_ID) {
    console.error('❌ Missing VERCEL_TOKEN or VERCEL_PROJECT_ID in .env.local')
    process.exit(1)
  }
  
  try {
    // Get all environment variables
    const allEnvVars = await getVercelEnvironmentVariables(envVars.VERCEL_PROJECT_ID, envVars.VERCEL_TOKEN)
    
    // Find preview-only variables (not production)
    const previewVars = allEnvVars.filter(env => 
      env.target.includes('preview') && !env.target.includes('production')
    )
    
    console.log(`Found ${previewVars.length} preview-only environment variables to remove:`)
    previewVars.forEach(env => console.log(`  - ${env.key}`))
    
    if (previewVars.length === 0) {
      console.log('✅ No preview-only variables found. Dashboard is already clean!')
      return
    }
    
    console.log('\n🗑️  Removing preview variables...')
    
    let deletedCount = 0
    for (const envVar of previewVars) {
      const success = await deleteVercelEnvironmentVariable(
        envVars.VERCEL_PROJECT_ID, 
        envVar.id, 
        envVars.VERCEL_TOKEN
      )
      
      if (success) {
        console.log(`✅ Deleted ${envVar.key}`)
        deletedCount++
      } else {
        console.log(`❌ Failed to delete ${envVar.key}`)
      }
    }
    
    console.log(`\n✅ Cleanup completed! Removed ${deletedCount}/${previewVars.length} variables`)
    console.log('📊 Vercel dashboard now only contains production variables')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}