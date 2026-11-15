/**
 * Build step: validate the content, then write src/content/level1.json.
 *   node scripts/build-content.ts               preview build (drafts kept, flagged)
 *   node scripts/build-content.ts --production  approved content only
 * Fails (exit 1) if any validator fails or the content is not usable.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { buildLevel1, ContentError } from './content-lib.ts'

const mode = process.argv.includes('--production') ? 'production' : 'preview'
const checks: string[][] = [
  ['tools/validate.py', 'content/sessions.yaml'],
  ['tools/validate_items.py', 'content/items.yaml', 'content/sessions.yaml', 'content/test-outs.md'],
  ['tools/lint_content.py'],
]

try {
  for (const args of checks) execFileSync('python3', args, { stdio: 'inherit' })
} catch {
  console.error('Content checks failed. Nothing was built.')
  process.exit(1)
}

try {
  const out = buildLevel1(
    readFileSync('content/sessions.yaml', 'utf8'),
    readFileSync('content/items.yaml', 'utf8'),
    readFileSync('content/test-outs.md', 'utf8'),
    mode,
  )
  mkdirSync('src/content', { recursive: true })
  writeFileSync('src/content/level1.json', JSON.stringify(out, null, 2))
  console.log(`${mode} content: ${out.lessons.length} lessons, ${out.items.length} items.`)
} catch (e) {
  if (e instanceof ContentError) {
    console.error(e.message)
    process.exit(1)
  }
  throw e
}
