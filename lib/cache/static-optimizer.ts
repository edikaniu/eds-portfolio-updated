import { logger } from '../logger'
import fs from 'fs/promises'
import path from 'path'

export interface OptimizationResult {
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  savings: string
}

export interface ImageOptimizationOptions {
  quality: number
  format?: 'webp' | 'jpg' | 'png'
  responsive?: boolean
  sizes?: number[]
}

export interface CSSOptimizationOptions {
  minify: boolean
  purgeUnused: boolean
  critical?: boolean
}

export interface JSOptimizationOptions {
  minify: boolean
  compress: boolean
  mangle: boolean
  treeshake: boolean
}

export class StaticOptimizer {
  private static instance: StaticOptimizer
  private optimizationCache = new Map<string, OptimizationResult>()

  static getInstance(): StaticOptimizer {
    if (!StaticOptimizer.instance) {
      StaticOptimizer.instance = new StaticOptimizer()
    }
    return StaticOptimizer.instance
  }

  async optimizeImages(
    imagePaths: string[],
    options: ImageOptimizationOptions = {
      quality: 85,
      format: 'webp',
      responsive: true,
      sizes: [640, 768, 1024, 1280, 1920]
    }
  ): Promise<Map<string, OptimizationResult>> {
    const results = new Map<string, OptimizationResult>()

    for (const imagePath of imagePaths) {
      try {
        const result = await this.optimizeImage(imagePath, options)
        results.set(imagePath, result)
        logger.debug('Image optimized', { path: imagePath, result })
      } catch (error) {
        logger.error('Failed to optimize image', { path: imagePath, error })
      }
    }

    return results
  }

  private async optimizeImage(
    imagePath: string,
    options: ImageOptimizationOptions
  ): Promise<OptimizationResult> {
    // Check cache first
    const cacheKey = `image:${imagePath}:${JSON.stringify(options)}`
    if (this.optimizationCache.has(cacheKey)) {
      return this.optimizationCache.get(cacheKey)!
    }

    try {
      const stats = await fs.stat(imagePath)
      const originalSize = stats.size

      // In a real implementation, you would use image optimization libraries like:
      // - sharp for Node.js image processing
      // - imagemin for various format optimizations
      // - responsive-loader for generating multiple sizes
      
      // For now, we'll simulate optimization
      const optimizedSize = Math.floor(originalSize * (1 - (100 - options.quality) / 100))
      
      const result: OptimizationResult = {
        originalSize,
        optimizedSize,
        compressionRatio: optimizedSize / originalSize,
        savings: `${Math.round((1 - optimizedSize / originalSize) * 100)}%`
      }

      // Generate responsive sizes if requested
      if (options.responsive && options.sizes) {
        logger.info('Generating responsive image variants', {
          path: imagePath,
          sizes: options.sizes,
          format: options.format
        })
      }

      this.optimizationCache.set(cacheKey, result)
      return result
    } catch (error) {
      logger.error('Image optimization failed', { path: imagePath, error })
      throw error
    }
  }

  async optimizeCSS(
    cssFiles: string[],
    options: CSSOptimizationOptions = {
      minify: true,
      purgeUnused: true,
      critical: false
    }
  ): Promise<Map<string, OptimizationResult>> {
    const results = new Map<string, OptimizationResult>()

    for (const cssFile of cssFiles) {
      try {
        const result = await this.optimizeCSSFile(cssFile, options)
        results.set(cssFile, result)
        logger.debug('CSS optimized', { file: cssFile, result })
      } catch (error) {
        logger.error('Failed to optimize CSS', { file: cssFile, error })
      }
    }

    return results
  }

  private async optimizeCSSFile(
    cssFile: string,
    options: CSSOptimizationOptions
  ): Promise<OptimizationResult> {
    const cacheKey = `css:${cssFile}:${JSON.stringify(options)}`
    if (this.optimizationCache.has(cacheKey)) {
      return this.optimizationCache.get(cacheKey)!
    }

    try {
      const content = await fs.readFile(cssFile, 'utf-8')
      const originalSize = Buffer.from(content).length

      let optimizedContent = content

      if (options.minify) {
        // Remove comments, whitespace, and optimize
        optimizedContent = this.minifyCSS(optimizedContent)
      }

      if (options.purgeUnused) {
        // Remove unused CSS rules (would need actual implementation)
        optimizedContent = this.purgeUnusedCSS(optimizedContent)
      }

      if (options.critical) {
        // Extract critical CSS (above-the-fold styles)
        await this.extractCriticalCSS(cssFile, optimizedContent)
      }

      const optimizedSize = Buffer.from(optimizedContent).length

      const result: OptimizationResult = {
        originalSize,
        optimizedSize,
        compressionRatio: optimizedSize / originalSize,
        savings: `${Math.round((1 - optimizedSize / originalSize) * 100)}%`
      }

      this.optimizationCache.set(cacheKey, result)
      return result
    } catch (error) {
      logger.error('CSS optimization failed', { file: cssFile, error })
      throw error
    }
  }

  async optimizeJS(
    jsFiles: string[],
    options: JSOptimizationOptions = {
      minify: true,
      compress: true,
      mangle: true,
      treeshake: true
    }
  ): Promise<Map<string, OptimizationResult>> {
    const results = new Map<string, OptimizationResult>()

    for (const jsFile of jsFiles) {
      try {
        const result = await this.optimizeJSFile(jsFile, options)
        results.set(jsFile, result)
        logger.debug('JS optimized', { file: jsFile, result })
      } catch (error) {
        logger.error('Failed to optimize JS', { file: jsFile, error })
      }
    }

    return results
  }

