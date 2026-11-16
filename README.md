# yerayespinosaesteban.github.io

Portfolio 3D de **Yeray Espinosa Esteban** — Security Architect / Security by Design.

Un diorama isométrico interactivo: un búnker cyber-cozy de arquitectura de seguridad flotando en la oscuridad.
Haz clic en cada rincón y la cámara vuela hasta él; el contenido aparece **dentro** de las pantallas de la escena.

Live: https://yerayespinosaesteban.github.io/

Inspirado en el concepto de interacción de [Jesse's Ramen](https://www.jesse-zhou.com/) (cámara orbital limitada + zoom con GSAP a objetos con pantallas). Escena, modelos y código propios.

## Stack
React 19 · TypeScript · Vite · Three.js / React Three Fiber / drei · @react-three/postprocessing (Bloom, SMAA, ACES) · GSAP · Zustand · Tailwind CSS 4

## Desarrollo
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera dist/
npm run preview   # sirve dist/ en local
```
`?nofx` en la URL desactiva postprocesado y reflejos (modo ligero).

## Estructura
- `src/data/profile.ts` — **todo el contenido** (perfil, stack, experiencia, proyectos, formación). Edita aquí.
- `src/scene/`
  - `Experience.tsx` — Canvas, luces, postprocesado, `OrbitControls` con límites y `CameraRig` (vuelos GSAP a cada anclaje).
  - `Room.tsx` — base flotante, paredes, suelo reflectante, cables, tuberías, ventilador, póster, planta, polvo.
  - `Desk.tsx` — setup multi-monitor, torre con refrigeración líquida, silla, taza con vapor, neón `YERAY // SEC-ARCH` → **Sobre mí**.
  - `Arcade.tsx` — recreativa `PROJECTS` con botones físicos → **Proyectos**.
  - `ServerRack.tsx` — racks con LEDs y pedestal holográfico con escudos → **Experiencia & Stack**.
  - `Shelf.tsx` — Holocrón, Pokéball, medallas, trofeos, diploma, sable → **Logros**.
  - `Panels.tsx` — contenido HTML pegado a las superficies 3D (`<Html transform>`); en móvil se muestra en una hoja inferior.
  - `screens.ts` — texturas animadas de las pantallas (código, SIEM, arcade, póster…).
  - `common.tsx` — neones, objetos interactivos, ventiladores, cables, anclajes de cámara.
- `src/ui/` — Loader, Overlay (sonido, redes, volver) y Modo CV imprimible.
- `public/legacy/` — portfolio v1, accesible en `/legacy/`.

## Despliegue
`.github/workflows/deploy.yml` compila y publica en GitHub Pages en cada push a `main` (Pages → Source: GitHub Actions).
