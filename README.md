## Brand Name Co-Pilot

Interactive assistant that guides founders through the discovery questions needed to craft a resonant business name. Built with Next.js 14, the app captures your vision, tone, themes, and audience, then generates tailored name ideas you can copy and refine instantly.

### Features
- Conversational intake that adapts as you answer
- Quick suggestion chips for rapid responses
- Style toggles (Balanced, Descriptive, Inventive) to reshape the generated names
- Clipboard-ready name cards with contextual tags
- Insight summary of your brand direction

### Local Development

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the experience. Edits to files inside `src/app` will hot reload in real time.

### Production Build

```bash
npm run build
npm start
```

### Deployment

This project is optimized for Vercel. To deploy with an existing auth token:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-f9f67d1a
```
