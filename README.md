# Portafolio Terminal — Juan Andrés Muñoz Zapata

Portafolio personal interactivo con estética de terminal, construido con **HTML, CSS y JavaScript vanilla**. Reúne mi perfil como desarrollador de software con enfoque en **Ciencia de Datos, DevOps, QA y Trading Algorítmico**, y permite navegarlo escribiendo comandos o haciendo clic en cualquier sección.

No usa frameworks ni proceso de build de frontend. Funciona con doble clic, en GitHub Pages, en cualquier servidor estático o con **Docker en el puerto 5525**.

---

## Vista rápida

- **Terminal real:** comandos, historial con `↑` / `↓`, autocompletado con `Tab`, `clear` y errores con sugerencias.
- **Navegación híbrida:** barra superior de comandos, chips clicables y paleta con `Ctrl+K`.
- **Tres temas:** Matrix, Bloomberg Amber y Dracula; la preferencia se guarda en el navegador.
- **Panel de sistema:** estado, rol, reloj, uptime y una curva de equity decorativa en SVG.
- **CV imprimible:** `project_code/cv.html` con botón para imprimir o guardar como PDF.
- **Responsive y accesible:** teclado, `aria-live`, foco visible y respeto por `prefers-reduced-motion`.
- **Sin librerías JS externas:** la única dependencia visual es la tipografía JetBrains Mono, servida localmente.
- **Docker listo:** Nginx sirve el portafolio en `http://localhost:5525`.

> La curva de equity es **ilustrativa**. No representa resultados reales de trading ni rendimiento histórico.

---

## Cómo verlo

### Opción recomendada: Docker

Desde la raíz del repositorio:

```bash
docker compose up -d --build
```

Abre:

```text
http://localhost:5525/
```

El contenedor sirve el contenido de `project_code/` con Nginx. La imagen escucha en el puerto `80` y Compose lo publica en el `5525`.

Comandos útiles:

```bash
docker compose ps
docker compose logs -f portfolio
docker compose down
```

Si cambias HTML, CSS, JavaScript o datos, reconstruye la imagen:

```bash
docker compose up -d --build
```

El servicio incluye un healthcheck en `http://localhost:5525/healthz`. Queda levantado en segundo plano con `restart: unless-stopped`.

Si el puerto `5525` está ocupado, cambia el valor publicado en `docker-compose.yml`:

```yaml
ports:
  - "5525:80"
```

### Opción 2: abrir directamente

Abre `project_code/index.html` en el navegador. El sitio está diseñado para funcionar también con `file://`.

### Opción 3: servidor local

Desde la raíz del repositorio:

```bash
python3 -m http.server 8000
```

Luego abre:

```text
http://localhost:8000/project_code/
```

El `index.html` de la raíz redirige automáticamente a `project_code/index.html`.

### GitHub Pages

Puedes desplegarlo de dos formas:

1. Configurar Pages para servir la carpeta `/project_code`.
2. Servir desde la raíz del repositorio; el `index.html` raíz redirige al portafolio.

No hay pasos de compilación ni variables de entorno.

---

## Comandos disponibles

| Comando | Alias | Qué muestra |
|---|---|---|
| `whoami` | `about`, `sobre-mi` | Perfil, foto, enfoque y estado actual |
| `trading` | `quant`, `algo-trading` | Estrategias, backtesting, riesgo y herramientas |
| `freelance` | `servicios` | Sistema de liquidación, Expert Advisors y consultoría |
| `experience` | `experiencia` | Veritran y trayectoria freelance |
| `projects` | `proyectos` | Proyectos técnicos y enlaces a repositorios |
| `education` | `educacion`, `formacion` | UTP, certificaciones e idiomas |
| `skills` | `habilidades`, `stack` | Stack por categorías |
| `interests` | `intereses` | Intereses profesionales y personales |
| `contact` | `contacto` | Email, GitHub, LinkedIn, copiar correo y CV |
| `help` | `ayuda` | Ayuda agrupada y contextual |
| `ls` | `dir` | Lista compacta de comandos |
| `man <cmd>` | `manual` | Manual de un comando |
| `neofetch` | `fetch` | Resumen visual del perfil |
| `theme [tema]` | `temas` | Cambia Matrix, Amber o Dracula |
| `crt [on\|off]` | `scanlines` | Activa o desactiva el efecto CRT |
| `open <id>` | `abrir` | Abre un repositorio de proyecto |
| `stats` | `status` | Estado de la sesión y sparkline |
| `history [-c]` | `historial` | Historial de comandos |
| `date`, `pwd`, `echo` | — | Utilidades de terminal |
| `banner` | `logo` | ASCII art del portafolio |
| `clear` | `cls`, `limpiar` | Limpia la terminal |
| `cv` | `resume` | Abre el CV imprimible |
| `sudo`, `exit` | — | Easter eggs |

### Atajos de teclado

| Atajo | Acción |
|---|---|
| `↑` / `↓` | Navegar por el historial |
| `Tab` | Autocompletar comandos y argumentos |
| `Enter` | Ejecutar |
| `Ctrl+L` | Limpiar la terminal |
| `Ctrl+C` | Cancelar la línea actual |
| `Ctrl+K` | Abrir/cerrar la paleta de comandos |
| `Esc` | Cerrar la paleta o limpiar la línea |

También puedes abrir secciones por URL: `#whoami`, `#trading`, `#projects`, `#contact`, etc.

---

## Estructura del proyecto

