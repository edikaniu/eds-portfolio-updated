import { createDefaultAdmin } from '../lib/auth'

async function initializeAdmin() {
  console.log('Initializing default admin user...')
  
  try {
    await createDefaultAdmin()
    console.log('✅ Admin initialization completed successfully')
    console.log('📧 Default admin email: admin@edikanudoibuot.com')
    console.log('🔑 Default admin password: admin123456')
    console.log('⚠️  Please change these credentials after first login!')
  } catch (error) {
    console.error('❌ Error initializing admin:', error)
    process.exit(1)
  }
}

initializeAdmin()