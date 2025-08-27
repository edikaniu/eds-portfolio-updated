import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, FileText } from "lucide-react"

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 lg:px-12 xl:px-16">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground">
            The blog post you're looking for doesn't exist or may have been unpublished.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/blog">
            <Button className="w-full sm:w-auto">
              <FileText className="w-4 h-4 mr-2" />
              Browse Blog
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}