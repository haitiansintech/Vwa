import { validatePoliticalPartyDataset } from '../lib/political-parties'

const result = validatePoliticalPartyDataset()

console.log(`Total records: ${result.total}`)
console.log(`Approved: ${result.approved}`)
console.log(`Not approved: ${result.notApproved}`)
console.log(`Unique CEP sequences: ${result.uniqueSequences}`)
console.log(`Manual review required: ${result.needsReview.length}`)
for (const party of result.needsReview) {
  console.log(
    `- ${party.sequence}: ${party.name ?? 'source row absent'} (${party.acronym ?? 'no acronym'}) — ${party.verification}`
  )
}
