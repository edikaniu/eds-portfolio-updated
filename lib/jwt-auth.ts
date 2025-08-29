import jwt from 'jsonwebtoken'

export interface JWTPayload {
  id: string
  email: string
  name: string
  role: string
  exp: number
  iat: number
}

export interface SimpleUser {
  id: string
  email: string
  name: string
  role: string
}

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET or NEXTAUTH_SECRET environment variable is required')
}

export function generateJWT(user: SimpleUser): string {
  const payload: Omit<JWTPayload, 'exp' | 'iat'> = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d', // 7 days
    issuer: 'eds-portfolio',
    audience: 'admin-panel'
  })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'eds-portfolio',
      audience: 'admin-panel'
    }) as JWTPayload
    
    // Additional validation
    if (!decoded.id || !decoded.email || decoded.role !== 'admin') {
      return null
    }
    
    return decoded
  } catch (error) {
    // Token is invalid, expired, or malformed
    return null
  }
}

export function refreshJWT(token: string): string | null {
  try {
    const decoded = verifyJWT(token)
    if (!decoded) return null
    
    // Create new token with same user data
    const user: SimpleUser = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    }
    
    return generateJWT(user)
  } catch {
    return null
  }
}

export function getTokenPayload(token: string): JWTPayload | null {
  try {
    // Decode without verification for payload inspection
    const decoded = jwt.decode(token) as JWTPayload
    return decoded
  } catch {
    return null
  }
}