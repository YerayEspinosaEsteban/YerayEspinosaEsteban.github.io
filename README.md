# yerayespinosaesteban.github.io

Portfolio jugable de **Yeray Espinosa Esteban** — Security Architect / Security by Design.
Controlas a un avatar low-poly que camina por un pequeño planeta y descubre 5 zonas.

Live: https://yerayespinosaesteban.github.io/

## Stack
React 19 · TypeScript · Vite · Three.js / React Three Fiber / drei · Zustand · Tailwind CSS 4

## Desarrollo
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera dist/
npm run preview   # sirve dist/ en local
```

## Estructura
- `src/data/profile.ts` — **todo el contenido** (perfil, stack, experiencia, proyectos, formación). Edita aquí.
- `src/game/`
  - `sphere.ts` — matemáticas del planeta (lat/lon → vector, transporte sobre la esfera, PRNG).
  - `zones.ts` — posición, color y radio de las 5 zonas.
  - `Player.tsx` — controlador: movimiento sobre la esfera, colisiones, autopiloto, salto, cámara en tercera persona, hierba alta.
  - `Avatar.tsx` — personaje y animaciones procedurales.
  - `Planet.tsx` / `decor.ts` — terreno low-poly, caminos y decoración instanciada.
  - `Buildings.tsx` — los 5 edificios.
  - `World.tsx` — Canvas, cielo, atmósfera, nubes y estrellas.
- `src/ui/` — HUD, diálogos de zona, combate Pokémon, joystick táctil, intro y Modo CV (imprimible a PDF).
- `public/legacy/` — portfolio v1, accesible en `/legacy/`.

## Controles
WASD / flechas para moverte · Shift para correr · Espacio para saltar · E para inspeccionar · clic en el suelo para ir a un punto · arrastrar para girar la cámara · 1-5 para viajar a cada zona · joystick en móvil.

## Despliegue
`.github/workflows/deploy.yml` compila y publica en GitHub Pages en cada push a `main` (Pages → Source: GitHub Actions).
