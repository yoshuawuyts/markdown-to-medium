// from https://github.com/jxnblk/writing/blob/gh-pages/medium.js

const frontMatter = require('front-matter')
const medium = require('medium-sdk')
const assert = require('assert')
const open = require('open')
const fs = require('fs')

require('colors') // I guess this is extending strings :/

module.exports = main

// publish a markdown file to medium
function main (options, done) {
  const token = options.token
  const filename = options.filename

  assert.equal(typeof token, 'string', 'markdown-to-medium: token should be a string')

  const slug = filename.replace(/^src\/posts\/|\.md$/g, '')

  const client = new medium.MediumClient({
    clientId: token,
    clientSecret: token
  })

  client.setAccessToken(token)

  var src

  try {
    src = fs.readFileSync(filename, 'utf8')
  } catch (e) {
    throw new Error('Could not read file from /src/posts/' + filename)
  }

  const matter = frontMatter(src)
  const title = matter.attributes.title
  const tags = matter.attributes.tags
  const canonicalUrl = `http://yoshuawuyts.com/writing/${slug}`

  const content = `
  # ${title}

  ${matter.body}

  *Cross-posted from [https://github.com/yoshuawuyts/writing](${canonicalUrl})*
  `

  client.getUser((err, user) => {
    if (err) {
      throw new Error(err)
    }

    console.log(`Authenticated as ${user.username}`.blue)
    client.createPost({
      userId: user.id,
      title,
      tags,
      content,
      canonicalUrl,
      contentFormat: 'markdown',
      publishStatus: 'draft'
    }, (err, post) => {
      if (err) {
        throw new Error(err)
      }

      console.log(
        `Draft post "${title}" published to Medium.com`.green
      )
      open(post.url)
    })
  })
}
