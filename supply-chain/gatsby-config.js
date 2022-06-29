module.exports = {
  siteMetadata: {
    title: `supply-chain`,
    siteUrl: `https://www.yourdomain.tld`
  },
  plugins: ["gatsby-plugin-mdx", {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": "details",
      "path": "./details/"
    },
    __key: "pages"
  }]
};
