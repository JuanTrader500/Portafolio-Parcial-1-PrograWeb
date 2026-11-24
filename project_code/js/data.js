/* ==========================================================================
   data.js — fuente única de verdad del portafolio
   Edita este archivo para actualizar el contenido de la terminal y del CV.
   ========================================================================== */

(function () {
    "use strict";

    const profile = {
        name: "Juan Andrés Muñoz Zapata",
        shortName: "Juan",
        handle: "juan",
        host: "portfolio",
        role: "Desarrollador de Software · Data Science · QA",
        roleShort: "Data & Algo-Trading Dev",
        tagline:
            "Construyendo sistemas inteligentes en la intersección entre software, datos y mercados financieros.",
        location: "Pereira, Colombia",
        timezone: "COT · UTC−5",
        email: "juanandresm2006@gmail.com",
        github: "https://github.com/JuanTrader500",
        linkedin:
            "https://www.linkedin.com/in/juan-andres-mu%C3%B1oz-zapata-89b158286",
        photo: "assets/img/foto_juan-card.jpeg",
        status: "ONLINE · abierto a freelance y colaboraciones",
        availability: "Abierto a prácticas, freelance y colaboraciones",
        languages: "Español nativo · Inglés B1–B2",
        focus: "Data Science · DevOps · Algo Trading",
        now: "Practicante de QA en Veritran · Quinto semestre UTP",
        summary:
            "Desarrollador de software con enfoque en ciencia de datos, DevOps y trading algorítmico. Me gusta construir sistemas robustos y automatizados: desde pipelines de datos y modelos de machine learning hasta servicios backend, contenedores y estrategias cuantitativas. Actualmente realizo mis prácticas de QA en Veritran y curso quinto semestre de Tecnología en Desarrollo de Software en la UTP.",
    };

    const experience = [
        {
            id: "veritran",
            role: "Practicante de QA (Quality Assurance)",
            company: "Veritran",
            period: "Octubre 2026 — Presente",
            type: "Prácticas laborales · Fintech",
            summary:
                "Aseguramiento de calidad de software en entornos fintech, con foco en la confiabilidad de flujos críticos y en la experiencia del usuario.",
            bullets: [
                "Aseguramiento de calidad de software y validación de flujos críticos en entornos fintech.",
                "Diseño y ejecución de pruebas funcionales y automatizadas sobre escenarios de negocio.",
                "Documentación de casos de prueba, reporte y seguimiento de defectos junto al equipo de desarrollo.",
                "Validación de regresiones e integraciones para reducir riesgos antes de cada liberación.",
            ],
            stack: [
                "QA manual",
                "Pruebas automatizadas",
                "Testing funcional",
                "Regresión",
                "Fintech",
            ],
        },
        {
            id: "freelance",
            role: "Desarrollador de Software Freelance",
            company: "Independiente",
            period: "Actualidad",
            type: "Software · Datos · Trading",
            summary:
                "Soluciones a la medida para clientes reales: sistemas internos, aplicaciones web, automatización y herramientas de trading algorítmico.",
            bullets: [
                "Sistema interno de liquidación con automatización de cálculos, integridad de datos y reglas de negocio.",
                "Desarrollo de Expert Advisors en MQL5 para DAX40, EURUSD y NASDAQ100, con backtesting en Python, alertas por Telegram y despliegue en VPS.",
                "Aplicaciones web y sistemas de gestión con Python/Django, análisis de datos e integración de herramientas de IA.",
            ],
            stack: [
                "Python",
                "Django",
                "PostgreSQL",
                "Docker",
                "MQL5",
                "MetaTrader 5",
            ],
        },
    ];

    const freelance = [
        {
            id: "liquidacion",
            title: "Sistema interno de liquidación",
            kicker: "Caso confidencial · Actualidad",
            status: "Privado",
            summary:
                "Sistema a la medida para automatizar el cálculo y la liquidación de operaciones internas, reduciendo trabajo manual y errores de consistencia en procesos administrativos y financieros.",
            bullets: [
                "Automatización de cálculos y generación de liquidaciones.",
                "Integridad y consistencia de datos mediante validaciones y reglas de negocio.",
                "Modelado de procesos administrativos y financieros con trazabilidad.",
                "Optimización de tiempos operativos y reducción de reprocesos.",
            ],
            stack: ["Python", "Django", "PostgreSQL", "Docker"],
            highlight: true,
        },
        {
            id: "expert-advisors",
            title: "Expert Advisors en MQL5",
            kicker: "Trading algorítmico · Actualidad",
            status: "Activo",
            summary:
                "Diseño y desarrollo de Expert Advisors personalizados para MetaTrader 5, con lógica de entrada, gestión de riesgo y evaluación de rendimiento.",
            bullets: [
                "Estrategias algorítmicas sobre DAX40, EURUSD y NASDAQ100.",
                "Lógica de entrada basada en indicadores técnicos y reglas cuantitativas.",
                "Backtesting y evaluación de rendimiento con Python.",
                "Notificaciones automáticas por Telegram y despliegue en VPS.",
            ],
            stack: ["MQL5", "MetaTrader 5", "Python", "Telegram API", "VPS"],
        },
        {
            id: "web-consulting",
            title: "Aplicaciones web y consultoría",
            kicker: "Software a la medida · Actualidad",
            status: "Abierto",
            summary:
                "Desarrollo de aplicaciones web y sistemas de gestión para proyectos que necesitan ordenar datos, automatizar procesos o integrar inteligencia artificial.",
            bullets: [
                "Backends y paneles de administración con Python/Django.",
                "Análisis de datos, automatización e integración de herramientas de IA.",
                "Acompañamiento técnico desde el alcance hasta el despliegue.",
            ],
            stack: ["Python", "Django", "SQL", "Automatización", "IA/RAG"],
        },
    ];

    const projects = [
        {
            id: "quant-platform",
            name: "Quant Trading Platform",
            subtitle: "Predicción de volatilidad financiera con MLOps",
            status: "En desarrollo",
            statusTone: "warn",
            description:
                "Plataforma de microservicios para predecir la volatilidad diaria de SP500/NASDAQ mediante machine learning, con una arquitectura desacoplada y un flujo de experimentación reproducible.",
            highlights: [
                "Servicios desacoplados: Data Service, ML Service y Web Service.",
                "FastAPI, PostgreSQL/TimescaleDB y MLflow como Model Registry.",
                "Walk-forward validation y reentrenamiento mensual simulado.",
            ],
            stack: [
                "Python",
                "FastAPI",
                "PostgreSQL",
                "TimescaleDB",
                "MLflow",
                "Docker",
            ],
            link: "https://github.com/JuanTrader500/quant-trading-platform",
            linkLabel: "Ver repositorio",
        },
        {
            id: "monitores",
            name: "Sistema de Gestión de Monitores",
            subtitle: "Aplicación full stack con IA, RAG y MCP",
            status: "Académico",
            statusTone: "info",
            description:
                "Sistema de gestión desarrollado con Python y Django que integra inteligencia artificial, Retrieval-Augmented Generation y Model Context Protocol para asistir la operación académica.",
            highlights: [
                "CRUD y flujos de gestión sobre Django.",
                "Integración de IA generativa con RAG.",
                "Uso de MCP para conectar herramientas y contexto.",
            ],
            stack: ["Python", "Django", "IA/RAG", "MCP"],
            link: "https://github.com/JuanTrader500/Sistema-de-gestion-de-monitores",
            linkLabel: "Ver repositorio",
        },
        {
            id: "portfolio",
            name: "Portafolio Terminal",
            subtitle: "Este sitio: terminal interactiva y CV imprimible",
            status: "En evolución",
            statusTone: "ok",
            description:
                "Portafolio personal construido sin frameworks: motor de comandos, historial navegable, autocompletado, temas de consola, visualizaciones SVG y una versión del CV lista para imprimir.",
            highlights: [
                "Motor de comandos con historial, Tab y deep links.",
                "Tres temas de consola y efecto CRT opcional.",
                "Diseño responsive, accesible y sin dependencias JS.",
            ],
            stack: ["HTML", "CSS", "JavaScript", "SVG"],
            link: "https://github.com/JuanTrader500/Portafolio-Parcial-1-PrograWeb",
            linkLabel: "Ver repositorio",
        },
    ];

    const education = [
        {
            title: "Tecnología en Desarrollo de Software",
            org: "Universidad Tecnológica de Pereira (UTP)",
            period: "En curso · Quinto semestre",
            type: "Educación superior",
            detail:
                "Formación en desarrollo de software, estructuras de datos, bases de datos, arquitectura, ingeniería de software y gestión de proyectos.",
        },
    ];

    const certifications = [
        {
            title: "Bootcamp en Inteligencia Artificial",
            org: "MinTIC",
            period: "2024",
            detail:
                "Fundamentos de inteligencia artificial, machine learning y aplicación de modelos en problemas reales.",
        },
        {
            title: "Professional Certificate in Data Science",
            org: "IBM / Coursera",
            period: "2026",
            detail:
                "Ciencia de datos aplicada: análisis, visualización, estadística y fundamentos de machine learning.",
        },
    ];

    const languages = [
        { name: "Español", level: "Nativo" },
        { name: "Inglés", level: "B1–B2 · conversacional y técnico" },
    ];

    const skills = [
        {
            name: "Data Science & ML",
            icon: "◈",
            items: [
                "Python",
                "Análisis de datos",
                "Limpieza y preparación",
                "Visualización",
                "Estadística",
                "ML supervisado",
                "ML no supervisado",
                "JupyterLab",
            ],
            core: ["Python", "Análisis de datos"],
        },
        {
            name: "Trading & Quant",
            icon: "◇",
            items: [
                "MQL5",
                "MetaTrader 5",
                "Backtesting",
                "Gestión de riesgo",
                "Datos financieros",
                "Estrategias cuantitativas",
                "DAX40",
                "EURUSD",
                "NASDAQ100",
            ],
            core: ["MQL5", "Backtesting", "Gestión de riesgo"],
        },
        {
            name: "DevOps & Linux",
            icon: "▣",
            items: [
                "Docker",
                "Linux",
                "Git/GitHub",
                "VPS",
                "Automatización",
                "Despliegue de servicios",
                "Monitoreo",
            ],
            core: ["Docker", "Linux", "Git/GitHub"],
        },
        {
            name: "Backend & Web",
            icon: "⌘",
            items: [
                "Python",
                "Django",
                "FastAPI",
                "Java",
                "C",
                "SQL (MySQL/PostgreSQL)",
                "APIs REST",
                "HTML/CSS",
            ],
            core: ["Python", "Django", "SQL (MySQL/PostgreSQL)"],
        },
        {
            name: "QA & Testing",
            icon: "✓",
            items: [
                "Pruebas funcionales",
                "Pruebas automatizadas",
                "Validación de flujos críticos",
                "Regresión",
                "Reporte de defectos",
                "Calidad en fintech",
            ],
            core: ["Pruebas funcionales", "Validación de flujos críticos"],
        },
    ];

    const interests = [
        {
            title: "Mercados financieros",
            detail:
                "Entender el mercado como un sistema complejo de datos, incentivos y riesgo.",
        },
        {
            title: "Trading algorítmico",
            detail:
                "Convertir ideas de mercado en reglas medibles, testeables y automatizables.",
        },
        {
            title: "Investigación cuantitativa",
            detail:
                "Buscar señales con evidencia: hipótesis, backtesting y validación fuera de muestra.",
        },
        {
            title: "Automatización",
            detail:
                "Eliminar trabajo repetitivo y reducir errores en procesos operativos y financieros.",
        },
        {
            title: "Infraestructura cloud y Linux",
            detail:
                "Desplegar servicios reproducibles con contenedores, VPS y buenas prácticas de operación.",
        },
        {
            title: "Open source y aprendizaje continuo",
            detail:
                "Leer código, compartir herramientas y aprender construyendo proyectos reales.",
        },
    ];

    const trading = {
        intro:
            "Mi enfoque combina análisis de datos, ingeniería de software y gestión de riesgo. No se trata solo de encontrar una señal: se trata de construir un sistema que pueda medirse, validarse y operar de forma consistente.",
        pipeline: [
            "MARKET DATA",
            "FEATURES",
            "SIGNAL",
            "RISK",
            "EXECUTION",
            "MONITORING",
        ],
        focus: [
            {
                title: "Estrategias cuantitativas",
                detail:
                    "Reglas medibles construidas a partir de datos, no de intuiciones difíciles de validar.",
            },
            {
                title: "Backtesting y validación",
                detail:
                    "Evaluación walk-forward, control de sobreajuste y separación entre entrenamiento y prueba.",
            },
            {
                title: "Análisis de datos financieros",
                detail:
                    "Series de tiempo, volatilidad, features técnicas y exploración de patrones de mercado.",
            },
            {
                title: "Gestión de riesgo",
                detail:
                    "Tamaño de posición, drawdown, exposición y reglas de salida antes de pensar en retorno.",
            },
        ],
        tools: [
            "Python",
            "pandas",
            "NumPy",
            "MQL5",
            "MetaTrader 5",
            "SQL",
            "Docker",
            "VPS",
            "Telegram API",
        ],
        instruments: ["DAX40", "EURUSD", "NASDAQ100"],
        metrics: [
            {
                name: "Sharpe ratio",
                detail: "Retorno ajustado por volatilidad.",
            },
            {
                name: "Max drawdown",
                detail: "Peor caída desde un máximo de equity.",
            },
            {
                name: "Win rate",
                detail: "Porcentaje de operaciones ganadoras.",
            },
            {
                name: "Profit factor",
                detail: "Ganancia bruta dividida por pérdida bruta.",
            },
            {
                name: "Expectancy",
                detail: "Resultado esperado por operación.",
            },
            {
                name: "Exposure",
                detail: "Tiempo y capital expuestos al mercado.",
            },
        ],
        disclaimer:
            "Contenido ilustrativo. No representa resultados reales de trading ni constituye asesoría financiera.",
    };

    window.PF = window.PF || {};
    window.PF.data = {
        profile,
        experience,
        freelance,
        projects,
        education,
        certifications,
        languages,
        skills,
        interests,
        trading,
    };
})();
