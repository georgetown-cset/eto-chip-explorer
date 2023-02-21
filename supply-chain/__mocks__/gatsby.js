const React = require("react")
const gatsby = jest.requireActual("gatsby")

module.exports = {
  ...gatsby,
  graphql: jest.fn(),
  Link: jest.fn().mockImplementation(
    // these props are invalid for an `a` tag
    ({
      activeClassName,
      activeStyle,
      getProps,
      innerRef,
      partiallyActive,
      ref,
      replace,
      to,
      ...rest
    }) =>
      React.createElement("a", {
        ...rest,
        href: to,
      })
  ),
  StaticQuery: jest.fn(),
  useStaticQuery: jest.fn().mockReturnValue({
    site: {
      buildTime: "January 31, 2022"
    },
    images: {
      nodes: [
        {id: "N8", name: "N8.JPG", publicURL: "../src/images/nodes/N8.jpg"},
        {id: "N35", name: "N35.JPG", publicURL: "../src/images/nodes/N35.JPG"},
        {id: "N69", name: "N69.jpg", publicURL: "../src/images/nodes/N69.jpg"},
        {id: "S3", name: "S3.jpg", publicURL: "../src/images/nodes/S3.jpg"},
      ]
    },
    pdfs: {
      nodes: [
        {id: "N8", name: "N8.pdf", publicURL: "../src/pdfs/N8.pdf"},
        {id: "N35", name: "N35.pdf", publicURL: "../src/pdfs/N35.pdf"},
        {id: "N69", name: "N69.pdf", publicURL: "../src/pdfs/N69.pdf"},
        {id: "S3", name: "S3.pdf", publicURL: "../src/pdfs/S3.pdf"}
      ]
    },
    allMdx: {
      nodes: [
        {fields: {slug: "N8"}, body: "Some text about N8"},
        {fields: {slug: "N59"}, body: "Some text about N59"},
        {fields: {slug: "N35"}, body: "Some text about N35"},
        {fields: {slug: "S3"}, body: "Some text about S3"},
      ]
    }
  })
}