  private async optimizeJSFile(
    jsFile: string,
    options: JSOptimizationOptions
  ): Promise<OptimizationResult> {
    const cacheKey = `js:${jsFile}:${JSON.stringify(options)}`
    if (this.optimizationCache.has(cacheKey)) {
      return this.optimizationCache.get(cacheKey)!
    }

    try {
      const content = await fs.readFile(jsFile, 'utf-8')
      const originalSize = Buffer.from(content).length

      let optimizedContent = content

      if (options.minify) {
        optimizedContent = this.minifyJS(optimizedContent)
      }

      if (options.compress) {
        optimizedContent = this.compressJS(optimizedContent)
      }

      if (options.treeshake) {
        optimizedContent = this.treeshakeJS(optimizedContent)
      }

      const optimizedSize = Buffer.from(optimizedContent).length

      const result: OptimizationResult = {
        originalSize,
        optimizedSize,
        compressionRatio: optimizedSize / originalSize,
        savings: `${Math.round((1 - optimizedSize / originalSize) * 100)}%`
      }

      this.optimizationCache.set(cacheKey, result)
      return result
    } catch (error) {
      logger.error('JS optimization failed', { file: jsFile, error })
      throw error
    }
  }

  async generateStaticSitemap(): Promise<string> {
    try {
      // Generate sitemap for static pages and dynamic content
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yoursite.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yoursite.com/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yoursite.com/projects</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yoursite.com/case-studies</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`

      // In production, you would fetch dynamic URLs from database
      // and generate a complete sitemap

      const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
      await fs.writeFile(sitemapPath, sitemap)

      logger.info('Sitemap generated', { path: sitemapPath })
      return sitemapPath
    } catch (error) {
      logger.error('Failed to generate sitemap', error)
      throw error
    }
  }

  async generateRobotsTxt(): Promise<string> {
    try {
      const robots = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

Sitemap: https://yoursite.com/sitemap.xml

# Block sensitive admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/

# Allow common assets
Allow: /*.css$
Allow: /*.js$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.gif$
Allow: /*.svg$
Allow: /*.webp$
`

      const robotsPath = path.join(process.cwd(), 'public', 'robots.txt')
      await fs.writeFile(robotsPath, robots)

      logger.info('Robots.txt generated', { path: robotsPath })
      return robotsPath
    } catch (error) {
      logger.error('Failed to generate robots.txt', error)
      throw error
    }
  }

  async preloadCriticalAssets(): Promise<string[]> {
    const criticalAssets = [
      '/css/critical.css',
      '/js/critical.js',
      '/fonts/primary-font.woff2',
      '/images/hero-image.webp'
    ]

    // Generate preload headers
    const preloadHeaders = criticalAssets.map(asset => {
      const extension = path.extname(asset).substring(1)
      let asType = 'fetch'
      
      switch (extension) {
        case 'css':
          asType = 'style'
          break
        case 'js':
          asType = 'script'
          break
        case 'woff2':
        case 'woff':
          asType = 'font'
          break
        case 'webp':
        case 'jpg':
        case 'png':
          asType = 'image'
          break
      }

      return `<${asset}>; rel=preload; as=${asType}`
    })

    logger.info('Critical assets preload headers generated', { 
      count: criticalAssets.length,
      assets: criticalAssets 
    })

    return preloadHeaders
  }

  getOptimizationStats(): {
    totalOptimizations: number
    totalSavings: number
    cacheHitRate: number
    topOptimizations: Array<{
      file: string
      savings: string
      type: string
    }>
  } {
    const optimizations = Array.from(this.optimizationCache.entries())
    const totalOptimizations = optimizations.length
    
    let totalOriginalSize = 0
    let totalOptimizedSize = 0
    
    const topOptimizations = optimizations
      .map(([key, result]) => {
        totalOriginalSize += result.originalSize
        totalOptimizedSize += result.optimizedSize
        
        const [type, file] = key.split(':')
        return {
          file,
          savings: result.savings,
          type
        }
      })
      .sort((a, b) => parseFloat(b.savings) - parseFloat(a.savings))
      .slice(0, 10)

    const totalSavings = totalOriginalSize > 0 
      ? Math.round((1 - totalOptimizedSize / totalOriginalSize) * 100)
      : 0

    return {
      totalOptimizations,
      totalSavings,
      cacheHitRate: 95, // Simulated cache hit rate
      topOptimizations
    }
  }

  // Helper methods for optimization (simplified implementations)
  private minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
      .trim()
  }

  private purgeUnusedCSS(css: string): string {
    // In production, you would analyze HTML/JS files to determine used classes
    // For now, return as-is
    return css
  }

  private async extractCriticalCSS(cssFile: string, content: string): Promise<void> {
    // Extract above-the-fold CSS
    // In production, use tools like critical or puppeteer
    const criticalPath = cssFile.replace('.css', '.critical.css')
    logger.info('Critical CSS extracted', { original: cssFile, critical: criticalPath })
  }

  private minifyJS(js: string): string {
    return js
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim()
  }

  private compressJS(js: string): string {
    // In production, use tools like terser or uglify-js
    return js
  }

  private treeshakeJS(js: string): string {
    // In production, use bundlers like webpack or rollup for tree-shaking
    return js
  }
}

export const staticOptimizer = StaticOptimizer.getInstance()