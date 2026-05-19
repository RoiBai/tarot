# Card-Mediated Reflection

A physical-digital tarot chatbox for reflective questioning. Users enter a question, draw physical tarot cards, show them to the camera or enter them manually, and continue a reflective AI conversation. The system does not predict the future; it helps users transform questions and create a warm parchment-style reflection.

## Features

- Bilingual English / Chinese interface
- Camera or manual card input
- Dynamic growing spread instead of a fixed spread
- Current question transformation during the conversation
- Word anchors for continuing from meaningful phrases
- Parchment summary at the end of a reflection
- Saved chats in browser localStorage
- API key settings for local testing or public demos
- Responsive mystical visual design

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

## Environment Variables

Create `.env.local` for private local testing with `npm run dev`:

```bash
VITE_OPENAI_API_KEY=your_key_here
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_OPENAI_BASE_URL=https://api.shubiaobiao.com/v1
VITE_BASE_PATH=/
```

For GitHub Pages project sites, set:

```bash
VITE_BASE_PATH=/repository-name/
```

The Vite config uses `base: process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS ? "/tarot/" : "/")`, so local dev works with `/` and this repository's GitHub Pages build uses `/tarot/`. If you rename or fork the repository, set `VITE_BASE_PATH=/new-repository-name/`.

## API Key Safety

Do not commit `.env.local`. Do not hardcode keys in source files. Do not put a shared or production API key into a public GitHub Pages build.

The app supports two modes:

- Local private testing: add `VITE_OPENAI_API_KEY` to `.env.local` and run `npm run dev`.
- Public GitHub Pages demo: users paste their own API key in Settings. The key is stored only in this browser using localStorage or sessionStorage, is masked after saving, is never logged, and is not included in exported chats.

Production builds do not read `.env.local` API keys by default, which prevents accidental key bundling when deploying a static demo.

For public deployment, the safest production pattern is a backend proxy with authentication and rate limits. This repository keeps the deployed default as a static frontend demo.

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Deploy To GitHub Pages

### Option A: GitHub Actions

This repository includes `.github/workflows/deploy.yml`.

1. Push the project to GitHub.
2. Go to `Settings -> Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to `main`, or run the workflow manually from the Actions tab.

The workflow installs dependencies with `npm ci`, builds the Vite app, uploads `dist`, and deploys it with the official GitHub Pages actions. It sets `VITE_BASE_PATH` automatically from the repository name.

### Option B: gh-pages Package

Manual deployment is also available:

```bash
npm install
npm run build
npm run preview
npm run deploy:gh-pages
```

Before using this method, update the `homepage` placeholder in `package.json`:

```json
"homepage": "https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/"
```

For project pages, make sure `VITE_BASE_PATH=/YOUR_REPOSITORY_NAME/` is set when building.

Also make sure no `VITE_OPENAI_API_KEY` is present in the production build environment for a public GitHub Pages deploy.

## Camera Permission Note

Camera access works on `localhost` and HTTPS deployments. GitHub Pages uses HTTPS, so camera permission can work after deployment.

If camera permission fails, the app shows:

- Chinese: “摄像头无法使用。你仍然可以手动输入牌面。”
- English: “Camera is unavailable. You can still enter the card manually.”

Manual card entry remains available, so camera failure should not break the reflection flow.

## Saved Data Note

Saved chats are stored in browser localStorage. They stay on the same browser and device unless the user clears site data.

## Share A Static ZIP

To create a ZIP for sharing locally:

```bash
npm run build
```

Then zip the `dist` folder. The static `dist` version needs to be served through a local server, not opened directly as `file://`.

Preview with:

```bash
npm run preview
```

Or use:

```bash
npx serve dist
```

## Future Work

- Real tarot card image recognition
- Backend proxy for public deployments
- User study logging
- Export parchment as image
