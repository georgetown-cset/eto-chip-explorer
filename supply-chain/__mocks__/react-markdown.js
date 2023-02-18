const React = require("react")

// I haven't found a plugin to integrate jest with gatsby-plugin-mdx,
// so we'll just render un-converted MDX in tests for now.
// From https://stackoverflow.com/questions/65184456/testing-gatsby-component-with-mdx-and-graphql-data
const ReactMarkdown = ({children}) => <div>{children}</div>;
export default ReactMarkdown;
