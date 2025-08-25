import { caseStudiesMetadata } from "@/lib/meta-tags"
import { CaseStudiesPageClient } from "@/components/case-studies-page-client"

export const metadata = caseStudiesMetadata

export default function CaseStudiesPage() {
  return <CaseStudiesPageClient />
}

interface CaseStudy {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  fullDescription: string
  image: string | null
  metrics: {
    primary: string
    primaryLabel: string
    secondary: string
    secondaryLabel: string
  }
  results: string[]
  tools: string[]
  category: string
  color: string
  icon: string | null
  challenge: string
  solution: string
  timeline: any[]
  order: number
}

export default function CaseStudiesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [visibleCards, setVisibleCards] = useState<string[]>([])
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch case studies from API
  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        const response = await fetch('/api/case-studies')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            console.log('Case studies page: fetched', data.data.length, 'case studies')
            setCaseStudies(data.data || [])
            // Extract unique categories and add "All" option
            const uniqueCategories = Array.from(new Set(data.data.map((study: CaseStudy) => study.category)))
            console.log('Categories found:', uniqueCategories)
            setCategories(['All', ...uniqueCategories])
          }
        }
      } catch (error) {
        console.error('Error fetching case studies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCaseStudies()
  }, [])

  const filteredCaseStudies = caseStudies.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || study.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("All")
  }

  // Separate effect for resetting visible cards when filters change
  useEffect(() => {
    setVisibleCards([])
  }, [selectedCategory, searchTerm])

  // Separate effect for setting up intersection observer
  useEffect(() => {
    if (loading || caseStudies.length === 0) return

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute("data-case-study") || ""
              setVisibleCards((prev) => {
                if (!prev.includes(id)) {
                  return [...prev, id]
                }
                return prev
              })
            }
          })
        },
        { threshold: 0.1 },
      )

      const elements = document.querySelectorAll("[data-case-study]")
      elements.forEach((el) => observer.observe(el))

      return () => observer.disconnect()
    }, 100)

    return () => clearTimeout(timer)
  }, [loading, caseStudies.length, selectedCategory, searchTerm])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-6 lg:px-12 xl:px-16 max-w-7xl py-12 pt-20">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Case Studies</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore detailed case studies showcasing real results from strategic marketing campaigns and growth
              initiatives that delivered measurable impact across various industries and business objectives.
            </p>
            <div className="mt-6">
              <Badge variant="outline" className="text-sm">
                {filteredCaseStudies.length} Case Studies Available
              </Badge>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-card/30 rounded-lg p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search case studies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "All" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchTerm || selectedCategory !== "All") && (
                <Button variant="outline" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
            {(searchTerm || selectedCategory !== "All") && (
              <div className="mt-3 text-sm text-muted-foreground">
                {filteredCaseStudies.length} case stud{filteredCaseStudies.length !== 1 ? 'ies' : 'y'} found
              </div>
            )}
          </div>

          {/* Case Studies Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-64 bg-muted"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              filteredCaseStudies.map((study, index) => (
              <Card
                key={study.id}
                data-case-study={study.id}
                className={`group relative overflow-hidden bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-500 cursor-pointer h-full ${
                  visibleCards.includes(study.id) ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredCard(study.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={study.image || "/placeholder.svg"}
                    alt={study.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`bg-gradient-to-r ${study.color} text-white border-0 text-xs`}>
                      {study.category}
                    </Badge>
                  </div>

                  {/* Primary Metric Overlay */}
                  <div className="absolute bottom-3 right-3 text-right">
                    <div className="text-2xl font-bold text-white">{study.metrics.primary}</div>
                    <div className="text-xs text-white/80">{study.metrics.primaryLabel}</div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${study.color} text-white flex-shrink-0`}>
                      {study.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">{study.title}</h3>
                      <p className="text-primary font-medium text-sm line-clamp-1">{study.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3 flex-grow">
                    {study.description}
                  </p>

                  {/* Metrics Row */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-1 shrink-0">
                      <Target className="h-3 w-3 text-primary" />
                      <span className="font-semibold text-foreground break-words">{study.metrics.primary}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Calendar className="h-3 w-3 text-accent" />
                      <span className="font-semibold text-foreground break-words">{study.metrics.secondary}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/case-study/${study.slug}`} className="mt-auto">
                    <Button
                      size="sm"
                      className={`w-full bg-gradient-to-r ${study.color} hover:opacity-90 text-white border-0 transition-all duration-300`}
                    >
                      View Case Study
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
            )}
          </div>

          {/* Results Summary */}
          <div className="mb-12">
            <Card className="p-8 bg-gradient-to-r from-primary/10 via-accent/10 to-green-500/10 border-primary/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Combined Impact</h3>
                <p className="text-muted-foreground">Measurable results across all growth initiatives</p>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">200k+</div>
                  <div className="text-sm text-muted-foreground">Users Scaled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">733%</div>
                  <div className="text-sm text-muted-foreground">Subscribers Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">$500k+</div>
                  <div className="text-sm text-muted-foreground">Budget Scaled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">5x</div>
                  <div className="text-sm text-muted-foreground">ROAS</div>
                </div>
              </div>
            </Card>
          </div>
      </div>

      <Footer />
    </div>
  )
}