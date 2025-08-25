import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { BlogPageClient } from "@/components/blog-page-client"
import { blogMetadata } from "@/lib/meta-tags"

export const metadata = blogMetadata

// Function to fetch blog posts from the API
async function getBlogPosts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/api/blog`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts')
    }
    
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    // Return fallback data in case of API failure
    return []
  }
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts()
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16 py-12 pt-20">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12">
            <Link href="/#blog">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Blog & Insights</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Deep dives into marketing strategies, growth tactics, and industry insights from my experience scaling
              products and driving meaningful results
            </p>
          </div>

            {/* Client-side interactive components */}
            <BlogPageClient posts={blogPosts} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}