// Simple debug script to check database contents
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').replace(/^"(.*)"$/, '$1');
    process.env[key] = value;
  }
});

const { Pool } = require('@neondatabase/serverless');

async function debugProjects() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔍 Checking projects in database...');
    
    const result = await pool.query('SELECT id, name, status, "isPublished" FROM projects ORDER BY "updatedAt" DESC');
    
    console.log(`Found ${result.rows.length} projects:`);
    result.rows.forEach(project => {
      console.log(`- ${project.name} (status: "${project.status}", published: ${project.isPublished})`);
    });
    
    console.log('\nFiltering logic:');
    console.log('Current projects (status !== "verkauft"):');
    const current = result.rows.filter(p => p.status !== 'verkauft');
    current.forEach(p => console.log(`  - ${p.name} (${p.status})`));
    
    console.log('Historical projects (status === "verkauft"):');
    const historical = result.rows.filter(p => p.status === 'verkauft');
    historical.forEach(p => console.log(`  - ${p.name} (${p.status})`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

debugProjects();