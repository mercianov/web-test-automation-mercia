# Sauce Demo Web Automation Framework

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/mercianov/web-test-automation-mercia/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/mercianov/web-test-automation-mercia/tree/main)

Playwright-based web automation for [Sauce Demo](https://www.saucedemo.com/), a public
e-commerce demo site that I use for showcase automation demo.

---

## Prerequisites

| Tool       | Version  | Install link                                  |
|------------|----------|-----------------------------------------------|
| Node.js    | >= 20    | https://nodejs.org                            |
| npm        | >= 10    | Comes with Node.js                            |
| Git        | any      | https://git-scm.com                           |

---

## Setup — Step by Step

### 1. Install Node.js dependencies

```bash
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install chromium
```

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Sauce Demo's login page publishes its own test accounts — `standard_user`,
`locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`,
`visual_user` — all sharing the password `secret_sauce`. The defaults in
`.env.example` already work out of the box; only override `BASE_URL`,
`USERNAME`, or `PASSWORD` if you need to point at a different environment.

> **Never commit `.env`** — it is in `.gitignore`.

---

## Running Tests

```bash
npm test                  # Run the full suite
npm run test:smoke        # @smoke tagged tests only
npm run test:regression   # @regression tagged tests only

# Or use Playwright directly with any grep pattern:
npx playwright test --grep "@smoke|@regression"
```

### Run with visible browser (for debugging)

```bash
HEADLESS=false npx playwright test
```

### Run in UI mode (interactive)

```bash
npx playwright test --ui
```

---

## Viewing Reports

```bash
npm run report
# or
npx playwright show-report
```

The report is saved to `playwright-report/index.html`.

---

## Project Structure

```
web-test-automation-mercia/
├── .circleci/
│   └── config.yml             # CircleCI pipeline (smoke on every push, scheduled smoke/regression)
├── src/
│   ├── config/
│   │   └── index.ts           # Env config, credential helper
│   ├── data/
│   │   └── testData.ts        # Sauce Demo users, products, sort options
│   ├── fixtures/
│   │   └── index.ts           # Extended test() with page objects + `loggedIn` fixture
│   ├── pages/
│   │   ├── BasePage.ts        # Shared helpers: click, fill, assert
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   └── CheckoutPage.ts
│   ├── reporters/
│   │   └── SlackReporter.ts   # Custom Playwright reporter → posts results to Slack
│   └── utils/
│       └── helpers.ts         # Random strings, price parsing, retry
├── tests/
│   ├── login.spec.ts
│   ├── inventory.spec.ts
│   ├── cart.spec.ts
│   └── checkout.spec.ts
├── .env.example                # Template for environment values
├── .gitignore
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

---

## Slack Notifications

Slack notifications are sent automatically after a run when both env vars are set:

- `SLACK_BOT_TOKEN` — Bot token from your Slack app (`xoxb-...`)
- `SLACK_CHANNEL_ID` — Target channel ID (not channel name)

**To create a Slack Bot:**
1. Go to https://api.slack.com/apps → **Create New App** → **From Scratch**
2. Under **OAuth & Permissions**, add scopes: `chat:write`, `files:write`
3. Install to workspace → copy the **Bot User OAuth Token** (`xoxb-...`)
4. Invite the bot to your channel: `/invite @YourBotName`
5. Get the channel ID: right-click the channel → **Copy link** → last part of the URL

The custom reporter lives at `src/reporters/SlackReporter.ts` and is wired into
`playwright.config.ts` — it only activates when `SLACK_BOT_TOKEN` is present, so
local runs stay silent by default.

---

## CircleCI Setup

### Docker executor

CI jobs run inside Microsoft's official Playwright Docker image instead of a
plain Node image:

```yaml
executors:
  playwright-executor:
    docker:
      - image: mcr.microsoft.com/playwright:v1.62.1-jammy
```

This image ships Ubuntu Jammy with all system dependencies and browser
binaries (Chromium, Firefox, WebKit) already installed, so CI doesn't need to
run `npx playwright install` on every build. Node.js, project dependencies,
and the test run itself still happen as separate steps on top of that base.

> **Keep the image tag in sync with `@playwright/test`'s version in
> `package.json`.** If they drift, the test runner's expected browser
> revision won't match what's baked into the image and tests fail with
> `Executable doesn't exist at /ms-playwright/...`.

### Environment Variables (set in CircleCI project settings)

| Variable              | Description                          |
|-----------------------|---------------------------------------|
| `BASE_URL`            | Sauce Demo URL (defaults to the public site) |
| `USERNAME`            | Login username                        |
| `PASSWORD`            | Login password                        |
| `SLACK_BOT_TOKEN`     | Slack Bot token (`xoxb-...`)          |
| `SLACK_CHANNEL_ID`    | Slack channel ID                      |

### How the pipeline is wired

| Workflow            | Trigger                          | Tests run     |
|----------------------|-----------------------------------|---------------|
| `on-commit`          | Every push                        | `tags` pipeline parameter (defaults to `@smoke`) |
| `nightly-smoke`      | Every day at midnight UTC         | `@smoke`      |
| `weekly-regression`  | Every Sunday at 6 PM UTC          | `@regression` |

### Triggering via CircleCI API

Run the regression suite on demand:

```bash
curl -X POST https://circleci.com/api/v2/project/gh/<org>/<repo>/pipeline \
  -H "Circle-Token: $CIRCLE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "tags": "@regression"
    }
  }'
```

---

## Tagging Convention

| Tag           | Purpose                                   |
|---------------|--------------------------------------------|
| `@smoke`      | Critical path — must pass before deploy   |
| `@regression` | Full regression suite                     |

---

## Adding a New Page

1. Create `src/pages/<PageName>.ts` extending `BasePage`
2. Add the page to fixtures in `src/fixtures/index.ts`
3. Write tests in `tests/<feature>.spec.ts`, tagging them `@smoke` and/or `@regression`

---

## Troubleshooting

**Browser not found**
```bash
npx playwright install chromium
```

**Missing environment variable error**
- Make sure `.env` exists (copy it from `.env.example`).

**Tests fail on CI but pass locally**
- Check that all env vars are set in CircleCI project settings.
- Run locally with `HEADLESS=true` to simulate CI.
