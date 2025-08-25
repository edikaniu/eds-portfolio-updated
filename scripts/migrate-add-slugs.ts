import { PrismaClient } from '@prisma/client'
import { generateSlug, ensureUniqueSlug } from '../lib/slug-utils'

const prisma = new PrismaClient()

async function migrateAddSlugs() {
  console.log('🚀 Starting slug migration...')

  try {
    // Migrate Case Studies
    console.log('📚 Migrating Case Studies...')
    const caseStudies = await prisma.caseStudy.findMany()
    const caseStudySlugs: string[] = []

    for (const study of caseStudies) {
      const baseSlug = generateSlug(study.title)
      const uniqueSlug = ensureUniqueSlug(baseSlug, caseStudySlugs)
      caseStudySlugs.push(uniqueSlug)

      await prisma.caseStudy.update({
        where: { id: study.id },
        data: { slug: uniqueSlug }
      })
      console.log(`✅ Case Study: "${study.title}" → "${uniqueSlug}"`)
    }

    // Migrate Projects
    console.log('💼 Migrating Projects...')
    const projects = await prisma.project.findMany()
    const projectSlugs: string[] = []

    for (const project of projects) {
      const baseSlug = generateSlug(project.title)
      const uniqueSlug = ensureUniqueSlug(baseSlug, projectSlugs)
      projectSlugs.push(uniqueSlug)

      await prisma.project.update({
        where: { id: project.id },
        data: { slug: uniqueSlug }
      })
      console.log(`✅ Project: "${project.title}" → "${uniqueSlug}"`)
    }

    console.log('🎉 Slug migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateAddSlugs()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })