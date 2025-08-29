// Simplified authentication system for quick deployment
// Cache bust: 2025-08-26T18:45:00Z - Force rebuild to apply .trim() fix
export const ADMIN_CREDENTIALS = {
  email: (process.env.ADMIN_EMAIL || 'admin@edikanudoibuot.com').replace(/[\r\n\t]/g, '').trim(),
  password: (process.env.ADMIN_PASSWORD || 'admin123456').replace(/[\r\n\t]/g, '').trim()
}

export interface SimpleUser {
  id: string
  email: string
  name: string
  role: string
}

export function validateCredentials(email: string, password: string): boolean {
  const emailMatch = email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()
  const passwordMatch = password === ADMIN_CREDENTIALS.password
  
  return emailMatch && passwordMatch
}

export function createUserSession(): SimpleUser {
  return {
    id: 'admin-1',
    email: ADMIN_CREDENTIALS.email,
    name: 'Admin User',
    role: 'admin'
  }
}

// Simple session token (just base64 encoded user data for simplicity)
export function generateSessionToken(user: SimpleUser): string {
  const payload = {
    ...user,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export function verifySessionToken(token: string): SimpleUser | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    
    // Check if token is expired
    if (payload.exp && Date.now() > payload.exp) {
      return null
    }
    
    // Verify it's a valid user structure
    if (payload.id && payload.email && payload.role === 'admin') {
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name || 'Admin User',
        role: payload.role
      }
    }
    
    return null
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}