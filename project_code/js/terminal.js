/* ==========================================================================
   terminal.js — motor interactivo de la terminal
   ========================================================================== */

(function () {
    "use strict";

    const PF = (window.PF = window.PF || {});
    const MAX_HISTORY = 50;
    const MAX_BLOCKS = 70;

    let outputEl;
    let formEl;
    let inputEl;
    let mirrorContent;
    let mirrorWrap;
    let placeholderEl;
    let promptRow;
    let hintEl;
    let paletteEl;
    let paletteInput;
    let paletteList;

    let cmdHistory = [];
    let historyIndex = 0;
    let draft = "";
    let tabState = null;
    let currentHash = "";
    let paletteItems = [];
    let paletteIndex = 0;

    function reducedMotion() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function finePointer() {
        return window.matchMedia("(pointer: fine)").matches;
    }

    function focusInput() {
        if (!inputEl) return;
        if (finePointer()) {
            inputEl.focus({ preventScroll: true });
        }
    }

    function loadHistory() {
        try {
            const raw = window.localStorage.getItem("pf.history");
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                cmdHistory = parsed
                    .filter(function (item) {
                        return typeof item === "string";
                    })
                    .slice(-MAX_HISTORY);
            }
        } catch (error) {
            cmdHistory = [];
        }
        historyIndex = cmdHistory.length;
    }

    function saveHistory() {
        try {
            window.localStorage.setItem(
                "pf.history",
                JSON.stringify(cmdHistory.slice(-MAX_HISTORY))
            );
        } catch (error) {
            /* localStorage puede estar bloqueado */
        }
    }

    function addHistory(command) {
        if (!command) return;
        if (cmdHistory[cmdHistory.length - 1] !== command) {
            cmdHistory.push(command);
            if (cmdHistory.length > MAX_HISTORY) {
                cmdHistory.shift();
            }
            saveHistory();
        }
        historyIndex = cmdHistory.length;
        draft = "";
    }

    function clearHistory() {
        cmdHistory = [];
        historyIndex = 0;
        draft = "";
        try {
            window.localStorage.removeItem("pf.history");
        } catch (error) {
            /* sin acción */
        }
    }

    function getHistory() {
        return cmdHistory.slice();
    }

    function syncMirror() {
        if (!inputEl || !mirrorContent) return;

        const value = inputEl.value;
        const start =
            inputEl.selectionStart === null
                ? value.length
                : inputEl.selectionStart;
        const end =
            inputEl.selectionEnd === null ? start : inputEl.selectionEnd;

        const before = value.slice(0, start);
        const selected = value.slice(start, end);
        const after = value.slice(end);

        mirrorContent.textContent = "";
        mirrorContent.appendChild(document.createTextNode(before));

        if (selected) {
            const selection = document.createElement("span");
            selection.className = "mirror-selection";
            selection.textContent = selected;
            mirrorContent.appendChild(selection);
        }

        const cursor = document.createElement("span");
        cursor.className = "cursor";
        if (after) {
            cursor.textContent = after.charAt(0);
            mirrorContent.appendChild(cursor);
            mirrorContent.appendChild(
                document.createTextNode(after.slice(1))
            );
        } else {
            cursor.textContent = "\u00a0";
            mirrorContent.appendChild(cursor);
        }

        if (!value && document.activeElement !== inputEl) {
            cursor.style.display = "none";
        }

        if (placeholderEl) {
            placeholderEl.hidden =
                value.length > 0 || document.activeElement === inputEl;
        }

        if (promptRow) {
            promptRow.classList.toggle(
                "is-focused",
                document.activeElement === inputEl
            );
        }

        if (mirrorWrap) {
            mirrorWrap.scrollLeft = inputEl.scrollLeft;
        }
    }

    function appendBlock(content) {
        const block = document.createElement("div");
        block.className = "term-block";
        PF.ui.append(block, content);
        outputEl.appendChild(block);

        while (outputEl.children.length > MAX_BLOCKS) {
            outputEl.removeChild(outputEl.firstElementChild);
        }
    }

    function scrollToBottom() {
        window.requestAnimationFrame(function () {
            outputEl.scrollTo({
                top: outputEl.scrollHeight,
                behavior: reducedMotion() ? "auto" : "smooth",
            });
        });
    }

    function scrollToBlock(block) {
        if (!block) {
            scrollToBottom();
            return;
        }

        window.requestAnimationFrame(function () {
            const outputRect = outputEl.getBoundingClientRect();
            const blockRect = block.getBoundingClientRect();
            const blockTop =
                blockRect.top - outputRect.top + outputEl.scrollTop;
            const viewHeight = outputEl.clientHeight;
            const target =
                blockRect.height < viewHeight - 16
                    ? Math.max(
                          0,
                          blockTop + blockRect.height - viewHeight + 16
                      )
                    : Math.max(0, blockTop - 4);

            outputEl.scrollTo({
                top: target,
                behavior: reducedMotion() ? "auto" : "smooth",
            });
        });
    }

    function getHash() {
        return decodeURIComponent(
            window.location.hash.replace(/^#\/?/, "").trim()
        );
    }

    function setHash(name) {
        if (!name) return;
        currentHash = name;
        try {
            window.history.replaceState(null, "", "#" + name);
        } catch (error) {
            window.location.hash = name;
        }
    }

    function unknownCommand(name) {
        const suggestion = PF.commands.suggest(name);
        const nodes = [
            PF.ui.line("command not found: " + name, "term-error"),
        ];

        if (suggestion) {
            nodes.push(
                PF.ui.line(
                    [
                        "Did you mean ",
                        PF.ui.chip(suggestion, suggestion, { prefix: false }),
                        "?",
                    ],
                    "term-muted"
                )
            );
        } else {
            nodes.push(
                PF.ui.line(
                    "Escribe `help` para ver todos los comandos.",
                    "term-muted"
                )
            );
        }

        return nodes;
    }

    async function execute(raw, options) {
        const opts = options || {};
        const commandLine = String(raw || "").trim();
        if (!commandLine) return;

        const parsed = PF.commands.parse(commandLine);
        const command = PF.commands.get(parsed.name);

        if (command && command.name === "clear") {
            addHistory(commandLine);
            clear();
            return;
        }

        const block = document.createElement("div");
        block.className = "term-block";
        if (opts.echo !== false) {
            block.appendChild(PF.ui.promptEcho(commandLine));
        }

        if (!command) {
            if (!opts.skipHistory) addHistory(commandLine);
            PF.ui.append(block, unknownCommand(parsed.name));
            outputEl.appendChild(block);
            scrollToBlock(block);
            return;
        }

        if (!opts.skipHistory) addHistory(commandLine);

        let result;
        try {
            result = await command.run(parsed.args, commandLine);
        } catch (error) {
            console.error(error);
            result = [
                PF.ui.line(
                    "Se produjo un error ejecutando `" + command.name + "`.",
                    "term-error"
                ),
                PF.ui.line("Revisa la consola del navegador.", "term-muted"),
            ];
        }

        if (result && result.clear) {
            clear();
            return;
        }

        PF.ui.append(block, result);
        outputEl.appendChild(block);

        if (opts.updateHash !== false && command.name !== "clear") {
            const isSection = [
                "whoami",
                "trading",
                "freelance",
                "experience",
                "projects",
                "education",
                "skills",
                "interests",
                "contact",
            ].indexOf(command.name) !== -1;
            if (isSection) setHash(command.name);
        }

        scrollToBlock(block);
    }

    function clear() {
        outputEl.textContent = "";
        hintEl.textContent = "";
        tabState = null;
        currentHash = "";
        try {
            window.history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search
            );
        } catch (error) {
            /* sin acción */
        }
        focusInput();
    }

    function navigateHistory(direction) {
        if (!cmdHistory.length) return;

        if (direction < 0) {
            if (historyIndex === cmdHistory.length) {
                draft = inputEl.value;
            }
            if (historyIndex > 0) historyIndex -= 1;
            inputEl.value = cmdHistory[historyIndex] || "";
        } else {
            if (historyIndex < cmdHistory.length - 1) {
                historyIndex += 1;
                inputEl.value = cmdHistory[historyIndex] || "";
            } else {
                historyIndex = cmdHistory.length;
                inputEl.value = draft;
            }
        }

        const end = inputEl.value.length;
        inputEl.setSelectionRange(end, end);
        syncMirror();
        hintEl.textContent = "";
        tabState = null;
    }

    function commonPrefix(items) {
        if (!items.length) return "";
        return items.reduce(function (prefix, item) {
            let index = 0;
            while (
                index < prefix.length &&
                index < item.length &&
                prefix.charAt(index).toLowerCase() ===
                    item.charAt(index).toLowerCase()
            ) {
                index += 1;
            }
            return prefix.slice(0, index);
        });
    }

    function replaceToken(prefix, replacement, suffix) {
        inputEl.value = prefix + replacement + suffix;
        const position = prefix.length + replacement.length;
        inputEl.setSelectionRange(position, position);
        syncMirror();
        focusInput();
    }

    function showHint(message) {
        hintEl.textContent = message;
    }

    function completionCandidates() {
        const value = inputEl.value;
        const caret =
            inputEl.selectionStart === null
                ? value.length
                : inputEl.selectionStart;
        const before = value.slice(0, caret);
        const after = value.slice(caret);
        const tokenMatch = before.match(/(?:^|\s)([^\s]*)$/);
        const token = tokenMatch ? tokenMatch[1] : "";
        const prefix = before.slice(0, before.length - token.length);
        const trimmed = before.trim();
        const parts = trimmed ? trimmed.split(/\s+/) : [];
        const isFirstToken = parts.length <= 1 && !/\s$/.test(before);

        let candidates = [];
        if (isFirstToken) {
            const names = PF.commands
                .all()
                .map(function (command) {
                    return command.name;
                })
                .sort();
            const aliases = [];
            PF.commands.all().forEach(function (command) {
                PF.commands.aliasesFor(command.name).forEach(function (alias) {
                    aliases.push(alias);
                });
            });
            aliases.sort();
            candidates = names
                .concat(aliases)
                .filter(function (name) {
                    return name.indexOf(token.toLowerCase()) === 0;
                });
        } else {
            const commandName = parts[0];
            const command = PF.commands.get(commandName);
            if (command && typeof command.complete === "function") {
                const args = parts.slice(1);
                if (before.endsWith(" ")) args.push("");
                candidates = command.complete(args, { partial: token });
            }
        }

        return {
            candidates: Array.from(new Set(candidates)),
            token: token,
            prefix: prefix,
            suffix: after,
            isFirstToken: isFirstToken,
        };
    }

    function handleTab(event) {
        event.preventDefault();

        if (tabState && tabState.value === inputEl.value) {
            const nextIndex =
                tabState.index < 0
                    ? 0
                    : (tabState.index + 1) % tabState.matches.length;
            tabState.index = nextIndex;
            inputEl.value =
                tabState.prefix +
                tabState.matches[nextIndex] +
                tabState.suffix;
            tabState.value = inputEl.value;
            const end = tabState.prefix.length + tabState.matches[nextIndex].length;
            inputEl.setSelectionRange(end, end);
            syncMirror();
            focusInput();
            showHint(
                "Tab: " +
                    tabState.matches.join("   ") +
                    "   (ciclo " +
                    (nextIndex + 1) +
                    "/" +
                    tabState.matches.length +
                    ")"
            );
            return;
        }

        const state = completionCandidates();
        const candidates = state.candidates;

        if (!candidates.length) {
            showHint(
                state.token
                    ? "Sin coincidencias para «" + state.token + "»."
                    : "Sin coincidencias."
            );
            tabState = null;
            return;
        }

        if (candidates.length === 1) {
            replaceToken(state.prefix, candidates[0], state.suffix);
            showHint("");
            tabState = null;
            return;
        }

        if (!state.token && state.isFirstToken) {
            tabState = {
                prefix: state.prefix,
                suffix: state.suffix,
                matches: candidates,
                index: -1,
                value: inputEl.value,
            };
            showHint(
                "Tab: " +
                    candidates.slice(0, 14).join("   ") +
                    (candidates.length > 14 ? "   …" : "")
            );
            return;
        }

        const prefix = commonPrefix(candidates);
        if (prefix.length > state.token.length) {
            replaceToken(state.prefix, prefix, state.suffix);
            tabState = {
                prefix: state.prefix,
                suffix: state.suffix,
                matches: candidates,
                index: -1,
                value: inputEl.value,
            };
            showHint(
                "Tab: " +
                    candidates.slice(0, 14).join("   ") +
                    (candidates.length > 14 ? "   …" : "")
            );
            return;
        }

        tabState = {
            prefix: state.prefix,
            suffix: state.suffix,
            matches: candidates,
            index: -1,
            value: inputEl.value,
        };
        showHint(
            "Tab: " +
                candidates.slice(0, 14).join("   ") +
                (candidates.length > 14 ? "   …" : "")
        );
    }

    function initPalette() {
        paletteEl = document.getElementById("palette");
        paletteInput = document.getElementById("palette-input");
        paletteList = document.getElementById("palette-list");
        if (!paletteEl || !paletteInput || !paletteList) return;

        paletteInput.addEventListener("input", function () {
            renderPalette(paletteInput.value);
        });

        paletteInput.addEventListener("keydown", function (event) {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                paletteIndex = Math.min(
                    paletteItems.length - 1,
                    paletteIndex + 1
                );
                updatePaletteActive();
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                paletteIndex = Math.max(0, paletteIndex - 1);
                updatePaletteActive();
            } else if (event.key === "Enter") {
                event.preventDefault();
                choosePaletteItem();
            } else if (event.key === "Escape") {
                event.preventDefault();
                closePalette();
            } else if (event.key === "Tab") {
                event.preventDefault();
            }
        });
    }

    function paletteScore(command, query) {
        if (!query) return 0;
        const name = command.name.toLowerCase();
        const summary = (command.summary || "").toLowerCase();
        const aliases = PF.commands
            .aliasesFor(command.name)
            .join(" ")
            .toLowerCase();

        if (name === query) return 0;
        if (name.indexOf(query) === 0) return 1;
        if (name.indexOf(query) !== -1) return 2;
        if (aliases.indexOf(query) !== -1) return 3;
        if (summary.indexOf(query) !== -1) return 4;
        return 99;
    }

    function renderPalette(query) {
        if (!paletteList) return;
        const normalized = query.trim().toLowerCase();
        paletteList.textContent = "";
        paletteItems = [];

        const commands = PF.commands
            .all()
            .map(function (command) {
                return {
                    command: command,
                    score: paletteScore(command, normalized),
                };
            })
            .filter(function (item) {
                return item.score < 99;
            })
            .sort(function (a, b) {
                if (a.score !== b.score) return a.score - b.score;
                return a.command.name.localeCompare(b.command.name);
            });

        if (!commands.length) {
            paletteList.appendChild(
                PF.ui.el("div", {
                    class: "palette-empty",
                    text: "Sin comandos para «" + query + "».",
                })
            );
            paletteIndex = 0;
            paletteInput.removeAttribute("aria-activedescendant");
            return;
        }

        commands.forEach(function (item, index) {
            const command = item.command;
            const button = PF.ui.el(
                "button",
                {
                    type: "button",
                    class: "palette-item",
                    role: "option",
                    id: "palette-item-" + index,
                    dataset: { command: command.name },
                    "aria-selected": "false",
                },
                [
                    PF.ui.el("span", {
                        class: "p-name",
                        text: command.name,
                    }),
                    PF.ui.el("span", {
                        class: "p-desc",
                        text: command.summary,
                    }),
                ]
            );

            button.addEventListener("click", function (event) {
                event.stopPropagation();
                closePalette();
                execute(command.name, { echo: true });
            });

            paletteList.appendChild(button);
            paletteItems.push(button);
        });

        paletteIndex = 0;
        updatePaletteActive();
    }

    function updatePaletteActive() {
        paletteItems.forEach(function (item, index) {
            const active = index === paletteIndex;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-selected", active ? "true" : "false");
        });

        const activeItem = paletteItems[paletteIndex];
        if (activeItem) {
            paletteInput.setAttribute(
                "aria-activedescendant",
                activeItem.id
            );
            activeItem.scrollIntoView({ block: "nearest" });
        }
    }

    function choosePaletteItem() {
        const item = paletteItems[paletteIndex];
        if (!item) return;
        const command = item.dataset.command;
        closePalette();
        execute(command, { echo: true });
    }

    function openPalette() {
        if (!paletteEl) return;
        paletteEl.hidden = false;
        document.body.classList.add("palette-open");
        paletteInput.setAttribute("aria-expanded", "true");
        paletteInput.value = "";
        renderPalette("");
        paletteInput.focus();
    }

    function closePalette() {
        if (!paletteEl) return;
        paletteEl.hidden = true;
        document.body.classList.remove("palette-open");
        paletteInput.setAttribute("aria-expanded", "false");
        paletteInput.removeAttribute("aria-activedescendant");
        focusInput();
    }

    function boot() {
        const bootLines = [
            ["portfolio-os 1.0.0 — booting…", "term-muted"],
            ["[ OK ] cargando perfil de juan", "term-success"],
            ["[ OK ] montando /home/juan/portfolio", "term-success"],
            ["[ OK ] cargando datos, temas y comandos", "term-success"],
        ];

        appendBlock(
            bootLines.map(function (item) {
                return PF.ui.line(item[0], item[1]);
            })
        );

        appendBlock([
            PF.ui.heading("WELCOME", "terminal portfolio"),
            PF.ui.paragraph(
                "Bienvenido. Esta terminal también se puede navegar con clics. Escribe `help` o usa los comandos de arriba."
            ),
            PF.ui.el("div", { class: "cmd-chips" }, [
                PF.ui.chip("whoami", "whoami"),
                PF.ui.chip("trading", "trading"),
                PF.ui.chip("projects", "projects"),
                PF.ui.chip("contact", "contact"),
                PF.ui.chip("help", "help"),
            ]),
            PF.ui.line(
                "Sugerencia: `↑`/`↓` historial · `Tab` autocompletar · `Ctrl+K` paleta.",
                "term-muted"
            ),
        ]);
    }

    function routeInitial() {
        const hash = getHash();
        if (hash) {
            currentHash = hash;
            const command = PF.commands.get(hash);
            if (command) {
                execute(hash, {
                    echo: true,
                    updateHash: false,
                    skipHistory: true,
                });
            } else {
                execute("whoami", {
                    echo: false,
                    updateHash: false,
                    skipHistory: true,
                });
                appendBlock(unknownCommand(hash));
                scrollToBlock(outputEl.lastElementChild);
            }
        } else {
            execute("whoami", {
                echo: false,
                updateHash: false,
                skipHistory: true,
            });
        }
    }

    function bindEvents() {
        formEl.addEventListener("submit", function (event) {
            event.preventDefault();
            const raw = inputEl.value.trim();
            if (!raw) {
                inputEl.value = "";
                syncMirror();
                return;
            }

            inputEl.value = "";
            syncMirror();
            hintEl.textContent = "";
            tabState = null;
            historyIndex = cmdHistory.length;
            draft = "";
            execute(raw, { echo: true });
            focusInput();
        });

        inputEl.addEventListener("input", function () {
            historyIndex = cmdHistory.length;
            draft = inputEl.value;
            tabState = null;
            hintEl.textContent = "";
            syncMirror();
        });

        inputEl.addEventListener("keydown", function (event) {
            if (
                ["ArrowLeft", "ArrowRight", "Home", "End"].indexOf(
                    event.key
                ) !== -1
            ) {
                tabState = null;
            }
            if (event.ctrlKey && event.key.toLowerCase() === "l") {
                event.preventDefault();
                clear();
                return;
            }
            if (event.ctrlKey && event.key.toLowerCase() === "c") {
                event.preventDefault();
                inputEl.value = "";
                syncMirror();
                hintEl.textContent = "";
                appendBlock(PF.ui.line("^C", "term-muted"));
                scrollToBottom();
                return;
            }
            if (event.ctrlKey && event.key.toLowerCase() === "k") {
                event.preventDefault();
                if (paletteEl && !paletteEl.hidden) {
                    closePalette();
                } else {
                    openPalette();
                }
                return;
            }
            if (event.key === "Tab") {
                handleTab(event);
                return;
            }
            if (event.key === "ArrowUp") {
                event.preventDefault();
                navigateHistory(-1);
                return;
            }
            if (event.key === "ArrowDown") {
                event.preventDefault();
                navigateHistory(1);
                return;
            }
            if (event.key === "Escape") {
                if (paletteEl && !paletteEl.hidden) {
                    closePalette();
                    return;
                }
                inputEl.value = "";
                syncMirror();
                hintEl.textContent = "";
                tabState = null;
            }
        });

        inputEl.addEventListener("keyup", syncMirror);
        inputEl.addEventListener("click", function () {
            tabState = null;
            syncMirror();
        });
        inputEl.addEventListener("select", function () {
            tabState = null;
            syncMirror();
        });
        inputEl.addEventListener("focus", syncMirror);
        inputEl.addEventListener("blur", function () {
            tabState = null;
            syncMirror();
        });
        inputEl.addEventListener("scroll", function () {
            if (mirrorWrap) mirrorWrap.scrollLeft = inputEl.scrollLeft;
        });

        document.addEventListener("click", function (event) {
            const target = event.target;
            if (!(target instanceof Element)) return;

            if (target.closest("[data-palette-close]")) {
                event.preventDefault();
                closePalette();
                return;
            }

            const paletteItem = target.closest(".palette-item");
            if (paletteItem) return;

            const commandButton = target.closest("[data-command]");
            if (commandButton) {
                event.preventDefault();
                execute(commandButton.dataset.command, { echo: true });
                focusInput();
                return;
            }

            const copyButton = target.closest("[data-copy]");
            if (copyButton) {
                event.preventDefault();
                PF.ui.copyText(copyButton.dataset.copy).then(function (ok) {
                    PF.ui.toast(
                        ok
                            ? "Copiado: " + copyButton.dataset.copy
                            : "No se pudo copiar"
                    );
                });
                return;
            }

            const themeButton = target.closest("[data-theme-set]");
            if (themeButton) {
                event.preventDefault();
                const theme = themeButton.dataset.themeSet;
                PF.effects.setTheme(theme);
                PF.ui.toast("Tema: " + theme);
                return;
            }

            if (target.closest("[data-crt-toggle]")) {
                event.preventDefault();
                const enabled = PF.effects.toggleCrt();
                PF.ui.toast("CRT " + (enabled ? "on" : "off"));
                return;
            }

            if (
                target.closest("[data-palette]") ||
                target.closest("[data-palette-open]")
            ) {
                event.preventDefault();
                openPalette();
                return;
            }

            if (target.closest("[data-clear]")) {
                event.preventDefault();
                clear();
                return;
            }
        });

        promptRow.addEventListener("click", function (event) {
            if (event.target.closest("button, a, input")) return;
            focusInput();
        });

        window.addEventListener("hashchange", function () {
            const hash = getHash();
            if (hash === currentHash) return;

            if (!hash) {
                currentHash = "";
                execute("whoami", {
                    echo: false,
                    updateHash: false,
                    skipHistory: true,
                });
                return;
            }

            currentHash = hash;
            execute(hash, {
                echo: true,
                updateHash: false,
                skipHistory: true,
            });
        });
    }

    function init() {
        outputEl = document.getElementById("terminal-output");
        formEl = document.getElementById("terminal-form");
        inputEl = document.getElementById("terminal-input");
        mirrorContent = document.getElementById("mirror-content");
        mirrorWrap = document.getElementById("input-mirror");
        placeholderEl = document.getElementById("input-placeholder");
        promptRow = formEl;
        hintEl = document.getElementById("completion-hint");

        if (!outputEl || !formEl || !inputEl) {
            return;
        }

        loadHistory();
        initPalette();
        bindEvents();
        syncMirror();
        boot();
        routeInitial();

        window.setTimeout(function () {
            syncMirror();
            if (finePointer()) focusInput();
        }, 80);
    }

    PF.terminal = {
        init: init,
        execute: execute,
        clear: clear,
        getHistory: getHistory,
        clearHistory: clearHistory,
    };
})();
