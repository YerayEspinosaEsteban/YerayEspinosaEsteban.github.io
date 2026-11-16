# yerayespinosaesteban.github.io

Portfolio personal de **Yeray Espinosa Esteban** — Security Architect / Security by Design.

Live: https://yerayespinosaesteban.github.io/

## Stack
React 19 · TypeScript · Vite · Tailwind CSS 4 · Three.js / React Three Fiber · Framer Motion

## Desarrollo
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera dist/
npm run preview   # sirve dist/ en local
```

## Estructura
- `src/data/profile.ts` — **todo el contenido** (perfil, stack, experiencia, proyectos). Edita aquí.
- `src/three/HeroScene.tsx` — escena 3D del hero (lazy-loaded, modo ligero en móvil, fallback estático con `prefers-reduced-motion` / sin WebGL).
- `src/components/` — secciones de la página.
- `public/legacy/` — portfolio anterior, accesible en `/legacy/`.

## Despliegue
`.github/workflows/deploy.yml` compila y publica en GitHub Pages en cada push a `main`.
Requisito (una sola vez): *Settings → Pages → Build and deployment → Source: **GitHub Actions***.

## Easter eggs
- Una Pokéball holográfica escondida en la escena 3D (clic) · comando `scan` / `pokedex` en la terminal.
- *Holocron Security Protocol*: botón ◇ Holocron, comando `holocron` o el código Konami (↑↑↓↓←→←→BA).
