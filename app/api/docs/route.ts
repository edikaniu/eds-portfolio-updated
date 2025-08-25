import { NextRequest, NextResponse } from 'next/server'
import { generateOpenAPISpec, API_DOCUMENTATION } from '@/lib/api-docs'
import { withErrorHandling } from '@/lib/error-handler'

async function handleDocsRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  if (format === 'openapi' || format === 'swagger') {
    const spec = generateOpenAPISpec()
    return NextResponse.json(spec)
  }

  if (format === 'html') {
    const html = generateHTMLDocs()
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }

  // Default: return structured documentation
  return NextResponse.json({
    success: true,
    data: {
      title: 'Portfolio API Documentation',
      version: '1.0.0',
      baseUrl: process.env.NODE_ENV === 'production' ? 'https://edikanudoibuot.com' : 'http://localhost:3000',
      endpoints: API_DOCUMENTATION,
      formats: {
        json: '/api/docs',
        openapi: '/api/docs?format=openapi',
        html: '/api/docs?format=html'
      }
    }
  })
}

function generateHTMLDocs(): string {
  const spec = generateOpenAPISpec()
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        body { margin: 0; padding: 0; }
        .swagger-ui .topbar { display: none; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({
            url: '/api/docs?format=openapi',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ],
            layout: "StandaloneLayout",
            docExpansion: 'list',
            operationsSorter: 'alpha',
            tagsSorter: 'alpha',
            tryItOutEnabled: true,
            requestInterceptor: (request) => {
                // Add any custom headers or authentication
                return request;
            },
            responseInterceptor: (response) => {
                return response;
            }
        });
    </script>
</body>
</html>
  `
}

export const GET = withErrorHandling(handleDocsRequest)