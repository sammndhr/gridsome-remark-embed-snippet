const fs = require(`fs`),
  Remark = require(`remark`),
  GridsomeRemarkEmbedSnippet = require(`../index`),
  remark = new Remark()

function createPlugin(options = {}) {
  return GridsomeRemarkEmbedSnippet(options)
}

jest.mock(`fs`, () => {
  return {
    existsSync: jest.fn(),
    readFileSync: jest.fn()
  }
})

describe(`gridsome-remark-embed-snippet`, () => {
  beforeEach(() => {
    fs.existsSync.mockReset()
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReset()
    fs.readFileSync.mockReturnValue(`console.log('testo');`)
  })

  test(`missing optional config options doesn't throw error`, () => {
    const mockMDContent = '`embed:test.js`',
      mockFile = { path: '/_tests_/test.md' },
      tree = remark.parse(mockMDContent),
      plugin = createPlugin({})

    plugin(tree, mockFile).then(results => {
      expect(results).toMatchSnapshot()
    })
  })

  test(`nonexistent specified directory throws error`, () => {
    fs.existsSync.mockReturnValue(false)

    const mockMDContent = '`embed:test.js`',
      mockFile = { path: '/_tests_/test.md' },
      tree = remark.parse(mockMDContent),
      plugin = createPlugin({ directory: `invalid` }),
      error = `Invalid directory specified "invalid"`

    return expect(plugin(tree, mockFile)).rejects.toThrow(error)
  })

  test(`invalid embed file path throws error`, () => {
    fs.existsSync.mockImplementation(path => path !== `examples/test.js`)

    const mockMDContent = '`embed:test.js`',
      mockFile = { path: '/_tests_/test.md' },
      tree = remark.parse(mockMDContent),
      plugin = createPlugin({ directory: `examples` }),
      error = `Invalid snippet specified; no such file "examples/test.js"`

    return expect(plugin(tree, mockFile)).rejects.toThrow(error)
  })
})

//Todo: Write more tests. Read more about tests.
// i_have_no_idea_what_i'm_doing.jpg
