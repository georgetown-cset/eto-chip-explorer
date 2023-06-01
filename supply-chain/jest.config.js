module.exports = {
  transform: {
    "^.+\\.jsx?$": `<rootDir>/jest-preprocess.js`,
  },
  moduleNameMapper: {
    ".+\\.(css|styl|less|sass|scss)$": `identity-obj-proxy`,
    ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": `<rootDir>/__mocks__/file-mock.js`,
  },
  testPathIgnorePatterns: [`node_modules`, `\\.cache`, `<rootDir>.*/public`],
  transformIgnorePatterns: [`node_modules/(?!(gatsby|gatsby-plugin-mdx|@eto|@mui|@mdx-js|d3.*|internmap|delaunator|robust-predicates)/)`],
  globals: {
    __PATH_PREFIX__: ``,
  },
  setupFiles: [
    `<rootDir>/loadershim.js`,
    'jest-canvas-mock',
  ],
  setupFilesAfterEnv: ["<rootDir>/setup-test-env.js"],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!**/__tests__/**',
  ],
  // TBD - we have not decided on these yet
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: -10,
  //   },
  // },
}
