import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Target } from "lucide-react"

export default function CaseStudyNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 lg:px-12 xl:px-16">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Case Study Not Found</h1>
          <p className="text-muted-foreground">
            The case study you're looking for doesn't exist or may no longer be available.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/#case-studies">
            <Button className="w-full sm:w-auto">
              <Target className="w-4 h-4 mr-2" />
              View Case Studies
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