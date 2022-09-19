module.exports = {
  siteMetadata: {
    title: `supply-chain`,
    siteUrl: `https://www.yourdomain.tld`
  },
  plugins: [
    "gatsby-plugin-mdx",
    "gatsby-plugin-sass",
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        "name": "pages",
        "path": "./src/pages"
      },
      __key: "pages"
    }, {
      resolve: 'gatsby-source-filesystem',
      options: {
        "name": "images",
        "path": "./src/images"
      },
      __key: "images"
    }, {
      resolve: 'gatsby-source-filesystem',
      options: {
        "name": "pdfs",
        "path": "./src/pdfs"
      },
      __key: "pdfs"
    },
    {
      resolve: "gatsby-plugin-plausible",
      options: {
        domain: "chipexplorer.eto.tech",
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/favicon.svg"
      },
    },
  ]
};
