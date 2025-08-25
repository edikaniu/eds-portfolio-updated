import { caseStudiesMetadata } from "@/lib/meta-tags"
import { CaseStudiesPageClient } from "@/components/case-studies-page-client"

export const metadata = caseStudiesMetadata

export default function CaseStudiesPage() {
  return <CaseStudiesPageClient />
}