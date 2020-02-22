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
	h: `c`
}

const getFileLang = file => {
	if (!file.includes(`.`)) {
		return null
	}

	const extension = file
		.split(`.`)
		.pop()
		.toLowerCase()

	const lang = EXT_TO_LANG_MAP.hasOwnProperty(extension)
		? EXT_TO_LANG_MAP[extension]
		: extension

	return lang
}

module.exports = options => {
	return async (tree, file) => {
		const specifiedDir = options.directory
		const directory = specifiedDir ? specifiedDir : path.dirname(file.path)

		try {
			if (!fs.existsSync(directory)) {
				throw Error(`Invalid directory specified "${directory}"`)
			}

			visit(tree, 'inlineCode', node => {
				const { value } = node

				if (value.startsWith(`embed:`)) {
					const fileName = value.substr(6)
					const filePath = normalize(path.join(directory, fileName))

					if (!fs.existsSync(filePath)) {
						throw Error(
							`Invalid snippet specified; no such fileName "${filePath}"`
						)
					}

					const code = fs.readFileSync(filePath, 'utf8').trim()
					const lang = getFileLang(fileName)

					node.type = 'code'
					node.value = code
					node.lang = lang
				}
			})
		} catch (error) {
			console.log(error)
		}
	}
}
