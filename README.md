# IMViewer

![Version](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMViewer/version.svg)
![Build Status](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMViewer/build.svg)
![Unit Tests](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMViewer/unit-test.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=endeavourhealth-discovery_IMViewer&metric=alert_status)](https://sonarcloud.io/dashboard?id=endeavourhealth-discovery_IMViewer)

## Project setup

_The proxy expects IMAPI to be running on localhost:8080_

```
npm install
```

### Run in local/development mode
This will run a local server for development purposes that will watch the source files and
recompile on the fly as they're changed & saved.
```
npm run dev
```

### Run unit tests (watch mode)
Runs the unit tests in watch mode
```
npm run test:unit
```

### Unit test coverage report
Runs the unit test and generates coverage report (not in watch mode)
```
npm run test:coverage
```

### Build for production
This will build the final output, ready for deployment to a production server
```
npm run build
```

### Lints and fixes files

```
npm run lint
```

