const fs = require(`fs`)
const path = require(`path`)
const visit = require('unist-util-visit')
const normalize = require('normalize-path')
const rangeParser = require(`parse-numeric-range`)

const EXT_TO_LANG_MAP = {
  md: `markup`,
  js: `jsx`,
  rb: `ruby`,
  ps1: `powershell`,
  sh: `bash`,
  bat: `batch`,
  py: `python`,
  psm1: `powershell`,
  tex: `latex`,
  h: `c`,
}

const getFileLang = (file) => {
  if (!file.includes(`.`)) {
    return null
  }

  const extension = file.split(`.`).pop().toLowerCase()

  const lang = EXT_TO_LANG_MAP.hasOwnProperty(extension)
    ? EXT_TO_LANG_MAP[extension]
    : extension

  return lang
}


const embedCode = (node, directory, fileName) => {
  let filePath = normalize(path.join(directory, fileName))

  let lines = []
  let sname = ``
  const rangePrefixIndex = filePath.indexOf(`#L`)
  if (rangePrefixIndex > -1) {
    const range = filePath.slice(rangePrefixIndex + 2)
    if (range.length === 1) {
      lines = [Number.parseInt(range, 10)]
    } else {
      lines = rangeParser(range)
    }
    // Remove everything after the range prefix from file path
    filePath = filePath.slice(0, rangePrefixIndex)
  } else {
    // Check to see if there is a {snippet: "snippetName"} following the file path.
    // This syntax could support additional options in the future - for now, only
    // handle a string that contains a `snippet :` option.
    const optionIndex = filePath.indexOf(`{`)
    if (optionIndex > -1) {
      const optionStr = filePath.slice(optionIndex)
      filePath = filePath.slice(0, optionIndex)
      try {
        const optVal = JSON.parse(
          optionStr.replace(/snippet\s*:/, `"snippet":`)
        )
        if (
          typeof optVal != `undefined` &&
          typeof optVal.snippet != `undefined`
        ) {
          sname = optVal.snippet
        } else {
          throw Error(`Invalid snippet options specified: ${optionStr}`)
        }
      } catch (err) {
        throw Error(`Invalid snippet options specified: ${optionStr}`)
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    throw Error(`Invalid snippet specified; no such file "${filePath}"
    console.log('파일경로', ${directory}, ${fileName}, ${filePath})
    `)
  }

  let code = fs.readFileSync(filePath, 'utf8').trim()
  if (lines.length) {
    code = code
      .split(`\n`)
      .filter((_, lineNumber) => lines.includes(lineNumber + 1))
      .join(`\n`)
  } else if (sname.length) {
    const startSnippetMatcher = new RegExp(
      `start-snippet{${sname}}[^\r\n]*[\r\n](.*)`,
      `gs`
    )
    const startSnippetMatch = startSnippetMatcher.exec(code)
    if (startSnippetMatch && startSnippetMatch.length >= 2) {
      code = startSnippetMatch[1]

      const endSnippetMatcher = new RegExp(
        `(.*)[\r\n][^\r\n]*end-snippet{${sname}}`,
        `gs`
      )
      const endSnippetMatch = endSnippetMatcher.exec(code)
      if(endSnippetMatch && endSnippetMatch.length >= 2) {
        code = endSnippetMatch[1]
      }
    } else {
      code = ``
    }
  }
  const lang = getFileLang(fileName)

  node.type = 'code'
  node.value = code
  node.lang = lang
}

module.exports = (options) => {
  return async (tree, file) => {
    const specifiedDir = options.directory
    const directory = specifiedDir ? specifiedDir : path.dirname(file.path)

    try {
      if (!fs.existsSync(directory)) {
        throw Error(`Invalid directory specified "${directory}"`)
      }

      visit(tree, (node) => {
        const { value } = node

        if (value && value.includes(`<!-- embed:`)) {
          const start = value.indexOf('<!-- embed:') + 11,
            end = value.indexOf(' -->'),
            fileName = value.substring(start, end)
          embedCode(node, directory, fileName)
        }
      })
      visit(tree, 'inlineCode', (node) => {
        const { value } = node
        if (value.startsWith(`embed:`)) {
          const fileName = value.substring(6)
          embedCode(node, directory, fileName)
        }
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
