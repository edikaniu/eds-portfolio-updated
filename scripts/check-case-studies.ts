import { prisma } from '../lib/prisma'

async function checkCaseStudies() {
  try {
    console.log('Checking case studies in database...')
    
    const caseStudies = await prisma.caseStudy.findMany({
      orderBy: { order: 'asc' }
    })
    
    console.log(`Found ${caseStudies.length} case studies in database:`)
    caseStudies.forEach((study, index) => {
      console.log(`${index + 1}. ${study.title} (ID: ${study.id})`)
      console.log(`   Active: ${study.isActive}`)
      console.log(`   Category: ${study.category}`)
      console.log(`   Order: ${study.order}`)
      console.log()
    })

  } catch (error) {
    console.error('Error checking case studies:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCaseStudies()