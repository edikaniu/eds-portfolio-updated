import { prisma } from '../lib/prisma'

async function updateProjectCategories() {
  console.log('🔄 Updating project categories...')
  
  try {
    // Update specific projects to be tools vs workflows
    const updates = [
      // Tools
      { slug: "ai-powered-seo-keyword-tool", category: "SEO Tools" },
      { slug: "conversion-rate-optimization-tool", category: "CRO Tools" },
      { slug: "marketing-roi-calculator", category: "Marketing Tools" },
      { slug: "hubspot-lead-scoring-system", category: "Sales Tools" },
      
      // Workflows  
      { slug: "ai-content-automation-workflow", category: "Content Automation" },
      { slug: "email-growth-funnel", category: "Email Automation" }, 
      { slug: "social-media-automation-suite", category: "Social Media Automation" },
      { slug: "lead-qualification-workflow", category: "Sales Automation" }
    ]

    for (const update of updates) {
      await prisma.project.update({
        where: { slug: update.slug },
        data: { category: update.category }
      })
      console.log(`✅ Updated ${update.slug} to category: ${update.category}`)
    }
    
    console.log('🎉 Successfully updated project categories!')
  } catch (error) {
    console.error('❌ Error updating categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProjectCategories()