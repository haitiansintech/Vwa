import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  canonicalDomain,
  canonicalizeDiscoveryUrl,
  classifyConfidence,
  classifyLink,
  extractLinks,
  isPathAllowedByRobots,
  sanitizeEvidenceText,
} from '@/lib/party-monitor/discovery'

test('canonical URLs remove tracking and preserve stable query parameters', () => {
  assert.equal(
    canonicalizeDiscoveryUrl('HTTPS://WWW.EDE.HT:443/a?utm_source=x&id=2&fbclid=y#z'),
    'https://www.ede.ht/a?id=2'
  )
  assert.equal(
    canonicalizeDiscoveryUrl('https://www.facebook.com/edehaiti/'),
    'https://www.facebook.com/edehaiti'
  )
  assert.throws(() =>
    canonicalizeDiscoveryUrl('https://twitter.com/https://twitter.com/edehaiti2021')
  )
  assert.equal(canonicalDomain('https://www.ede.ht/a'), 'ede.ht')
})

test('EDE-style fixture extracts JSON-LD social links and a platform candidate', async () => {
  const html = await readFile('tests/fixtures/ede-home.html', 'utf8')
  const links = extractLinks(html, 'https://ede.ht/')
  assert.ok(links.includes('https://www.facebook.com/edehaiti'))
  assert.ok(links.includes('https://www.instagram.com/edehaiti'))
  assert.ok(links.includes('https://ede.ht/orientation-programmatique'))
  assert.equal(classifyLink('https://ede.ht/orientation-programmatique/'), 'platform_page')
  assert.equal(classifyLink('https://ede.ht/plan-du-site/'), null)
  assert.equal(classifyLink('https://x.com/edehaiti'), 'x')
})

test('confidence rules are explainable and never imply publication', () => {
  const result = classifyConfidence({
    officialName: 'Les Engagés pour le Développement',
    acronym: 'EDE',
    pageText: 'Les Engagés pour le Développement (EDE), parti politique',
    linkedFromCandidateWebsite: true,
  })
  assert.equal(result.confidence, 'high')
  assert.deepEqual(result.reasons, [
    'official_name_match',
    'acronym_match',
    'linked_from_candidate_website',
  ])
  assert.equal(
    classifyConfidence({
      officialName: 'EDE',
      acronym: 'EDE',
      pageText: 'search snippet',
      linkedFromCandidateWebsite: false,
      searchOnly: true,
    }).confidence,
    'low'
  )
})

test('crawler helpers sanitize excerpts and honor robots precedence', () => {
  assert.equal(
    sanitizeEvidenceText('<script>alert(1)</script><b>EDE &amp; Haiti</b>'),
    'EDE & Haiti'
  )
  assert.equal(
    isPathAllowedByRobots(
      'User-agent: *\nDisallow: /private\nAllow: /private/public',
      '/private/secret'
    ),
    false
  )
  assert.equal(
    isPathAllowedByRobots(
      'User-agent: *\nDisallow: /private\nAllow: /private/public',
      '/private/public/a'
    ),
    true
  )
})

test('GitHub Actions exposes static URL-seed discovery without database dependencies', async () => {
  const workflow = await readFile('.github/workflows/party-presence-monitor.yml', 'utf8')
  assert.match(workflow, /discover_seed/)
  assert.match(workflow, /seed_url:/)
  assert.match(workflow, /monitor:discover/)
  assert.match(workflow, /create-pull-request/)
  assert.doesNotMatch(workflow, /DATABASE_URL|prisma migrate|party-discovery-worker/)
})
