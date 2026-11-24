/* ==========================================================================
   ui.js — helpers de construcción de DOM para la terminal
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

    function applyAttrs(node, attrs) {
        if (!attrs) return;
        Object.keys(attrs).forEach(function (key) {
            const value = attrs[key];
            if (value === null || value === undefined || value === false) return;

            if (key === "class" || key === "className") {
                node.className = value;
            } else if (key === "text") {
                node.textContent = value;
            } else if (key === "html") {
                node.innerHTML = value;
            } else if (key === "dataset") {
                Object.keys(value).forEach(function (dataKey) {
                    node.dataset[dataKey] = value[dataKey];
                });
            } else if (key === "style" && typeof value === "object") {
                Object.keys(value).forEach(function (styleKey) {
                    node.style[styleKey] = value[styleKey];
                });
            } else if (key.indexOf("on") === 0 && typeof value === "function") {
                node.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (value === true) {
                node.setAttribute(key, "");
            } else {
                node.setAttribute(key, value);
            }
        });
    }

    function el(tag, attrs, children) {
        const node = document.createElement(tag);
        applyAttrs(node, attrs);
        append(node, children);
        return node;
    }

    function line(content, className) {
        return el("div", { class: "term-line " + (className || "") }, content);
    }

    function heading(title, meta) {
        return el("div", { class: "term-heading" }, [
            el("span", { class: "heading-bracket", text: "[" }),
            el("span", { text: title }),
            el("span", { class: "heading-bracket", text: "]" }),
            meta
                ? el("span", { class: "heading-meta", text: meta })
                : null,
        ]);
    }

    function divider(label) {
        return el("div", { class: "term-divider" }, [
            el("span", { text: label ? "// " + label : "//" }),
        ]);
    }

    function paragraph(content, className) {
        return el("p", { class: className || "term-copy" }, content);
    }

    function kv(rows) {
        const dl = el("dl", { class: "kv-grid" });
        rows.forEach(function (row) {
            const label = Array.isArray(row) ? row[0] : row.label;
            const value = Array.isArray(row) ? row[1] : row.value;
            dl.appendChild(el("dt", { text: label }));
            dl.appendChild(el("dd", {}, value));
        });
        return dl;
    }

    function chip(label, command, options) {
        const opts = options || {};
        const children = [];
        if (opts.prefix !== false) {
            children.push(el("span", { class: "chip-prefix", text: "$" }));
        }
        children.push(label);

        return el(
            "button",
            {
                type: "button",
                class:
                    "cmd-chip" +
                    (opts.className ? " " + opts.className : ""),
                dataset: { command: command },
                title: opts.title || "Ejecutar " + command,
                "aria-label": opts.ariaLabel || "Ejecutar comando " + command,
            },
            children
        );
    }

    function tag(label, core) {
        return el("span", {
            class: "tag" + (core ? " tag--core" : ""),
            text: label,
        });
    }

    function tagList(items, coreItems) {
        const core = coreItems || [];
        return el(
            "div",
            { class: "tag-list" },
            items.map(function (item) {
                return tag(item, core.indexOf(item) !== -1);
            })
        );
    }

    function badge(label, tone) {
        const tones = {
            ok: "badge--ok",
            warn: "badge--warn",
            info: "badge--info",
        };
        return el("span", {
            class: "badge " + (tones[tone] || ""),
            text: label,
        });
    }

    function list(items, options) {
        const opts = options || {};
        return el(
            "ul",
            {
                class:
                    "term-list" +
                    (opts.check ? " term-list--check" : "") +
                    (opts.plain ? " term-list--plain" : ""),
            },
            items.map(function (item) {
                return el("li", {}, item);
            })
        );
    }

    function statusLine(text) {
        return el("span", { class: "status-line" }, [
            el("span", { class: "status-dot", "aria-hidden": "true" }),
            el("span", { text: text }),
        ]);
    }

    function card(options) {
        const opts = options || {};
        const titleNode = opts.titleNode || opts.title;
        const head = el("div", { class: "card-head" }, [
            el("div", {}, [
                opts.subtitle
                    ? el("div", {
                          class: "card-subtitle",
                          text: opts.subtitle,
                      })
                    : null,
                opts.title || opts.titleNode
                    ? el("h3", { class: "card-title" }, titleNode)
                    : null,
            ]),
            opts.badge
                ? badge(opts.badge.label, opts.badge.tone)
                : null,
        ]);

        return el(
            "article",
            {
                class:
                    "card" +
                    (opts.accent ? " card--accent" : "") +
                    (opts.quiet ? " card--quiet" : "") +
                    (opts.className ? " " + opts.className : ""),
            },
            [
                head,
                opts.meta ? el("div", { class: "card-meta" }, opts.meta) : null,
                opts.body ? el("div", { class: "card-body" }, opts.body) : null,
                opts.tags ? tagList(opts.tags, opts.coreTags) : null,
                opts.actions
                    ? el("div", { class: "card-actions" }, opts.actions)
                    : null,
            ]
        );
    }

    function link(label, href, options) {
        const opts = options || {};
        const isExternal = href.indexOf("http") === 0;
        const attrs = {
            href: href,
            class: opts.className || "link",
        };
        if (isExternal) {
            attrs.target = "_blank";
            attrs.rel = "noopener noreferrer";
        }
        if (opts.download) attrs.download = opts.download;

        return el("a", attrs, [
            label,
            isExternal
                ? el("span", {
                      class: "link-ext",
                      text: " ↗",
                      "aria-hidden": "true",
                  })
                : null,
        ]);
    }

    function btn(label, options) {
        const opts = options || {};
        const children = [
            opts.icon
                ? el("span", { class: "btn-icon", text: opts.icon, "aria-hidden": "true" })
                : null,
            label,
        ];
        if (opts.href) {
            return el(
                "a",
                {
                    href: opts.href,
                    class:
                        "btn" +
                        (opts.primary ? " btn--primary" : "") +
                        (opts.ghost ? " btn--ghost" : ""),
                    target: opts.external ? "_blank" : null,
                    rel: opts.external ? "noopener noreferrer" : null,
                },
                children
            );
        }
        return el(
            "button",
            {
                type: "button",
                class:
                    "btn" +
                    (opts.primary ? " btn--primary" : "") +
                    (opts.ghost ? " btn--ghost" : ""),
                dataset: opts.dataset || null,
                "aria-label": opts.ariaLabel || null,
            },
            children
        );
    }

    function copyButton(text, label) {
        return el(
            "button",
            {
                type: "button",
                class: "btn btn--ghost",
                dataset: { copy: text },
                "aria-label": "Copiar " + text,
            },
            [el("span", { class: "btn-icon", text: "⧉", "aria-hidden": "true" }), label]
        );
    }

    function promptEcho(raw) {
        const profile = PF.data.profile;
        return el("div", { class: "term-line term-echo" }, [
            el("span", { class: "echo-user", text: profile.handle }),
            el("span", { class: "echo-at", text: "@" }),
            el("span", { class: "echo-host", text: profile.host }),
            el("span", { class: "echo-colon", text: ":" }),
            el("span", { class: "echo-path", text: "~" }),
            el("span", { class: "echo-dollar", text: " $ " }),
            el("span", { class: "echo-cmd", text: raw }),
        ]);
    }

    function portrait(profile) {
        return el("figure", { class: "portrait" }, [
            el("div", { class: "portrait-frame" }, [
                el("img", {
                    src: profile.photo,
                    alt: "Retrato de " + profile.name,
                    width: "360",
                    height: "480",
                    loading: "eager",
                    decoding: "async",
                }),
            ]),
            el("figcaption", { class: "portrait-caption" }, [
                el("strong", { text: "IMG_01" }),
                el("span", { text: "// juan@portfolio" }),
            ]),
        ]);
    }

    async function copyText(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (error) {
            /* continúa con el fallback */
        }

        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.setAttribute("readonly", "");
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            textarea.style.top = "0";
            document.body.appendChild(textarea);
            textarea.select();
            const ok = document.execCommand("copy");
            textarea.remove();
            return ok;
        } catch (error) {
            return false;
        }
    }

    function toast(message) {
        const root = document.getElementById("toast-root");
        if (!root) return;
        const node = el("div", { class: "toast", role: "status" }, message);
        root.appendChild(node);
        window.setTimeout(function () {
            node.style.opacity = "0";
            node.style.transition = "opacity 180ms ease";
            window.setTimeout(function () {
                node.remove();
            }, 200);
        }, 2400);
    }

    PF.ui = {
        append: append,
        el: el,
        line: line,
        heading: heading,
        divider: divider,
        paragraph: paragraph,
        kv: kv,
        chip: chip,
        tag: tag,
        tagList: tagList,
        badge: badge,
        list: list,
        statusLine: statusLine,
        card: card,
        link: link,
        btn: btn,
        copyButton: copyButton,
        promptEcho: promptEcho,
        portrait: portrait,
        copyText: copyText,
        toast: toast,
    };
})();
