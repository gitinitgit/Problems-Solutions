const fs = require('fs')
const path = require('path')
const { topicSlug } = require('./src/utils/slug')

// One page per week (/week/1/ ...) and one per topic (/concepts/<topic>/)
exports.createPages = ({ actions: { createPage } }) => {
  const q = JSON.parse(fs.readFileSync('content/questions.json', 'utf8'))
  q.weeks.forEach((_, i) =>
    createPage({
      path: `/week/${i + 1}/`,
      component: path.resolve('src/templates/week.js'),
      context: { week: i },
    })
  )
  q.topics.forEach((t, i) => {
    const slug = topicSlug(t)
    createPage({
      path: `/concepts/${slug}/`,
      component: path.resolve('src/templates/concept.js'),
      context: { topic: i, slug },
    })
  })
}
