/* ==========================================================================
   cv.js — render del CV imprimible a partir de data.js
   ========================================================================== */

(function () {
    "use strict";

    const PF = (window.PF = window.PF || {});

    function append(parent, child) {
        if (child === null || child === undefined || child === false) return;
        if (Array.isArray(child)) {
            child.forEach(function (item) {
                append(parent, item);
            });
            return;
        }
        if (child instanceof Node) {
            parent.appendChild(child);
            return;
        }
        parent.appendChild(document.createTextNode(String(child)));
    }

    function el(tag, attrs, children) {
        const node = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (key) {
                const value = attrs[key];
                if (value === null || value === undefined || value === false) {
                    return;
                }
                if (key === "class") {
                    node.className = value;
                } else if (key === "text") {
                    node.textContent = value;
                } else if (key === "style" && typeof value === "object") {
                    Object.assign(node.style, value);
                } else if (key.indexOf("on") === 0 && typeof value === "function") {
                    node.addEventListener(key.slice(2).toLowerCase(), value);
                } else {
                    node.setAttribute(key, value);
                }
            });
        }
        append(node, children);
        return node;
    }

    function section(title, content) {
        return el("section", { class: "cv-section" }, [
            el("h2", { text: title }),
            content,
        ]);
    }

    function tags(items) {
        return el(
            "div",
            { class: "cv-tags" },
            items.map(function (item) {
                return el("span", { class: "cv-tag", text: item });
            })
        );
    }

    function bulletList(items) {
        return el(
            "ul",
            {},
            items.map(function (item) {
                return el("li", { text: item });
            })
        );
    }

    function entry(item, options) {
        const opts = options || {};
        const title = item.title || item.name || item.role;
        const org =
            item.org || item.company || item.subtitle || item.kicker;
        const head = el("div", { class: "cv-entry" }, [
            el("div", { class: "cv-entry-head" }, [
                el("div", {}, [
                    el("h3", { class: "cv-entry-title", text: title }),
                    org
                        ? el("div", { class: "cv-entry-org", text: org })
                        : null,
                ]),
                item.period
                    ? el("div", {
                          class: "cv-entry-period",
                          text: item.period,
                      })
                    : null,
            ]),
        ]);

        const summary = item.summary || item.detail || item.description;
        if (summary) {
            head.appendChild(
                el("p", { class: "cv-entry-summary", text: summary })
            );
        }

        if (item.bullets) {
            head.appendChild(bulletList(item.bullets));
        }

        if (item.highlights && !opts.skipHighlights) {
            head.appendChild(bulletList(item.highlights));
        }

        if (item.stack) {
            head.appendChild(tags(item.stack));
        }

        if (item.link) {
            head.appendChild(
                el(
                    "a",
                    {
                        class: "cv-entry-link",
                        href: item.link,
                        target: "_blank",
                        rel: "noopener noreferrer",
                    },
                    item.link
                )
            );
        }

        return head;
    }

    function render() {
        const data = PF.data;
        const p = data.profile;
        const root = document.getElementById("cv-root");
        if (!root) return;

        const mailto =
            "mailto:" +
            p.email +
            "?subject=Hola%20Juan%20%E2%80%94%20portafolio";

        const header = el("header", { class: "cv-header" }, [
            el("img", {
                class: "cv-photo",
                src: p.photo,
                alt: "Retrato de " + p.name,
                width: "360",
                height: "480",
                loading: "eager",
                decoding: "async",
            }),
            el("div", {}, [
                el("h1", { class: "cv-name", text: p.name }),
                el("p", { class: "cv-role", text: p.role }),
                el("div", { class: "cv-contact" }, [
                    el("span", {}, [
                        el("a", { href: mailto, text: p.email }),
                    ]),
                    el("span", {}, [
                        el(
                            "a",
                            {
                                href: p.github,
                                target: "_blank",
                                rel: "noopener noreferrer",
                            },
                            "github.com/JuanTrader500"
                        ),
                    ]),
                    el("span", {}, [
                        el(
                            "a",
                            {
                                href: p.linkedin,
                                target: "_blank",
                                rel: "noopener noreferrer",
                            },
                            "LinkedIn"
                        ),
                    ]),
                    el("span", {
                        text: p.location + " · " + p.timezone,
                    }),
                ]),
            ]),
        ]);

        const profile = el("p", {
            class: "cv-profile",
            text: p.summary,
        });

        const experience = el(
            "div",
            {},
            data.experience.map(function (item) {
                return entry(item);
            })
        );

        const freelance = el(
            "div",
            {},
            data.freelance.map(function (item) {
                return entry(item);
            })
        );

        const projects = el(
            "div",
            {},
            data.projects.map(function (item) {
                return entry(item, { skipHighlights: false });
            })
        );

        const education = el(
            "div",
            {},
            data.education.map(function (item) {
                return entry(item);
            })
        );

        const certifications = el(
            "div",
            {},
            data.certifications.map(function (item) {
                return entry(item);
            })
        );

        const skills = el(
            "div",
            { class: "cv-two-col" },
            data.skills.map(function (group) {
                return el("div", { class: "cv-skill-group" }, [
                    el("h3", { text: group.name }),
                    el("p", { text: group.items.join(" · ") }),
                ]);
            })
        );

        const languages = el(
            "ul",
            { class: "cv-inline-list" },
            data.languages.map(function (language) {
                return el("li", {
                    text: language.name + ": " + language.level,
                });
            })
        );

        const footer = el("footer", { class: "cv-footer" }, [
            el("span", { text: "Juan Andrés Muñoz Zapata · " + p.location }),
            el("span", { text: "Portafolio interactivo disponible en GitHub" }),
        ]);

        root.appendChild(header);
        root.appendChild(section("Perfil", profile));
        root.appendChild(section("Experiencia", experience));
        root.appendChild(section("Freelance", freelance));
        root.appendChild(section("Proyectos", projects));

        const educationWrap = el("div", { class: "cv-two-col" }, [
            el("div", {}, [section("Educación", education)]),
            el("div", {}, [section("Certificaciones", certifications)]),
        ]);

        root.appendChild(educationWrap);
        root.appendChild(section("Habilidades", skills));
        root.appendChild(section("Idiomas", languages));
        root.appendChild(footer);
    }

    function init() {
        render();

        const printButton = document.getElementById("cv-print");
        if (printButton) {
            printButton.addEventListener("click", function () {
                window.print();
            });
        }

        if (
            new URLSearchParams(window.location.search).get("print") === "1"
        ) {
            window.setTimeout(function () {
                window.print();
            }, 450);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
