const { createFilePath } = require('gatsby-source-filesystem');

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
    type Mdx implements Node {

      body: String
      fields: MdxFields
    }

    type MdxFields {
      slug: String
    }
  `;
  createTypes(typeDefs)
}

exports.onCreateNode = ({ node, getNode, actions: { createNodeField } }) => {
  if ( node.internal.type === 'Mdx' ) {
    createNodeField({
      node,
      name: 'slug',
      value: createFilePath({ node, getNode }).replaceAll("_", "-").replaceAll("/", ""),
    });
  }
}
