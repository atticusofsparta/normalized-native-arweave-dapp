# Super Awesome Application title here

A brief description of your project.

## Installation

To use this template, create a new repository and select `template-react-tailwind` as the template to create from.

Next, clone the repository and install the dependencies. `yarn` is preffered.

```bash
yarn
```

or

```bash
npm install
```

### Command usage

- `yarn build`: Cleans the project, compiles TypeScript files, and builds the project using Vite.

- `yarn clean`: Removes the dist directory.

- `yarn dev`: Starts the Vite development server with production environment variables.

- `yarn format`: Formats all files in the project using Prettier.

- `yarn lint:fix`: Fixes linting issues in the project using ESLint.

- `yarn lint:check`: Checks for linting issues in the project using ESLint.

- `yarn preview`: Starts the Vite preview server.

- `yarn test`: Runs Jest tests in a sequential manner.

- `yarn test`:updateSnapshot: Updates Jest snapshots.

- `yarn test`:coverage: Runs Jest tests and generates a coverage report.

- `yarn prepare`: Sets up Husky for Git hooks.

- `yarn pre-commit`: Runs lint-staged to check for linting issues in staged files before committing.

- `yarn vis`: Visualizes the bundle size using vite-bundle-visualizer.

# Configuration

The following development tools will require configuration before they are used.

### Firebase

In the github secrets of the repository, set the following:

- `FIREBASE_CI_SERVICE_ACCOUNT`
- `GITHUB_TOKEN`

More details on configuration [here](https://github.com/FirebaseExtended/action-hosting-deploy/tree/v0/)

> We use Firebase for hosting feature branches on temporary URL's that expire after 2 weeks. These are deployed via the firebase github action using the [PR action](./.github/workflows//pr.yml) and the production site is deployed with the [production action](./.github/workflows/production.yml)

### Style-dictionary

TODO: configure style dictionary with figma tooling scripts

> We use style-dictionary to transform style tokens into a format consumable by tailwind.

### Sentry

In the github secrets of the repository, set the following:

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_DSN_PUBLIC_KEY`
- `SENTRY_DSN_PROJECT_URI`
- `SENTRY_DSN_PROJECT_ID`

> We use sentry for application status and alerts

### Github Pages

In the github variables of the repository, set the following:

- `DOMAIN_NAME` (e.g. google.com, this will set the CNAME record)

> We use Github pages for hosting our staging branch with the [build_and_test action](./.github/workflows/build_and_test.yml)

## Contributing

### State Management

- State management is done with Zustand. Defaults to the `useGlobalState` hook created in the `services` folder with the `theme` and `setTheme` state and reducer.

### Page Creation

- Pages should be created in the `pages` folder with the route set up in the [App.tsx](./src//App.tsx) file.
- Pages should be wrapped in the Suspense tag and lazy-loaded.

See [App.tsx](./src//App.tsx) for the default Home page configuration.

### Component Creation

- Components should be created and put in the respective parent folder - eg, buttons, inputs, cards, and so on.
- Components should have unit tests.

### Testing

- Pages should also have unit tests.
- Services, such as HTTP clients or API data providers, should be put in the `services` folder and have both unit and integration tests.
- End-to-end testing should be performed with any services used, locally run in a Docker container.

### Services Creation

- Services, such as HTTP clients or API data providers, should be put in the `services` folder.
- Services should have both unit and integration tests.

### Design Updates

- Design updates (e.g. color and radius changes), should be performed through the use of design tokens, styles dictionary, and the Tailwind config, for maintainability.
