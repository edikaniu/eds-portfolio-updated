<<<<<<< HEAD
// jest.polyfills.js
import { TextEncoder, TextDecoder } from 'util'

// Add globals for testing environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock structuredClone if not available
if (!global.structuredClone) {
  global.structuredClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(structuredClone)
    if (obj instanceof Object) {
      const copy = {}
      for (const key in obj) {
        copy[key] = structuredClone(obj[key])
      }
      return copy
    }
  }
}

// Mock crypto for Node.js environment
if (!global.crypto) {
  const crypto = require('crypto')
  
  global.crypto = {
    getRandomValues: (buffer) => {
      return crypto.randomFillSync(buffer)
    },
    randomUUID: () => crypto.randomUUID(),
    subtle: {
      digest: async (algorithm, data) => {
        const hash = crypto.createHash(algorithm.toLowerCase().replace('-', ''))
        hash.update(data)
        return hash.digest()
      },
    },
  }
=======
// jest.polyfills.js
import { TextEncoder, TextDecoder } from 'util'

// Add globals for testing environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock structuredClone if not available
if (!global.structuredClone) {
  global.structuredClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(structuredClone)
    if (obj instanceof Object) {
      const copy = {}
      for (const key in obj) {
        copy[key] = structuredClone(obj[key])
      }
      return copy
    }
  }
}

// Mock crypto for Node.js environment
if (!global.crypto) {
  const crypto = require('crypto')
  
  global.crypto = {
    getRandomValues: (buffer) => {
      return crypto.randomFillSync(buffer)
    },
    randomUUID: () => crypto.randomUUID(),
    subtle: {
      digest: async (algorithm, data) => {
        const hash = crypto.createHash(algorithm.toLowerCase().replace('-', ''))
        hash.update(data)
        return hash.digest()
      },
    },
  }
>>>>>>> 177dc73edd19f0ab5571599bf2c6435fbada064e
}