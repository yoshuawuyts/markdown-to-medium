#!/usr/bin/env node

const cliclopts = require('cliclopts')
const minimist = require('minimist')
const xtend = require('xtend')
const util = require('util')
const path = require('path')
const Conf = require('conf')
const fs = require('fs')

const pkg = require('../package.json')
const main = require('../')
const conf = new Conf()

const config = {
  token: conf.get('token'),
  id: conf.get('id')
}

const opts = cliclopts([
  { name: 'help', abbr: 'h', boolean: true },
  { name: 'version', abbr: 'v', boolean: true },
  { name: 'token', abbr: 't', string: true },
  { name: 'canonicalUrl', abbr: 'u', string: true },
  { name: 'publication', string: true },
  { name: 'title', string: true },
  { name: 'tags', alias: ['tag'] },
  { name: 'license', abbr: 'l', string: true }
])

const argv = minimist(process.argv.slice(2), opts.options())

// parse options
if (argv.version) {
  const version = require('../package.json').version
  process.stdout.write('v' + version + '\n')
  process.exit(0)
} else if (argv.help) {
  process.stdout.write(pkg.name + ' - ' + pkg.description + '\n')
  usage(0)
} else if (!argv._.length) {
  process.stderr.write('Error: no file specified\n')
  usage(1)
} else if (!argv.token && !config.token) {
  process.stderr.write('Error: no token found\n')
  usage(1)
} else {
  if (argv.token) conf.set('token', argv.token)

  const _conf = xtend(xtend(config, argv), { filename: argv._[0] })
  main(_conf, function (err) {
    if (err) process.stderr.write(util.format(err) + '\n')
    process.exit(err ? 1 : 0)
  })
}

// print usage & exit
// num? -> null
function usage (exitCode) {
  const rs = fs.createReadStream(path.join(__dirname, '/usage.txt'))
  const ws = process.stdout
  rs.pipe(ws)
  ws.on('finish', process.exit.bind(null, exitCode))
}
