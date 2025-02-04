## Initial etc/hosts setup

In order to access the https://[env].foo.redhat.com in your browser, you have to add entries to your `/etc/hosts` file. This is a **one-time** setup that has to be done only once (unless you modify hosts) on each machine.

To setup the hosts file run following command:

```bash
npm run patch:hosts
```

If this command throws an error, you may need to install NPM system wide with `sudo yum install npm` and run it as a `sudo`:

```bash
sudo npm run patch:hosts
```

Alternativly, simply add these lines to your /etc/hosts:

```
127.0.0.1 prod.foo.redhat.com
::1 prod.foo.redhat.com
127.0.0.1 stage.foo.redhat.com
::1 stage.foo.redhat.com
127.0.0.1 qa.foo.redhat.com
::1 qa.foo.redhat.com
127.0.0.1 ci.foo.redhat.com
::1 ci.foo.redhat.com
```

## Getting started - Installation

1. Make sure [nvm](https://github.com/nvm-sh/nvm) is installed

2. First time running the app do: `nvm use` to ensure you have the correct node version installed.
   If you do not, follow the instructions nvm gives you to install the appropriate version.
   Yarn WILL prevent you from progressing if you have not updated your node version.

3. `yarn install`

4. `yarn build` (only required when setting up for the first time)

## Getting started - Running the app

Keep in mind that you have to be connected to the VPN for this to work, even in the offices.

1. `yarn start` to choose whether to run against stage or prod environments. <br/>
   OR <br/>
   `yarn start:stage` to run against stage environment. <br/>
   OR <br/>
   `yarn start:prod` to run against prod environment. <br/>
   OR <br/>
   `yarn local` to run against our local backend running on port 8000.<br/>

2. With a browser, open the URL listed in the terminal output, https://stage.foo.redhat.com:1337/insights/content for example.

### Unit Testing

`yarn verify` will run `yarn build` `yarn lint` (eslint), `yarn format:check` Prettier formatting check and `yarn test` (Jest unit tests)

Alternatively one can run simply: `yarn test` to run the unit tests.

## Testing with Playwright

1. Ensure to `yarn playwright install --with-deps` this installs the required browsers (or vnc browsers) to view/run playwright front-end tests.

2. Run the backend locally, steps to do this can be found in the [backend repository](https://github.com/content-services/content-sources-backend).
   Ensure that the backend is running prior to the following steps.

3. `yarn local` will start up the front-end repository. If you do `yarn start` and choose stage, your tests will attempt to run against the stage ENV.

4. `yarn playwright test` will spin-off all of the playwright test suite. `yarn playwright test --headed` will run the suite in a vnc-like browser so you can follow what it is doing.

I highly recommend testing using vs-code and the [Playwright Test module for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright).

## PR checks and linking front-end/backend-end PRs for testing

The CICD pipeline for playwright (both front-end and backend) will check for presence in the description of the front-end prs, for the following formatted text:
`#testwith https://github.com/content-services/content-sources-backend/pull/<PR NUMBER>`

Note: the space between `#testwith https`.

If a backend PR is linked, the front-end/back-end PR's in question will both use the corresponding linked branch for their Playwright tests in the PR check.

## Deploying

- The starter repo uses Travis to deploy the webpack build to another Github repo defined in `.travis.yml`
  - That Github repo has the following branches:
    - `ci-beta` (deployed by pushing to `master` or `main` on this repo)
    - `ci-stable` (deployed by pushing to `ci-stable` on this repo)
    - `qa-beta` (deployed by pushing to `qa-beta` on this repo)
    - `qa-stable` (deployed by pushing to `qa-stable` on this repo)
    - `prod-beta` (deployed by pushing to `prod-beta` on this repo)
    - `prod-stable` (deployed by pushing to `prod-stable` on this repo)
- Travis uploads results to RedHatInsight's [codecov](https://codecov.io) account. To change the account, modify CODECOV_TOKEN on https://travis-ci.com/.
