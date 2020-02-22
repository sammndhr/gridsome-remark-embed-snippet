# gridsome-remark-embed-snippet

> Gridsome markdown remark transformer plugin to embed the contents of specified files as code snippets.

This plugin is the gridsome equivalent of the [gatsby-remark-embed-snippet](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-embed-snippet) plugin.

## Install

**Note**: This plugin depends on [@gridsome/transformer-remark](https://github.com/gridsome/gridsome/tree/master/packages/transformer-remark) plugin.

```shell
npm install gridsome-remark-embed-snippet @gridsome/transformer-remark
yarn add gridsome-remark-embed-snippet @gridsome/transformer-remark
```

## Configuration

1. `gridsome.config.js`

```js
module.exports = {
  transformers: {
    remark: {
      plugins: ['gridsome-remark-embed-snippet']
    }
  }
}
```

## Usage

1. Given the following project structure and example files `some-code.js` and `example-post/index.md`:

Project structure:

```text
project_root
├── content
│   └── example-post
│       ├── some-code.js
│       └── index.md
├── gridsome.config.js
└── ...
```

`index.md`:

```md
# Example javascript embed

`embed:some-code.js`
```

`some-code.js`:

```js
function someFunc() {
  console.log('testo')
}
```

The resulting generated markdown will be:

```html
<h1>Example javascript embed</h1>
<pre>
  <code class="language-jsx">
    function someFunc() {
      console.log('testo')
    }
  </code>
</pre>
```

## Note

> Usage with `@gridsome/remark-prismjs` requires `gridsome-remark-embed-snippet` to be ordered **_before_** `@gridsome/remark-prismjs`. The code needs to be embedded (and to exist) for prism to transform it.

```js
module.exports = {
  transformers: {
    remark: {
      plugins: ['gridsome-remark-embed-snippet', '@gridsome/remark-prismjs']
    }
  }
}
```

## Options

`directory`: Optionally, specify location of snippet files and pass in `directory` option. If `directory` option isn't specified, the plugin will use the path that it finds in the markdown file.

### Example Usage One

**Configuration**

`gridsome.config.js`

```js
module.exports = {
  transformers: {
    remark: {
      plugins: [
        [
          'gridsome-remark-embed-snippet',
          {
            directory: `${__dirname}/snippets/`
          }
        ]
      ]
    }
  }
}
```

**Usage**

```text
project_root
├── content
│   └── example-post-1.md
├── snippets
│   └── example-post-1.js
└── ...
```

`example-post-1.md`

```md
# Example javascript embed

`embed:example-post-1.js`
```

### Example Usage Two

Even without passing the `directory` option, code snippets don't have to be in the same folder. Just make sure that the path is relative to the directory in which the markdown file is located.

**Configuration**

`gridsome.config.js`

```js
module.exports = {
  transformers: {
    remark: {
      plugins: ['gridsome-remark-embed-snippet']
    }
  }
}
```

**Usage**

```text
project_root
├── content
│   └── example-post-1.md
├── snippets
│   └── example-post-1.js
└── ...
```

`example-post-1.md`

```md
# Example javascript embed

`embed:./../snippets/example-post-1.js`
```
