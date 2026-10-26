# Bhanuteja Portfolio – particle intro

React 18 + Vite + React Three Fiber + Drei-free custom point shaders + Framer Motion.

```bash
npm install
npm run dev      # open the printed localhost URL
npm run build    # production build in /dist
```

Sequence: glowing sphere → 2,500-particle burst → "BHANUTEJA" (hold 1.8s) → morph to "PORTFOLIO" (1.2s)
→ camera pulls back, particles shrink to a top-left logo → landing page + 50,000-particle portrait on the right.

| File | What it does |
|---|---|
| `src/lib/timeline.js` | All timings (`T`), particle count (`N`), easing helpers |
| `src/components/ParticleText.jsx` | Burst / text / morph / logo particles |
| `src/components/ParticlePortrait.jsx` | 50k-point portrait, dissolve-in, right side |
| `src/components/Starfield.jsx` | 500 stars + mouse parallax |
| `src/components/LandingPage.jsx` | Navbar, name, role (`ROLE` constant), buttons |
| `public/portrait.bin` | Portrait point data (x,y uint16 + rgb uint8 per point) |
