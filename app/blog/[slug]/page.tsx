import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"
import { generateBlogPostMetadata } from "@/lib/meta-tags"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  
  const blogPost = await prisma.blogPost.findUnique({
    where: { slug: slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  if (!blogPost || !blogPost.publishedAt) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  // Parse tags
  const tags = blogPost.tags ? blogPost.tags.split(',').map(tag => tag.trim()) : []

  return generateBlogPostMetadata({
    ...blogPost,
    tags,
  })
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const blogPost = await prisma.blogPost.findUnique({
    where: { slug: slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      featuredImage: true,
      category: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  if (!blogPost || !blogPost.publishedAt) {
    notFound()
  }

  // Parse tags
  const tags = blogPost.tags ? blogPost.tags.split(',').map(tag => tag.trim()) : []
  
  // Calculate reading time (rough estimate: 200 words per minute)
  const wordCount = blogPost.content.split(' ').length
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16 py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>

            {/* Hero Section */}
            <article className="mb-12">
              {blogPost.category && (
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  {blogPost.category}
                </Badge>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {blogPost.title}
              </h1>
              
              {blogPost.excerpt && (
                <p className="text-xl text-muted-foreground mb-8">
                  {blogPost.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Edikan Udoibuot
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(blogPost.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {readingTime} min read
                </div>
              </div>
              
              {blogPost.featuredImage && (
                <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
                  <img
                    src={blogPost.featuredImage}
                    alt={blogPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </article>

            {/* Content */}
            <Card className="p-8 mb-8">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted"
                dangerouslySetInnerHTML={{ __html: blogPost.content }}
              />
            </Card>

            {/* Tags */}
            {tags.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}