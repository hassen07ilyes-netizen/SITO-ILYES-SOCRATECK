# Ghar & Garam — Tikka Masala landing

Landing page scroll-driven per un brand inventato di salse indiane artigianali.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/
npm run art      # rigenera le illustrazioni SVG in public/art/
```

## Stack
Vite · GSAP + ScrollTrigger + SplitText · Lenis · Three.js (caricato in un chunk lazy)

## Struttura
| File | Ruolo |
|---|---|
| `index.html` | markup delle 8 sezioni |
| `src/main.js` | bootstrap: Lenis, loader, nav, newsletter |
| `src/director.js` | **il regista**: mappa lo scroll → posa del barattolo + colore di sfondo, con keyframe ancorati al DOM (ricalcolati a ogni refresh) |
| `src/jar/jar.js` | scena Three.js: vetro, salsa, etichetta, tappo; un solo canvas fisso |
| `src/jar/label.js` | etichetta, fianco e cima del tappo disegnati in `<canvas>` |
| `src/sections.js` | split text, pin, clip-path reveal, parallax |
| `src/ui/*` | cursore custom, bottoni magnetici, loader |
| `scripts/gen-art.mjs` | genera le "foto" come illustrazioni SVG (funziona offline, zero copyright) |

## Note
- **Foto**: le illustrazioni in `public/art/` sono segnaposto generati in codice. Per usare foto vere basta
  sostituire i file (stesso nome, o cambiare `src` in `index.html`).
- **prefers-reduced-motion**: niente Lenis, pin, scrub, rotazioni o cursore; contenuti subito visibili.
- **GPU assente** (WebGL software): il barattolo usa materiali più leggeri e 20 fps. `?hq` forza la qualità piena.
- **Senza WebGL**: viene mostrato un barattolo SVG statico.
