This project provides one way to add Playwright to a `create-react-app` generated app. It uses a Jest test runner, follows the page object model and shows how easy it is to get started with Playwright.

# Contents

* [Why Playwright?](#why-playwright)
* [Running Specs](#running-specs)
* [Writing Specs and Page Objects](#writing-specs-and-page-objects)
* [Adding to an Existing Project](#adding-to-an-existing-project)

# Why Playwright?

The same team behind Puppeteer have recently released [Playwright](https://github.com/microsoft/playwright), a similar Node library with two notable differences – it offers cross-browser functionality out of the box and is from Microsoft, not Google.

Playwright is essentially Puppeteer with cross-browser support – Chromium (Chrome, Edge), Webkit (Safari), and Firefox browsers can now be automated with a single API.

# Running Specs

Let’s take a look at a sample project that’s set-up with Playwright. If you want to add this set-up to your current project, you can skip this section and go straight to [Adding to an Existing Project](#adding-to-an-existing-project).

Open a new terminal and run –

```bash
$ git clone https://github.com/kyleaday/react-app-playwright
$ cd react-app-playwright
$ npm install
```

In order to improve test readability and maintainability, I created a `playwright.config.js` file to set browser, launch and context options:

```js
// e2e/playwright.config.js

import { chromium, firefox, webkit, devices } from 'playwright';

const iPhone = devices['iPhone 6'];

module.exports = {
    browserType: webkit,
    launchConfig: {
        headless: false,
        slowMo: 10
    },
    contextConfig: {
        viewport: iPhone.viewport,
        userAgent: iPhone.userAgent
    }
};
```

For example, this configuration sets `Webkit` as the browser type, turns off headless mode and sets a `slowMo` time. It also sets the context to emulate an iPhone 6, so when the tests are run, the screen-size adjusts accordingly. Other device properties can be set here, such as geolocation, permissions, etc.

As Playwright doesn’t automatically use my custom configuration file, I must pass these variables into the `launch()` and `newContext()` functions, which will be discussed further in [Writing Specs and Page Objects](#writing-specs-and-page-objects).

The `jest.config.js` file is automatically used when running Jest, and this is where I’ve set the global `baseURL: “http://localhost:3000”`.

Now we’re ready to run some tests. Let’s start the app –

```bash
$ npm start
```

And open a new terminal to run the tests –

```bash
$ npm run e2e
```

The script `e2e` can be found in the `package.json`. It runs `cd e2e && jest`, which changes our directory to `e2e`, so Jest will use the correct configuration.

As we’re not running headless, the browser will load onscreen, navigate to the page and perform the tests.

# Writing Specs and Page Objects

This project follows the page object model – the UI structure has been separated from the specs (or tests) for easier readability and maintainability. Spec files can be found in `e2e/specs`, and the accompanying page objects are in `e2e/pageObjects`. 

Let’s look at the spec and page object for `index.js` –
 
```js
// e2e/specs/index.js

import { load, close, getTitle } from '../pageObjects';

describe("React App", () => {
    beforeEach(async () => {
        await load();
    });

    afterEach(async () => {
        await close();
    });

    it("should be titled 'React App'", async () => {
        expect(await getTitle()).toBe('React App');
    });
});
```

This spec imports the `load` method and the functions `close` and `getTitle` from the `index.js` page object file.

Jest API globals are used - `describe` groups the tests, the browser loads `beforeEach` test, and then closes `afterEach` test. The `it` method runs the tests and `expect` gives us access to validation matchers, in this example `toBe`.

The page object model makes the spec easy to read – it loads the page, gets the title, checks that the actual title matches the expected title, and finally closes the browser.

Let’s look at the page object –

```js
// e2e/pageObjects/index.js

import { browserType, launchConfig, contextConfig } from '../playwright.config'

const rootSelector = '#root';
let browser, context, page;

export const root = async () => await page.$(rootSelector);

export const load = async () => {
    browser = await browserType.launch(launchConfig);
    context = await browser.newContext(contextConfig);
    page = await context.newPage();
    await page.goto(baseURL);
};

export const close = async () => await browser.close();

export const getTitle = async () => await page.title();
```

As mentioned earlier, Playwright doesn’t automatically use the `playwright.config.js` file, so our configuration variables must be imported before they can be used when launching our browser.

Let's look closer at the `load` method -

```js
export const load = async () => {
    browser = await browserType.launch(launchConfig);
    context = await browser.newContext(contextConfig);
    page = await context.newPage();
    await page.goto(baseURL);
};
```

The `load` method launches our `browserType` with the `launchConfig`, sets the context with the `contextConfig` and navigates to the `baseURL` page. The variables `browser`, `context` and `page` are then used elsewhere in the page object, such as `browser.close()`, `page.$(selector)` and `page.title()`.

Like Puppeteer, the Playwright API has similar classes with methods that allow us to interact with a page. Playwright can automate most browser interactions, such as filling out forms, entering keystrokes, moving the mouse, and more. A list can be found [here](https://github.com/microsoft/playwright/blob/master/docs/api.md)

# Adding to an existing project:

To use this set-up on existing projects –

* Copy the e2e folder into the root of the project -

```bash
$ cp -r react-app-playwright/e2e <react-app>
```

* Install the additional dev dependencies -

```bash
$ npm install --save-dev playwright
```

* Add the following script in the project’s `package.json` -

```js
{
  // ...
  "scripts": {
    // ...
    "e2e": "cd e2e && jest",
  }
}
```

# Playwright or Puppeteer?

That is the question. Even though Playwright does not have a `jest-puppeteer` package equivalent (yet!), it is just as easy as to set-up. Puppeteer users will also be familiar with the Playwright API.

However, I have experienced slight teething problems with Playwright. For example, I’ve noticed that `slowMo` can be temperamental, and if set too high the tests often fail. The consistency of `slowMo` also seems to vary from browser to browser.

Puppeteer is the more established project at the moment, but if you need cross-browser functionality, then perhaps it’s time to make the switch to Playwright.