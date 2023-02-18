const { createFilePath } = require('gatsby-source-filesystem');

exports.onCreateNode = ({ node, getNode, actions: { createNodeField } }) => {
  if ( node.internal.type === 'Mdx' ) {
    createNodeField({
      node,
      name: 'slug',
      value: createFilePath({ node, getNode }).replaceAll("_", "-").replaceAll("/", ""),
    });
  }
}
