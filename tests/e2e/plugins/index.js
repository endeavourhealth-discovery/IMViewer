const cucumber = require("cypress-cucumber-preprocessor").default;

module.exports = (on, config) => {
  on("file:preprocessor", cucumber());

  return Object.assign({}, config, {
      fixturesFolder: "tests/e2e/fixtures",
      specPattern: "tests/e2e/specs",
      screenshotsFolder: "tests/e2e/screenshots",
      videosFolder: "tests/e2e/videos",
      supportFile: "tests/e2e/support/index.js"
  });
}