```text
portafolio2.0/
├── Dockerfile                    # Imagen Nginx con el sitio estático
├── docker-compose.yml            # Servicio en el puerto 5525
├── nginx.conf                    # Configuración de Nginx
├── .dockerignore
├── index.html                    # Redirect raíz → project_code/ (GitHub Pages)
├── README.md
├── fotos/
│   └── foto_juan.jpeg            # Foto original
└── project_code/
    ├── index.html                # Shell de la terminal
    ├── cv.html                   # CV imprimible / Guardar PDF
    ├── sobre-mi.html             # Redirect → #whoami
    ├── proyectos.html            # Redirect → #projects
    ├── servicios.html            # Redirect → #freelance
    ├── assets/
    │   ├── fonts/
    │   │   ├── jetbrains-mono-400.woff2
    │   │   ├── jetbrains-mono-700.woff2
    │   │   └── OFL.txt
    │   └── img/
    │       ├── foto_juan.jpeg       # Copia de la foto original
    │       └── foto_juan-card.jpeg  # Recorte usado en la terminal y el CV
    ├── css/
    │   ├── fonts.css             # @font-face
    │   ├── tokens.css            # Reset, tipografía y utilidades
    │   ├── themes.css            # Matrix, Amber, Dracula y CRT
    │   ├── terminal.css          # Layout y componentes
    │   └── print.css             # CV en A4
    └── js/
        ├── data.js               # Fuente única de verdad del CV
        ├── ui.js                 # Helpers de DOM
        ├── visuals.js            # SVG, sparklines y ASCII
        ├── commands.js           # Registro y vistas de comandos
        ├── terminal.js           # Motor de la terminal
        ├── effects.js            # Temas, reloj, uptime y CRT
        ├── cv.js                 # Render del CV imprimible
        └── app.js                # Bootstrap
```

---

## Dónde editar el contenido

Casi todo el contenido vive en:

```text
project_code/js/data.js
```

Allí puedes actualizar:

- Perfil, email, GitHub, LinkedIn y foto.
- Experiencia laboral y freelance.
- Proyectos, enlaces y stacks.
- Educación, certificaciones e idiomas.
- Habilidades e intereses.
- Textos de la sección `trading` y sus métricas conceptuales.

La terminal, el CV imprimible y las tarjetas comparten esos datos, así que un cambio se refleja en todo el sitio.

### Actualizaciones incluidas

- **Veritran — Practicante de QA (Quality Assurance):** octubre 2026 — presente. Pruebas funcionales y automatizadas, validación de flujos críticos en fintech y seguimiento de defectos.
- **Sistema interno de liquidación:** automatización de cálculos, integridad de datos, reglas de negocio y optimización de procesos administrativos/financieros. Stack: Python, Django, PostgreSQL y Docker.

La fecha de inicio del trabajo freelance no se inventó: aparece como **“Actualidad”**.

---

## Temas y personalización visual

Los temas se definen con variables CSS en `project_code/css/themes.css`:

- `matrix`: verde fósforo sobre negro.
- `amber`: ámbar y cian, inspirado en terminales financieras.
- `dracula`: violeta, rosa y cian.

El tema y el efecto CRT se guardan en `localStorage`. El botón `CRT` de la barra superior activa scanlines y viñeta sutiles, desactivados por defecto.

Para cambiar el tema inicial, edita `data-theme` en `project_code/index.html` o el valor por defecto en `project_code/js/effects.js`.

---

## CV imprimible

Abre:

```text
project_code/cv.html
```

El botón **Imprimir / Guardar PDF** abre el diálogo del navegador. También puedes usar:

```text
project_code/cv.html?print=1
```

para lanzar la impresión automáticamente después de renderizar.

El CV usa un diseño claro optimizado para **2 páginas A4**, con la foto, experiencia, freelance, proyectos, educación, certificaciones, habilidades e idiomas.

---

## Decisiones técnicas

- **Sin frameworks:** el motor de comandos, el historial, el autocompletado y los temas están implementados a mano. Esto mantiene el sitio rápido, portable y sin dependencias de build.
- **Docker + Nginx:** `Dockerfile` copia `project_code/` a una imagen `nginx:stable-alpine`; `docker-compose.yml` publica el puerto `5525`, incluye healthcheck en `/healthz`, gzip y cabeceras básicas de seguridad.
- **SVG propio:** la curva de equity y el sparkline se generan con un random walk determinista y están etiquetados como visuales. No se usan librerías de gráficos porque no hay métricas reales que mostrar.
- **Fuente local:** JetBrains Mono se sirve desde `assets/fonts` para evitar CDN y mejorar privacidad. Licencia SIL Open Font License 1.1.
- **Foto:** el sitio usa un recorte 3:4 de la foto original para que el rostro tenga más presencia en la tarjeta y el CV. El archivo original se conserva en `fotos/foto_juan.jpeg`.
- **Accesibilidad:** salida con `role="log"`, `aria-live`, etiquetas para el input, foco visible, botones reales para los comandos y soporte para movimiento reducido.
- **Compatibilidad:** scripts clásicos con `defer` para que el sitio funcione con `file://` sin necesidad de un servidor.

---

## Créditos

- Diseño e implementación: **Juan Andrés Muñoz Zapata**.
- Tipografía: [JetBrains Mono](https://www.jetbrains.com/lp/mono/), SIL Open Font License 1.1.
- Inspiración de experiencia terminal: la cultura CLI, los dashboards técnicos y la estética de las terminales de trading.

El contenido personal es de uso propio. Si reutilizas la estructura o el código, conserva la licencia de la tipografía y adapta los datos a tu perfil.
