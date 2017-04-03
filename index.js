//from https://github.com/jxnblk/writing/blob/gh-pages/medium.js
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
  const publication=options.publication

  assert.equal(typeof token, 'string', 'markdown-to-medium: token should be a string')

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
  const canonicalUrl = options.canonicalUrl || ""

  let content = `
  # ${title}

  ${matter.body}

  `
  if (canonicalUrl.length) {
    content += `
    *Cross-posted from [${canonicalUrl}](${canonicalUrl})*
    `
  }

  client.getUser((err, user) => {
    if (err) {
      throw new Error(err)
    }

    console.log(`Authenticated as ${user.username}`.blue)
    const options={
        userId: user.id,
        title,
        tags,
        content,
        canonicalUrl,
        contentFormat: 'markdown',
        publishStatus: 'draft'
    };
    const successMsg=`Draft post "${title}" published to Medium.com`.green;
    if(publication){
        client.getPublicationsForUser({userId:user.id}, (err, publications)=>{
          if (err) {
            throw new Error(err)
          }
          const myPub=publications.filter((val)=>{return val.name===publication});
          if(myPub.length===0){
            throw new Error("No publication by that name!");
          }
          client.createPostInPublication(Object.assign(options, {publicationId:myPub[0].id}), (err, post) => {
            if (err) {
                throw new Error(err)
            }
            console.log(successMsg)
            open(post.url)
          })
      })
    }
    else{
      client.createPost(options, (err, post) => {
        if (err) {
          throw new Error(err)
        }
        console.log(successMsg)
        open(post.url)
      })
    }
    
  })
}