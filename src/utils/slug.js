// CommonJS so gatsby-node.js can use it too
exports.topicSlug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
