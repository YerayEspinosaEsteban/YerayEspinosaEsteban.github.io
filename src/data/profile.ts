export const profile = {
  name: 'Yeray Espinosa Esteban',
  shortName: 'Yeray Espinosa',
  role: 'Security Architect / Security by Design',
  company: 'GFT Technologies España',
  location: 'Zaragoza, España',
  headline: 'Security-by-Design Architect | Multicloud & Container Security | DevSecOps & AI Security',
  bio: 'Arquitecto de seguridad con base sólida en desarrollo multiplataforma (DAM con Mención Honorífica en Centro San Valero) y administración de sistemas/redes (SMR). Especializado en integrar seguridad desde el diseño ("Shift-Left"), automatización DevSecOps, gobierno de identidades no humanas (NHI) y seguridad en entornos Cloud y contenedores. Apasionado por construir sistemas resilientes desde el código hasta la infraestructura.',
  links: {
    linkedin: 'https://www.linkedin.com/in/yeray-espinosa-esteban-b0058a348',
    github: 'https://github.com/yerayespinosaesteban',
  },
}

export type Accent = 'cyan' | 'violet' | 'green' | 'amber'

export const stack: { id: string; title: string; code: string; accent: Accent; summary: string; items: string[] }[] = [
  {
    id: 'cloud',
    title: 'Cloud & Container Security',
    code: 'LAYER-01',
    accent: 'cyan',
    summary: 'Guardrails multicloud, Zero-Trust y gobierno de identidades no humanas.',
    items: ['AWS', 'Azure', 'Red Hat OpenShift', 'Policy-as-Code (AWS Config, Azure Policy)', 'Arquitectura Zero-Trust', 'Non-Human Identity (NHI) Governance'],
  },
  {
    id: 'devsecops',
    title: 'DevSecOps & AppSec',
    code: 'LAYER-02',
    accent: 'violet',
    summary: 'Seguridad automatizada dentro del pipeline, de la primera línea de código al registro.',
    items: ['Pipelines CI/CD seguros', 'SAST', 'SCA', 'JFrog Artifactory & Xray', 'SonarQube', 'Fortify', 'Prisma Cloud', 'GitHub Actions Hardening (OIDC)'],
  },
  {
    id: 'blue',
    title: 'Blue Team, SIEM & SOAR',
    code: 'LAYER-03',
    accent: 'green',
    summary: 'Detección y respuesta automatizada, inteligencia de amenazas y factor humano.',
    items: ['Wazuh', 'TheHive', 'MISP', 'Análisis de amenazas', 'Ingeniería social'],
  },
  {
    id: 'dev',
    title: 'Desarrollo & IA',
    code: 'LAYER-04',
    accent: 'amber',
    summary: 'Construyo lo que protejo: producto full-stack e integración segura de LLMs.',
    items: ['TypeScript', 'React / React Native', 'Node.js / NestJS', 'Python', 'MongoDB', 'LLMs (Gemini API)', 'AI Security'],
  },
]

export const experience = [
  {
    role: 'Security Architect / Security by Design',
    company: 'GFT Technologies España',
    period: 'Sept 2026 — Actualidad',
    type: 'Jornada completa · Zaragoza',
    current: true,
    description: 'Diseño de marcos de arquitectura Security-by-Design multicloud, controles DevSecOps automatizados y seguridad en entornos contenedorizados.',
  },
  {
    role: 'Cybersecurity & AI Developer',
    company: 'GFT Technologies España',
    period: 'Mar 2026 — Jun 2026',
    type: 'Prácticas',
    current: false,
    description: 'Desarrollo de soluciones de IA aplicada a ciberseguridad, operación en entornos SOC reales y configuración de reglas SIEM/SOAR (Wazuh, TheHive, MISP).',
  },
  {
    role: 'IT Support & Cybersecurity',
    company: 'Cibergob',
    period: 'Mar 2024 — Jun 2024',
    type: 'Prácticas',
    current: false,
    description: 'Gobierno de ciberseguridad, categorización de activos, investigación de CVEs y cumplimiento del Esquema Nacional de Seguridad (ENS) en Administraciones Públicas y PYMES.',
  },
]

export const education = [
  {
    title: 'Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM)',
    school: 'Centro San Valero',
    detail: 'Graduado en 2026 · Mención Honorífica',
  },
  {
    title: 'Grado Medio en Sistemas Microinformáticos y Redes (SMR)',
    school: 'Centro San Valero',
    detail: '',
  },
]

export const certifications = [
  { title: 'Non-Human Identity Fundamentals Certification', issuer: '', year: '2026', badge: 'NHI' },
  { title: 'AI Security Specialization Certificate', issuer: 'TryHackMe', year: 'Top 3% mundial · +134 salas', badge: 'THM' },
  { title: 'NASA Space Apps Challenge 2026 Zaragoza', issuer: 'NASA', year: 'Participante y desarrollador', badge: 'NASA' },
]

export const projects: {
  id: string
  title: string
  tag: string
  accent: Accent
  description: string
  stack: string[]
}[] = [
  {
    id: 'mars',
    title: '60 Seconds to Mars',
    tag: 'NASA Space Apps Challenge 2026',
    accent: 'amber',
    description: 'Juego web educativo interactivo creado para el NASA Space Apps Challenge 2026.',
    stack: ['React 19', 'TypeScript', 'Tailwind CSS 4', 'Three.js', 'Web Speech API', 'Gemini API'],
  },
  {
    id: 'car',
    title: 'Car Conquest',
    tag: 'Mobile · IA',
    accent: 'cyan',
    description: 'App móvil multiplataforma de "car-spotting" gamificado: reconocimiento de imágenes por IA para identificar vehículos y estimar su valoración de mercado en tiempo real.',
    stack: ['React Native', 'Cloudflare Pages', 'IA · Visión'],
  },
  {
    id: 'unnion',
    title: 'Unnion',
    tag: 'Trabajo Fin de Grado',
    accent: 'violet',
    description: 'Plataforma móvil de gestión de voluntariado con arquitectura full-stack en TypeScript.',
    stack: ['TypeScript', 'React Native', 'NestJS', 'AWS', 'MongoDB'],
  },
  {
    id: 'labs',
    title: 'SIEM/SOAR & DevSecOps Labs',
    tag: 'Blue Team · Automatización',
    accent: 'green',
    description: 'Laboratorios de automatización de respuesta a incidentes integrando Wazuh, TheHive y MISP, junto a pipelines con análisis estático/dinámico automatizado.',
    stack: ['Wazuh', 'TheHive', 'MISP', 'SAST / DAST', 'CI/CD'],
  },
]

export const accentHex: Record<Accent, string> = {
  cyan: '#22e6ff',
  violet: '#a15bff',
  green: '#3dff9a',
  amber: '#ffb347',
}
