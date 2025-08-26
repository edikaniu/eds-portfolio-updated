// Cache bust endpoint to force Vercel rebuild
export async function GET() {
  return Response.json({ 
    timestamp: new Date().toISOString(),
    message: "Cache busted - CSRF completely disabled",
    buildId: process.env.VERCEL_GIT_COMMIT_SHA || 'local'
  })
}