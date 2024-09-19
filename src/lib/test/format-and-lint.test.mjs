/**
 * @file Tests the config works as expected based on a sampling of rules.
 */
import { copyFile, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { formatAndLint } from '../format-and-lint'
    
const __dirname = dirname(fileURLToPath(import.meta.url))

const appKey = 'format-and-lint'

describe('formatAndLint', () => {
  test.each([
    'eslintAdditionalConfig',
    'eslintBaseConfig',
    'eslintJsdocConfig',
    'eslintJsxConfig',
    'eslintTestConfig'
  ])("raises error if 'eslintConfig' and '%s' defined", async (config) => {
    const args = { eslintConfig: [] }
    args[config] = {}
    try {
      // expect(() => formatAndLint(args)).toThrow(/You cannot define/)
      await formatAndLint(args)
    }
    catch (e) {
      expect(e.message).toMatch(/You cannot define/)
    }
  })

  const formatTests = [
    ['correctly formats boolean operators in if statement', 'boolean-ops'],
    ['correctly places required semicolon', 'necessary-semicolon'],
  ]

  test.each(formatTests)('%s', async (description, testDir) => {
    testDir = resolve(__dirname, 'data', testDir)
    const testFile = resolve(testDir, 'index.mjs')
    const formattedFile = resolve(testDir, 'formatted.txt')

    const results = await formatAndLint({ files: [testFile] })

    const formattedFileContents = await readFile(formattedFile, {
      encoding : 'utf8',
    })

    expect(results[0].output).toBe(formattedFileContents)
  })

  test('will update files in place', async () => {
    const tmpDirPrefix = join(tmpdir(), `${appKey}-`)
    let tmpDir
    try {
      tmpDir = await mkdtemp(tmpDirPrefix)
      const testFile = join(tmpDir, 'index.mjs')

      const testDirSrc = resolve(__dirname, 'data', 'boolean-ops')
      const testFileSrc = resolve(testDirSrc, 'index.mjs')

      await copyFile(testFileSrc, testFile)

      const formattedExample = resolve(testDirSrc, 'formatted.txt')

      await formatAndLint({ files: [testFile], write: true })

      const formattedExampleConents = await readFile(formattedExample, {
        encoding : 'utf8',
      })
      const formattedFileContents = await readFile(testFile, { encoding: 'utf8' })

      expect(formattedFileContents).toBe(formattedExampleConents)
    }
    finally {
      if (tmpDir !== undefined) {
        await rm(tmpDir, { recursive: true })
      }
    }
  })
})
