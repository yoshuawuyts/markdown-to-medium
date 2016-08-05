const test = require('tape')
const markdownToMedium = require('./')

test('should assert input types', function (t) {
  t.plan(1)
  t.throws(markdownToMedium)
})
