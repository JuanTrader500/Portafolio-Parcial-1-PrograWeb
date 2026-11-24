/* ==========================================================================
   effects.js — temas, CRT, reloj, uptime y sparklines
   ========================================================================== */

(function () {
    "use strict";

    const PF = (window.PF = window.PF || {});
    const THEMES = ["matrix", "amber", "dracula"];
    const THEME_COLORS = {
        matrix: "#030705",
        amber: "#0a0702",
        dracula: "#16171f",
    };
    const START_TIME = Date.now();
    const clockFormatter = new Intl.DateTimeFormat("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    let clockTimer = null;
    let uptimeTimer = null;

    function storageGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            /* almacenamiento bloqueado */
        }
    }

    function listThemes() {
        return THEMES.slice();
    }

    function getTheme() {
        const current = document.documentElement.dataset.theme;
        return THEMES.indexOf(current) !== -1 ? current : "matrix";
    }

    function updateThemeButtons() {
        const current = getTheme();
        document.querySelectorAll("[data-theme-set]").forEach(function (button) {
            button.setAttribute(
                "aria-pressed",
                button.dataset.themeSet === current ? "true" : "false"
            );
        });
    }

    function setTheme(name, persist) {
        if (THEMES.indexOf(name) === -1) return getTheme();
        document.documentElement.dataset.theme = name;
        if (persist !== false) storageSet("pf.theme", name);

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", THEME_COLORS[name]);

        updateThemeButtons();
        return name;
    }

    function cycleTheme() {
        const current = getTheme();
        const index = THEMES.indexOf(current);
        const next = THEMES[(index + 1) % THEMES.length];
        setTheme(next);
        return next;
    }

    function getCrt() {
        return document.documentElement.dataset.crt === "on";
    }

    function updateCrtButtons() {
        const enabled = getCrt();
        document.querySelectorAll("[data-crt-toggle]").forEach(function (button) {
            button.setAttribute("aria-pressed", enabled ? "true" : "false");
            button.title = enabled
                ? "Desactivar efecto CRT"
                : "Activar efecto CRT";
        });
    }

    function setCrt(enabled, persist) {
        document.documentElement.dataset.crt = enabled ? "on" : "off";
        if (persist !== false) {
            storageSet("pf.crt", enabled ? "on" : "off");
        }
        updateCrtButtons();
        return enabled;
    }

    function toggleCrt() {
        return setCrt(!getCrt());
    }

    function formatDuration(totalSeconds) {
        const seconds = Math.max(0, Math.floor(totalSeconds));
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const rest = seconds % 60;
        return [hours, minutes, rest]
            .map(function (part) {
                return String(part).padStart(2, "0");
            })
            .join(":");
    }

    function getUptime() {
        return formatDuration((Date.now() - START_TIME) / 1000);
    }

    function updateClock() {
        const clock = document.getElementById("stat-clock");
        if (clock) clock.textContent = clockFormatter.format(new Date());

        const uptime = document.getElementById("stat-uptime");
        if (uptime) uptime.textContent = getUptime();
    }

    function startTimers() {
        updateClock();
        if (clockTimer) window.clearInterval(clockTimer);
        if (uptimeTimer) window.clearInterval(uptimeTimer);
        clockTimer = window.setInterval(updateClock, 1000);
        uptimeTimer = window.setInterval(function () {
            const uptime = document.getElementById("stat-uptime");
            if (uptime) uptime.textContent = getUptime();
        }, 1000);
    }

    function init() {
        const savedTheme = storageGet("pf.theme");
        setTheme(
            THEMES.indexOf(savedTheme) !== -1 ? savedTheme : "matrix",
            false
        );

        const savedCrt = storageGet("pf.crt");
        setCrt(savedCrt === "on", false);

        updateThemeButtons();
        updateCrtButtons();
        PF.visuals.initSparklines();
        startTimers();
    }

    PF.effects = {
        init: init,
        listThemes: listThemes,
        getTheme: getTheme,
        setTheme: setTheme,
        cycleTheme: cycleTheme,
        getCrt: getCrt,
        setCrt: setCrt,
        toggleCrt: toggleCrt,
        getUptime: getUptime,
    };
})();
