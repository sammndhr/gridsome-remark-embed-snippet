# gridsome-remark-embed-snippet

> Gridsome markdown remark transformer plugin to embed the contents of specified files as code snippets.

Ported from [gatsby-remark-embed-snippet](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-embed-snippet).

## Install

**Note**: This plugin depends on [@gridsome/transformer-remark](https://github.com/gridsome/gridsome/tree/master/packages/transformer-remark) plugin.

```shell
npm install gridsome-remark-embed-snippet @gridsome/transformer-remark
yarn add gridsome-remark-embed-snippet @gridsome/transformer-remark
```

## Configuration

`gridsome.config.js`

```js
module.exports = {
  transformers: {
    remark: {
      plugins: ['gridsome-remark-embed-snippet'],
    }
  }
}
```

## Usage

1. Given the following project structure and example files `some-code.js` and `example-post/index.md`:

```text
Project structure:

project_root
├── content
│   └── example-post
│       ├── some-code.js
│       └── index.md
├── gridsome.config.js
└── ...
```

`index.md`

```md
# Example javascript embed

`embed:some-code.js`
```

Comments will also work.

```md
# Example javascript embed

<!-- embed:some-code.js -->
```

`some-code.js`

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

```js
// gridsome.config.js
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

```text
project_root
├── content
│   └── example-post-1.md
├── snippets
│   └── example-post-1.js
└── ...
```

```md
<!-- example-post-1.md -->

# Example javascript embed

`embed:example-post-1.js`
```

### Example Usage Two

Even without passing the `directory` option, code snippets don't have to be in the same folder. Just make sure that the path is relative to the directory in which the markdown file is located.

```js
// gridsome.config.js
module.exports = {
  transformers: {
    remark: {
      plugins: ['gridsome-remark-embed-snippet']
    }
  }
}
```

```text
project_root
├── content
│   └── example-post-1.md
├── snippets
│   └── example-post-1.js
└── ...
```

```md
<!-- example-post-1.md -->

# Example javascript embed

`embed:./../snippets/example-post-1.js`
```

### Code snippet syntax highlighting

### Hide Lines

It's also possible to specify a range of lines to be hidden.

You can either specify line ranges in the embed using the syntax:

- #Lx - Embed one line from a file
- #Lx-y - Embed a range of lines from a file
- #Lx-y,a-b - Embed non-consecutive ranges of lines from a file

**Markdown example**:

```markdown
This is the JSX of my app:

`embed:App.js#L6-8`
```

With this example snippet:

```js
import React from "react"
import ReactDOM from "react-dom"

function App() {
  return (
    <div className="App">
      <h1>Hello world</h1>
    </div>
  )
}
```

Will produce something like this:

```markdown
This is the JSX of my app:

    <div className="App">
      <h1>Hello world</h1>
    </div>
```


### Specifying snippets by name

As an alternative to selecting a range of lines from a file, you can add `start-snippet{snippet-name}` and `end-snippet{snippet-name}` in comments in your files. The inclusion of a name for a snippet allows you to create an example file that contains multiple snippets that you reference from different places.

You can specify that you want to only include a named snippet from the embed by using the syntax `{snippet: "snippet-name"}`.

**JavaScript example**:

```markdown
The function to use is:

`embed:api.js{snippet: "funcA"}`

And it is invoked via:

`embed:api.js{snippet: "invokeA"}`
```

With this example file `api.js`:

```javascript
// start-snippet{funcA}
function factorial(x) {
    if (x <= 1) return 1
    else return x * factorial(x - 1)
}
// end-snippet{funcA}

function display() {
    let x = 5
    // start-snippet{invokeA}
    let xfact = factorial(x)
    // end-snippet{invokeA}
    println!(`{} factorial is {}`, x, xfact)
}
```

Will produce something like this:

```markdown
The function to use is:

function factorial(x) {
if (x <= 1) return 1
else return x \* factorial(x - 1)
}

And it is invoked via:

let xfact = factorial(x)
```
