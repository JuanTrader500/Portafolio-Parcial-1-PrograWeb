/* ==========================================================================
   commands.js — registro de comandos y contenido de cada sección
   ========================================================================== */

(function () {
    "use strict";

    const PF = (window.PF = window.PF || {});
    const registry = new Map();
    const aliasMap = new Map();

    function register(definition) {
        registry.set(definition.name, definition);
        (definition.aliases || []).forEach(function (alias) {
            aliasMap.set(alias, definition.name);
        });
    }

    function get(name) {
        if (!name) return null;
        const normalized = String(name).toLowerCase();
        if (registry.has(normalized)) return registry.get(normalized);
        const canonical = aliasMap.get(normalized);
        return canonical ? registry.get(canonical) : null;
    }

    function canonicalName(name) {
        const command = get(name);
        return command ? command.name : null;
    }

    function all() {
        return Array.from(registry.values());
    }

    function aliasesFor(name) {
        const command = get(name);
        if (!command) return [];
        const result = [];
        aliasMap.forEach(function (canonical, alias) {
            if (canonical === command.name) result.push(alias);
        });
        return result.sort();
    }

    function parse(raw) {
        const parts = [];
        const regex = /(?:[^\s"]+|"[^"]*")+/g;
        let match = regex.exec(raw);
        while (match) {
            parts.push(match[0].replace(/^"|"$/g, ""));
            match = regex.exec(raw);
        }
        return {
            name: parts[0] || "",
            args: parts.slice(1),
        };
    }

    function suggest(input) {
        const names = all()
            .map(function (command) {
                return command.name;
            })
            .concat(Array.from(aliasMap.keys()));
        let best = null;
        let bestScore = Infinity;

        names.forEach(function (name) {
            const distance = levenshtein(input.toLowerCase(), name);
            if (distance < bestScore) {
                bestScore = distance;
                best = name;
            }
        });

        return bestScore <= 2 ? best : null;
    }

    function levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i += 1) matrix[i] = [i];
        for (let j = 0; j <= a.length; j += 1) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i += 1) {
            for (let j = 1; j <= a.length; j += 1) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    function errorLine(message) {
        return PF.ui.line("✗ " + message, "term-error");
    }

    function okLine(message) {
        return PF.ui.line("✓ " + message, "term-success");
    }

    function infoLine(message) {
        return PF.ui.line("· " + message, "term-muted");
    }

    function sectionTitle(title, meta) {
        return PF.ui.heading(title, meta);
    }

    function renderWhoami() {
        const p = PF.data.profile;
        const info = PF.ui.el("div", { class: "neofetch-info" }, [
            PF.ui.el("div", { class: "neofetch-title" }, [
                PF.ui.el("span", { class: "nf-user", text: p.handle }),
                PF.ui.el("span", { class: "nf-at", text: "@" }),
                PF.ui.el("span", { class: "nf-host", text: p.host }),
            ]),
            PF.ui.el("div", {
                class: "neofetch-rule",
                text: "─".repeat(42),
            }),
            PF.ui.kv([
                ["user", p.name],
                ["role", p.role],
                ["focus", p.focus],
                ["now", p.now],
                ["host", "UTP · Quinto semestre"],
                ["location", p.location],
                ["languages", p.languages],
                ["status", PF.ui.statusLine("ONLINE")],
            ]),
            PF.ui.paragraph(p.tagline, "neofetch-bio"),
            PF.ui.paragraph(p.summary, "neofetch-bio"),
            PF.ui.el("div", { class: "cmd-chips" }, [
                PF.ui.chip("trading", "trading"),
                PF.ui.chip("projects", "projects"),
                PF.ui.chip("skills", "skills"),
                PF.ui.chip("contact", "contact"),
            ]),
        ]);

        return [
            sectionTitle("WHOAMI", "perfil"),
            PF.ui.el("div", { class: "neofetch" }, [
                PF.ui.portrait(p),
                info,
            ]),
        ];
    }

    function renderTrading() {
        const t = PF.data.trading;
        const focusCards = t.focus.map(function (item) {
            return PF.ui.card({
                subtitle: "enfoque",
                title: item.title,
                body: PF.ui.el("p", { text: item.detail }),
                quiet: true,
            });
        });

        const chart = PF.ui.el("div", { class: "chart-shell" }, [
            PF.ui.el("div", { class: "chart-head" }, [
                PF.ui.el("span", {}, [
                    PF.ui.el("strong", { text: "EQUITY" }),
                    " / curva ilustrativa",
                ]),
                PF.ui.badge("VISUAL", "warn"),
            ]),
            PF.ui.el("div", {
                class: "equity-chart",
                html: PF.visuals.equityCurveSVG({
                    seed: 23,
                    points: 84,
                    width: 760,
                    height: 210,
                }),
            }),
            PF.ui.el("div", {
                class: "chart-note",
                text: "Curva decorativa. No representa resultados reales ni rendimiento histórico.",
            }),
        ]);

        const metrics = PF.ui.el(
            "div",
            { class: "metric-grid" },
            t.metrics.map(function (metric) {
                return PF.ui.el("div", { class: "metric-card" }, [
                    PF.ui.el("div", {
                        class: "metric-name",
                        text: metric.name,
                    }),
                    PF.ui.el("div", {
                        class: "metric-detail",
                        text: metric.detail,
                    }),
                ]);
            })
        );

        return [
            sectionTitle("TRADING ALGORÍTMICO", "quant · risk · data"),
            PF.ui.paragraph(t.intro),
            PF.ui.el("pre", {
                class: "ascii ascii--pipeline",
                text: PF.visuals.pipelineASCII(t.pipeline),
                "aria-label": "Pipeline cuantitativo: datos, features, señal, riesgo, ejecución y monitoreo",
            }),
            PF.ui.el("div", { class: "panel-grid" }, focusCards),
            PF.ui.card({
                subtitle: "stack",
                title: "Herramientas de trabajo",
                body: PF.ui.el("p", {
                    text:
                        "Instrumentos: " +
                        t.instruments.join(" · ") +
                        ". Del dato a la ejecución, con foco en reproducibilidad y control de riesgo.",
                }),
                tags: t.tools,
                coreTags: ["Python", "MQL5", "Backtesting", "Docker"],
                quiet: true,
            }),
            chart,
            PF.ui.divider("métricas de evaluación"),
            PF.ui.paragraph(
                "Estas son las métricas que uso para evaluar una estrategia. No son resultados: son preguntas que un sistema debe poder responder antes de operar.",
                "term-muted"
            ),
            metrics,
            PF.ui.el("div", { class: "callout callout--warn" }, [
                PF.ui.el("strong", { text: "Nota: " }),
                t.disclaimer,
            ]),
            PF.ui.el("div", { class: "cta-row" }, [
                PF.ui.btn("Ver Quant Trading Platform", {
                    href: "https://github.com/JuanTrader500/quant-trading-platform",
                    external: true,
                    primary: true,
                    icon: "↗",
                }),
                PF.ui.chip("open quant-platform", "open quant-platform"),
            ]),
        ];
    }

    function renderFreelance() {
        const cards = PF.data.freelance.map(function (item) {
            return PF.ui.card({
                title: item.title,
                subtitle: item.kicker,
                badge: {
                    label: item.status,
                    tone: item.status === "Privado" ? "info" : "ok",
                },
                body: [
                    PF.ui.el("p", { text: item.summary }),
                    PF.ui.list(item.bullets),
                ],
                tags: item.stack,
                coreTags: item.highlight
                    ? ["Python", "Django", "PostgreSQL", "Docker"]
                    : [],
                accent: item.highlight,
                className: item.highlight ? "card--highlight" : "",
                actions: [PF.ui.chip("contact", "contact")],
            });
        });

        return [
            sectionTitle("FREELANCE", "clientes reales · soluciones a medida"),
            PF.ui.paragraph(
                "Desarrollo soluciones completas para clientes: desde el problema y las reglas de negocio hasta el despliegue y la operación. Trabajo con confidencialidad cuando el proyecto lo requiere."
            ),
            PF.ui.el("div", { class: "project-grid" }, cards),
            PF.ui.divider("trabajemos juntos"),
            PF.ui.el("div", { class: "cta-row" }, [
                PF.ui.btn("Hablemos de tu proyecto", {
                    href: "mailto:juanandresm2006@gmail.com?subject=Proyecto%20freelance",
                    primary: true,
                    icon: "✉",
                }),
                PF.ui.btn("Ver experiencia", {
                    dataset: { command: "experience" },
                    ghost: true,
                    icon: "›",
                }),
            ]),
        ];
    }

    function renderExperience() {
        const items = PF.data.experience.map(function (item) {
            return PF.ui.el("article", { class: "timeline-item" }, [
                PF.ui.card({
                    title: item.role,
                    subtitle: item.period,
                    meta: [
                        PF.ui.el("strong", { text: item.company }),
                        " · " + item.type,
                    ],
                    badge:
                        item.id === "veritran"
                            ? { label: "Actual", tone: "ok" }
                            : { label: "Freelance", tone: "info" },
                    body: [
                        PF.ui.el("p", { text: item.summary }),
                        PF.ui.list(item.bullets),
                    ],
                    tags: item.stack,
                    quiet: true,
                }),
            ]);
        });

        return [
            sectionTitle("EXPERIENCE", "trayectoria formal y freelance"),
            PF.ui.paragraph(
                "Experiencia construyendo y validando software en contextos reales: calidad en fintech, desarrollo freelance y automatización de procesos."
            ),
            PF.ui.el("div", { class: "timeline" }, items),
            PF.ui.el("div", { class: "callout" }, [
                PF.ui.el("strong", { text: "Actualidad: " }),
                "prácticas de QA en Veritran y desarrollo freelance en paralelo.",
            ]),
        ];
    }

    function renderProjects() {
        const cards = PF.data.projects.map(function (project) {
            return PF.ui.card({
                titleNode: PF.ui.el(
                    "a",
                    {
                        href: project.link,
                        target: "_blank",
                        rel: "noopener noreferrer",
                    },
                    project.name
                ),
                subtitle: project.subtitle,
                badge: {
                    label: project.status,
                    tone: project.statusTone,
                },
                body: [
                    PF.ui.el("p", { text: project.description }),
                    PF.ui.list(project.highlights),
                ],
                tags: project.stack,
                actions: [
                    PF.ui.btn(project.linkLabel, {
                        href: project.link,
                        external: true,
                        ghost: true,
                        icon: "↗",
                    }),
                    PF.ui.chip("open " + project.id, "open " + project.id),
                ],
                className: "project-card",
            });
        });

        return [
            sectionTitle("PROJECTS", "software · data · devops"),
            PF.ui.paragraph(
                "Proyectos donde aplico ingeniería de software, datos y automatización. Puedes abrir cada repositorio o usar `open <id>` desde la terminal."
            ),
            PF.ui.el("div", { class: "project-grid" }, cards),
        ];
    }

    function renderEducation() {
        const educationCards = PF.data.education.map(function (item) {
            return PF.ui.card({
                title: item.title,
                subtitle: item.org,
                meta: item.period + " · " + item.type,
                body: PF.ui.el("p", { text: item.detail }),
                badge: { label: "En curso", tone: "ok" },
            });
        });

        const certificationCards = PF.data.certifications.map(function (item) {
            return PF.ui.card({
                title: item.title,
                subtitle: item.org,
                meta: item.period,
                body: PF.ui.el("p", { text: item.detail }),
                badge: { label: "Certificación", tone: "info" },
                quiet: true,
            });
        });

        return [
            sectionTitle("EDUCATION", "formación · certificaciones"),
            PF.ui.divider("formación académica"),
            PF.ui.el("div", { class: "project-grid" }, educationCards),
            PF.ui.divider("certificaciones"),
            PF.ui.el("div", { class: "project-grid" }, certificationCards),
            PF.ui.divider("idiomas"),
            PF.ui.el(
                "div",
                { class: "project-grid" },
                PF.data.languages.map(function (language) {
                    return PF.ui.card({
                        title: language.name,
                        meta: "Nivel",
                        body: PF.ui.el("p", { text: language.level }),
                        quiet: true,
                    });
                })
            ),
        ];
    }

    function renderSkills() {
        const cards = PF.data.skills.map(function (group) {
            return PF.ui.el("div", { class: "skill-card" }, [
                PF.ui.el("div", { class: "skill-head" }, [
                    PF.ui.el("span", {
                        class: "skill-icon",
                        text: group.icon,
                        "aria-hidden": "true",
                    }),
                    PF.ui.el("span", { text: group.name }),
                ]),
                PF.ui.el(
                    "div",
                    { class: "skill-items" },
                    group.items.map(function (item) {
                        return PF.ui.tag(
                            item,
                            (group.core || []).indexOf(item) !== -1
                        );
                    })
                ),
            ]);
        });

        return [
            sectionTitle("SKILLS", "stack técnico por categorías"),
            PF.ui.paragraph(
                "Herramientas y áreas con las que trabajo. Sin porcentajes inventados: las etiquetas resaltadas son las que uso con más frecuencia."
            ),
            PF.ui.el("div", { class: "skills-grid" }, cards),
        ];
    }

    function renderInterests() {
        const cards = PF.data.interests.map(function (item) {
            return PF.ui.el("article", { class: "interest-card" }, [
                PF.ui.el("div", {
                    class: "interest-title",
                    text: item.title,
                }),
                PF.ui.el("div", {
                    class: "interest-detail",
                    text: item.detail,
                }),
            ]);
        });

        return [
            sectionTitle("INTERESTS", "lo que me mueve"),
            PF.ui.paragraph(
                "Mercados, sistemas y aprendizaje. Estos son los temas que exploro por fuera de las entregas académicas y laborales."
            ),
            PF.ui.el("div", { class: "interests-grid" }, cards),
        ];
    }

    function renderContact() {
        const p = PF.data.profile;
        const mailto =
            "mailto:" +
            p.email +
            "?subject=Hola%20Juan%20%E2%80%94%20portafolio";

        const rows = [
            PF.ui.el(
                "a",
                { class: "contact-row", href: mailto },
                [
                    PF.ui.el("span", { class: "contact-label", text: "email" }),
                    PF.ui.el("span", { class: "contact-value", text: p.email }),
                ]
            ),
            PF.ui.el(
                "a",
                {
                    class: "contact-row",
                    href: p.github,
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
                [
                    PF.ui.el("span", { class: "contact-label", text: "github" }),
                    PF.ui.el("span", {
                        class: "contact-value",
                        text: "@JuanTrader500",
                    }),
                ]
            ),
            PF.ui.el(
                "a",
                {
                    class: "contact-row",
                    href: p.linkedin,
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
                [
                    PF.ui.el("span", {
                        class: "contact-label",
                        text: "linkedin",
                    }),
                    PF.ui.el("span", {
                        class: "contact-value",
                        text: "Juan Andrés Muñoz Zapata",
                    }),
                ]
            ),
            PF.ui.el("div", { class: "contact-row" }, [
                PF.ui.el("span", {
                    class: "contact-label",
                    text: "ubicación",
                }),
                PF.ui.el("span", {
                    class: "contact-value",
                    text: p.location + " · " + p.timezone,
                }),
            ]),
        ];

        return [
            sectionTitle("CONTACT", "canales directos"),
            PF.ui.line(PF.ui.statusLine(p.availability)),
            PF.ui.paragraph(
                "Si buscas un desarrollador con base en datos, automatización y criterio de calidad, hablemos. También estoy abierto a proyectos de trading algorítmico y consultoría técnica."
            ),
            PF.ui.el("div", { class: "contact-grid" }, rows),
            PF.ui.el("div", { class: "cta-row" }, [
                PF.ui.copyButton(p.email, "Copiar email"),
                PF.ui.btn("Enviar email", {
                    href: mailto,
                    primary: true,
                    icon: "✉",
                }),
                PF.ui.btn("LinkedIn", {
                    href: p.linkedin,
                    external: true,
                    icon: "↗",
                }),
                PF.ui.btn("CV imprimible", {
                    href: "cv.html",
                    external: true,
                    icon: "▤",
                }),
            ]),
            PF.ui.el("p", {
                class: "term-muted",
                text: "Tip: `contact --copy` copia el correo sin salir de la terminal.",
            }),
        ];
    }

    function renderHelp(args) {
        if (args && args.length) {
            return renderMan(args);
        }

        const groups = [
            {
                title: "Portafolio",
                names: [
                    "whoami",
                    "trading",
                    "freelance",
                    "experience",
                    "projects",
                    "education",
                    "skills",
                    "interests",
                    "contact",
                ],
            },
            {
                title: "Sistema",
                names: [
                    "help",
                    "ls",
                    "man",
                    "neofetch",
                    "theme",
                    "crt",
                    "stats",
                    "history",
                    "date",
                    "pwd",
                    "echo",
                    "banner",
                    "clear",
                    "open",
                    "cv",
                    "sudo",
                    "exit",
                ],
            },
        ];

        const nodes = [
            sectionTitle("HELP", "comandos disponibles"),
            PF.ui.paragraph(
                "Haz clic en cualquier comando o escríbelo. También puedes usar la barra superior, `Tab` para autocompletar y `Ctrl+K` para abrir la paleta."
            ),
        ];

        groups.forEach(function (group) {
            const rows = group.names
                .map(function (name) {
                    const command = get(name);
                    if (!command) return null;
                    return PF.ui.el("div", { class: "help-row" }, [
                        PF.ui.chip(name, name, { prefix: false }),
                        PF.ui.el("span", {
                            class: "help-desc",
                            text: command.summary,
                        }),
                    ]);
                })
                .filter(Boolean);

            nodes.push(
                PF.ui.el("div", { class: "help-group" }, [
                    PF.ui.el("h4", { text: group.title }),
                    rows,
                ])
            );
        });

        nodes.push(
            PF.ui.el("div", { class: "callout" }, [
                PF.ui.el("strong", { text: "Atajos: " }),
                "↑/↓ historial · Tab autocompletar · Ctrl+L limpiar · Ctrl+C cancelar · Ctrl+K paleta · Esc cerrar.",
            ])
        );

        return nodes;
    }

    function renderMan(args) {
        const name = args && args[0];
        if (!name) {
            return [
                errorLine("Uso: man <comando>"),
                infoLine("Ejemplo: man theme"),
            ];
        }

        const command = get(name);
        if (!command) {
            const suggestion = suggest(name);
            return [
                errorLine("No existe documentación para: " + name),
                suggestion
                    ? infoLine("Quizá quisiste decir: " + suggestion)
                    : infoLine("Prueba `help` para ver los comandos."),
            ];
        }

        const nodes = [
            sectionTitle("MAN " + command.name.toUpperCase(), "manual"),
            PF.ui.kv([
                ["uso", command.usage || command.name],
                ["alias", aliasesFor(command.name).join(", ") || "—"],
                ["desc", command.summary],
            ]),
        ];

        if (command.examples && command.examples.length) {
            nodes.push(PF.ui.divider("ejemplos"));
            nodes.push(
                PF.ui.el("div", { class: "cmd-chips" }, command.examples.map(function (example) {
                    return PF.ui.chip(example, example, { prefix: false });
                }))
            );
        }

        return nodes;
    }

    function renderLs() {
        const commands = all().slice().sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        const width =
            commands.reduce(function (max, command) {
                return Math.max(max, command.name.length);
            }, 0) + 3;
        const lines = commands.map(function (command) {
            return (
                command.name.padEnd(width) +
                (command.summary || "")
            );
        });

        return [
            sectionTitle("LS", commands.length + " comandos"),
            PF.ui.el("pre", {
                class: "ascii",
                text: lines.join("\n"),
            }),
            PF.ui.el("p", {
                class: "term-muted",
                text: "Usa `help` para una vista agrupada o `man <comando>` para el detalle.",
            }),
        ];
    }

    function renderTheme(args) {
        const themes = PF.effects.listThemes();
        const current = PF.effects.getTheme();
        const requested = args && args[0];

        if (!requested || requested === "list") {
            return [
                sectionTitle("THEME", "tema actual: " + current),
                PF.ui.paragraph(
                    "Cambia la paleta de toda la terminal. La preferencia se guarda en tu navegador."
                ),
                PF.ui.el(
                    "div",
                    { class: "cmd-chips" },
                    themes.map(function (theme) {
                        return PF.ui.chip(
                            theme + (theme === current ? " (activo)" : ""),
                            "theme " + theme,
                            { prefix: false }
                        );
                    })
                ),
            ];
        }

        if (requested === "next") {
            const next = PF.effects.cycleTheme();
            return [okLine("Tema aplicado: " + next)];
        }

        if (themes.indexOf(requested) === -1) {
            return [
                errorLine("Tema desconocido: " + requested),
                infoLine("Opciones: " + themes.join(", ")),
            ];
        }

        PF.effects.setTheme(requested);
        return [okLine("Tema aplicado: " + requested)];
    }

    function renderCrt(args) {
        const requested = (args && args[0]) || "toggle";
        if (requested === "on") {
            PF.effects.setCrt(true);
            return [okLine("Efecto CRT activado.")];
        }
        if (requested === "off") {
            PF.effects.setCrt(false);
            return [okLine("Efecto CRT desactivado.")];
        }
        if (requested === "toggle") {
            const enabled = PF.effects.toggleCrt();
            return [
                okLine("Efecto CRT " + (enabled ? "activado" : "desactivado") + "."),
            ];
        }
        return [
            errorLine("Uso: crt on|off|toggle"),
            infoLine("También puedes usar el botón CRT de la barra superior."),
        ];
    }

    function renderOpen(args) {
        const id = args && args[0];
        if (!id) {
            const rows = PF.data.projects.map(function (project) {
                return PF.ui.el("div", { class: "help-row" }, [
                    PF.ui.chip("open " + project.id, "open " + project.id, {
                        prefix: false,
                    }),
                    PF.ui.el("span", {
                        class: "help-desc",
                        text: project.name + " — " + project.subtitle,
                    }),
                ]);
            });
            return [
                sectionTitle("OPEN", "abrir un proyecto"),
                PF.ui.paragraph(
                    "Usa `open <id>` para abrir el repositorio en una pestaña nueva."
                ),
                PF.ui.el("div", { class: "help-group" }, rows),
            ];
        }

        const project = PF.data.projects.find(function (item) {
            return item.id === id;
        });

        if (!project) {
            return [
                errorLine("Proyecto no encontrado: " + id),
                infoLine(
                    "IDs disponibles: " +
                        PF.data.projects
                            .map(function (item) {
                                return item.id;
                            })
                            .join(", ")
                ),
            ];
        }

        window.open(project.link, "_blank", "noopener,noreferrer");
        return [
            okLine("Abriendo " + project.name + "…"),
            PF.ui.line(
                PF.ui.link(project.link, project.link, {
                    className: "link",
                })
            ),
        ];
    }

    function renderHistory(args) {
        if (args && (args[0] === "-c" || args[0] === "--clear")) {
            PF.terminal.clearHistory();
            return [okLine("Historial de comandos limpiado.")];
        }

        const history = PF.terminal.getHistory();
        if (!history.length) {
            return [infoLine("Aún no hay comandos en el historial.")];
        }

        const lines = history.map(function (command, index) {
            return String(index + 1).padStart(3, " ") + "  " + command;
        });

        return [
            sectionTitle("HISTORY", history.length + " comandos"),
            PF.ui.el("pre", {
                class: "ascii",
                text: lines.join("\n"),
            }),
            infoLine("Usa `history -c` para borrar el historial."),
        ];
    }

    function renderStats() {
        const theme = PF.effects.getTheme();
        const uptime = PF.effects.getUptime();
        const historySize = PF.terminal.getHistory().length;
        const commandCount = all().length;

        return [
            sectionTitle("STATS", "estado de la sesión"),
            PF.ui.kv([
                ["status", PF.ui.statusLine("ONLINE")],
                ["role", PF.data.profile.roleShort],
                ["theme", theme],
                ["uptime", uptime],
                ["commands", String(commandCount)],
                ["history", String(historySize)],
                ["timezone", PF.data.profile.timezone],
            ]),
            PF.ui.el("div", { class: "chart-shell" }, [
                PF.ui.el("div", { class: "chart-head" }, [
                    PF.ui.el("span", {}, [
                        PF.ui.el("strong", { text: "SPARK" }),
                        " / sesión",
                    ]),
                    PF.ui.badge("VISUAL", "warn"),
                ]),
                PF.ui.el("div", {
                    class: "sparkline",
                    html: PF.visuals.sparklineSVG({
                        seed: 9,
                        points: 56,
                        width: 280,
                        height: 64,
                    }),
                }),
                PF.ui.el("div", {
                    class: "chart-note",
                    text: "Curva decorativa, sin métricas reales.",
                }),
            ]),
            PF.ui.el("pre", {
                class: "ascii",
                text:
                    "EQUITY  " +
                    PF.visuals.asciiSparkline(17, 48) +
                    "\n        " +
                    PF.visuals.asciiSparkline(23, 48),
                "aria-label": "Sparkline ASCII decorativa, sin datos reales",
            }),
        ];
    }

    function renderContactCommand(args) {
        if (args && (args[0] === "--copy" || args[0] === "-c")) {
            return PF.ui.copyText(PF.data.profile.email).then(function (ok) {
                if (!ok) {
                    return [
                        errorLine("No se pudo copiar el correo."),
                        infoLine(PF.data.profile.email),
                    ];
                }
                PF.ui.toast("Email copiado: " + PF.data.profile.email);
                return [
                    okLine("Email copiado al portapapeles."),
                    PF.ui.line(PF.data.profile.email, "term-muted"),
                ];
            });
        }
        return renderContact();
    }

    /* Registro ------------------------------------------------------------- */

    register({
        name: "whoami",
        aliases: ["about", "sobre-mi", "quien-soy"],
        summary: "Perfil profesional, foto y enfoque.",
        usage: "whoami",
        run: renderWhoami,
    });

    register({
        name: "trading",
        aliases: ["quant", "algo-trading"],
        summary: "Trading algorítmico, backtesting y riesgo.",
        usage: "trading",
        run: renderTrading,
    });

    register({
        name: "freelance",
        aliases: ["servicios", "clientes"],
        summary: "Soluciones desarrolladas para clientes reales.",
        usage: "freelance",
        run: renderFreelance,
    });

    register({
        name: "experience",
        aliases: ["experiencia", "trayectoria"],
        summary: "Trayectoria laboral formal y freelance.",
        usage: "experience",
        run: renderExperience,
    });

    register({
        name: "projects",
        aliases: ["proyectos", "project"],
        summary: "Proyectos de software, datos y DevOps.",
        usage: "projects",
        run: renderProjects,
    });

    register({
        name: "education",
        aliases: ["educacion", "formacion", "estudios"],
        summary: "Estudios, certificaciones e idiomas.",
        usage: "education",
        run: renderEducation,
    });

    register({
        name: "skills",
        aliases: ["habilidades", "stack", "tech"],
        summary: "Stack técnico organizado por categorías.",
        usage: "skills",
        run: renderSkills,
    });

    register({
        name: "interests",
        aliases: ["intereses", "focus"],
        summary: "Intereses profesionales y personales.",
        usage: "interests",
        run: renderInterests,
    });

    register({
        name: "contact",
        aliases: ["contacto", "email"],
        summary: "Canales de contacto, copiar email y CV.",
        usage: "contact [--copy]",
        examples: ["contact", "contact --copy"],
        run: renderContactCommand,
        complete: function () {
            return ["--copy"];
        },
    });

    register({
        name: "help",
        aliases: ["ayuda", "?"],
        summary: "Lista de comandos y ayuda contextual.",
        usage: "help [comando]",
        examples: ["help", "help theme", "man projects"],
        run: renderHelp,
        complete: function () {
            return all().map(function (command) {
                return command.name;
            });
        },
    });

    register({
        name: "ls",
        aliases: ["dir"],
        summary: "Lista compacta de comandos.",
        usage: "ls",
        run: renderLs,
    });

    register({
        name: "man",
        aliases: ["manual"],
        summary: "Manual de un comando.",
        usage: "man <comando>",
        examples: ["man theme", "man open"],
        run: renderMan,
        complete: function () {
            return all().map(function (command) {
                return command.name;
            });
        },
    });

    register({
        name: "neofetch",
        aliases: ["fetch", "perfil"],
        summary: "Resumen visual del perfil.",
        usage: "neofetch",
        run: renderWhoami,
    });

    register({
        name: "theme",
        aliases: ["temas", "tema"],
        summary: "Cambia entre Matrix, Bloomberg Amber y Dracula.",
        usage: "theme [matrix|amber|dracula|list|next]",
        examples: ["theme", "theme amber", "theme next"],
        run: renderTheme,
        complete: function () {
            return ["matrix", "amber", "dracula", "list", "next"];
        },
    });

    register({
        name: "crt",
        aliases: ["scanlines"],
        summary: "Activa o desactiva el efecto CRT.",
        usage: "crt on|off|toggle",
        examples: ["crt on", "crt off"],
        run: renderCrt,
        complete: function () {
            return ["on", "off", "toggle"];
        },
    });

    register({
        name: "open",
        aliases: ["abrir"],
        summary: "Abre el repositorio de un proyecto.",
        usage: "open <id>",
        examples: ["open", "open quant-platform"],
        run: renderOpen,
        complete: function () {
            return PF.data.projects.map(function (project) {
                return project.id;
            });
        },
    });

    register({
        name: "history",
        aliases: ["historial"],
        summary: "Muestra o limpia el historial.",
        usage: "history [-c]",
        examples: ["history", "history -c"],
        run: renderHistory,
        complete: function () {
            return ["-c"];
        },
    });

    register({
        name: "stats",
        aliases: ["status", "estado"],
        summary: "Estado de la sesión y sparkline decorativa.",
        usage: "stats",
        run: renderStats,
    });

    register({
        name: "date",
        aliases: ["fecha"],
        summary: "Fecha y hora actual.",
        usage: "date",
        run: function () {
            const formatted = new Intl.DateTimeFormat("es-CO", {
                dateStyle: "full",
                timeStyle: "long",
            }).format(new Date());
            return [PF.ui.line(formatted, "term-info")];
        },
    });

    register({
        name: "pwd",
        aliases: [],
        summary: "Directorio actual simulado.",
        usage: "pwd",
        run: function () {
            return [PF.ui.line("/home/juan/portfolio", "term-muted")];
        },
    });

    register({
        name: "echo",
        aliases: [],
        summary: "Repite el texto que escribas.",
        usage: "echo <texto>",
        examples: ['echo "hola mundo"'],
        run: function (args) {
            return [PF.ui.line(args.join(" "), "term-copy")];
        },
    });

    register({
        name: "banner",
        aliases: ["logo"],
        summary: "ASCII art del portafolio.",
        usage: "banner",
        run: function () {
            return [
                PF.ui.el("pre", {
                    class: "ascii ascii--banner",
                    text: PF.visuals.banner,
                    "aria-label": "Juan Muñoz Zapata",
                }),
            ];
        },
    });

    register({
        name: "clear",
        aliases: ["cls", "limpiar"],
        summary: "Limpia la salida de la terminal.",
        usage: "clear",
        run: function () {
            return { clear: true };
        },
    });

    register({
        name: "cv",
        aliases: ["resume", "hoja-de-vida"],
        summary: "Abre el CV imprimible / Guardar como PDF.",
        usage: "cv",
        run: function () {
            window.open("cv.html", "_blank", "noopener,noreferrer");
            return [
                okLine("Abriendo CV imprimible…"),
                PF.ui.line(
                    PF.ui.link("cv.html", "cv.html", { className: "link" })
                ),
            ];
        },
    });

    register({
        name: "sudo",
        aliases: [],
        summary: "Intenta cosas que requieren privilegios.",
        usage: "sudo <comando>",
        run: function (args) {
            if (args.join(" ").toLowerCase() === "make me a sandwich") {
                return [PF.ui.line("Okay.", "term-success")];
            }
            return [
                PF.ui.line(
                    "juan is not in the sudoers file. This incident will be reported.",
                    "term-error"
                ),
            ];
        },
    });

    register({
        name: "exit",
        aliases: ["logout", "salir"],
        summary: "Cierra la sesión… o eso intenta.",
        usage: "exit",
        run: function () {
            return [
                PF.ui.line("Session is immortal. Prueba `contact`.", "term-warning"),
            ];
        },
    });

    PF.commands = {
        register: register,
        get: get,
        all: all,
        canonicalName: canonicalName,
        aliasesFor: aliasesFor,
        parse: parse,
        suggest: suggest,
    };
})();
