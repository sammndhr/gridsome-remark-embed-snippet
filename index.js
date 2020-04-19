const fs = require(`fs`)
const path = require(`path`)
const visit = require('unist-util-visit')
const normalize = require('normalize-path')

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
  const filePath = normalize(path.join(directory, fileName))

  if (!fs.existsSync(filePath)) {
    throw Error(`Invalid snippet specified; no such file "${filePath}"`)
  }

  const code = fs.readFileSync(filePath, 'utf8').trim()
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
