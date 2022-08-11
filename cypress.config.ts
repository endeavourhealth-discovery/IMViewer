import { defineConfig } from 'cypress'

export default defineConfig({
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',
  chromeWebSecurity: false,
  env: {
    'VITE_API=http': '//localhost:8082/',
  },
  fixturesFolder: 'tests/e2e/fixtures',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./tests/e2e/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8082',
    specPattern: 'tests/e2e/specs/**/*.{feature,features}',
    supportFile: 'tests/e2e/support/index.js',
  },
  component: {
    setupNodeEvents(on, config) {},
    specPattern: 'tests/e2e/specs/**/*_spec.js',
  },
})
