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
    allFile: {
      nodes: [
        {id: "N35", name: "N35.JPG", publicURL: "../src/images/N35.JPG"},
        {id: "N69", name: "N69.jpg", publicURL: "../src/images/N69.jpg"}
      ]
    },
    allMdx: {
      nodes: [
        {slug: "N59", body: "Some text about N59"},
        {slug: "N35", body: "Some text about N35"},
      ]
    }
  })
}
