/* ==========================================================================
   visuals.js — SVG decorativo, sparklines y ASCII
   No representa datos reales ni resultados de trading.
   ========================================================================== */

(function () {
    "use strict";

    const PF = (window.PF = window.PF || {});
    let gradientCounter = 0;

    function mulberry32(seed) {
        let a = seed >>> 0;
        return function () {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function makeSeries(count, seed, drift, volatility) {
        const random = mulberry32(seed);
        const values = [];
        let value = 100;

        for (let i = 0; i < count; i += 1) {
            const shock = (random() - 0.48) * volatility;
            const wave = Math.sin(i / 5.4) * volatility * 0.18;
            const correction =
                i > count * 0.58 && i < count * 0.68 ? -volatility * 0.75 : 0;
            value = Math.max(4, value * (1 + drift + shock + wave + correction));
            values.push(value);
        }

        return values;
    }

    function normalize(values) {
        const min = Math.min.apply(null, values);
        const max = Math.max.apply(null, values);
        const range = max - min || 1;
        return values.map(function (value) {
            return (value - min) / range;
        });
    }

    function toPoints(values, width, height, padding) {
        const normalized = normalize(values);
        const innerWidth = width - padding * 2;
        const innerHeight = height - padding * 2;
        return normalized.map(function (value, index) {
            return {
                x: padding + (index / (normalized.length - 1)) * innerWidth,
                y: padding + (1 - value) * innerHeight,
            };
        });
    }

    function smoothPath(points, tension) {
        if (!points.length) return "";
        const t = tension === undefined ? 0.18 : tension;
        let path = "M " + points[0].x.toFixed(2) + " " + points[0].y.toFixed(2);

        for (let i = 0; i < points.length - 1; i += 1) {
            const p0 = points[i - 1] || points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;

            const cp1x = p1.x + (p2.x - p0.x) * t;
            const cp1y = p1.y + (p2.y - p0.y) * t;
            const cp2x = p2.x - (p3.x - p1.x) * t;
            const cp2y = p2.y - (p3.y - p1.y) * t;

            path +=
                " C " +
                cp1x.toFixed(2) +
                " " +
                cp1y.toFixed(2) +
                ", " +
                cp2x.toFixed(2) +
                " " +
                cp2y.toFixed(2) +
                ", " +
                p2.x.toFixed(2) +
                " " +
                p2.y.toFixed(2);
        }

        return path;
    }

    function areaPath(points, path, height, padding) {
        if (!points.length) return "";
        const first = points[0];
        const last = points[points.length - 1];
        return (
            path +
            " L " +
            last.x.toFixed(2) +
            " " +
            (height - padding).toFixed(2) +
            " L " +
            first.x.toFixed(2) +
            " " +
            (height - padding).toFixed(2) +
            " Z"
        );
    }

    function gradientId(seed) {
        gradientCounter += 1;
        return "pf-grad-" + seed + "-" + gradientCounter;
    }

    function sparklineSVG(options) {
        const opts = options || {};
        const width = opts.width || 280;
        const height = opts.height || 64;
        const padding = 3;
        const count = opts.points || 46;
        const seed = opts.seed || 17;
        const values = makeSeries(
            count,
            seed,
            opts.drift === undefined ? 0.006 : opts.drift,
            opts.volatility === undefined ? 0.024 : opts.volatility
        );
        const points = toPoints(values, width, height, padding);
        const path = smoothPath(points, 0.18);
        const area = areaPath(points, path, height, padding);
        const id = gradientId(seed);
        const last = points[points.length - 1];
        const label =
            opts.label || "Curva decorativa de rendimiento, sin datos reales";

        return (
            '<svg viewBox="0 0 ' +
            width +
            " " +
            height +
            '" role="img" aria-label="' +
            label +
            '" preserveAspectRatio="none">' +
            "<defs>" +
            '<linearGradient id="' +
            id +
            '" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" style="stop-color:var(--accent);stop-opacity:.34"></stop>' +
            '<stop offset="1" style="stop-color:var(--accent);stop-opacity:0"></stop>' +
            "</linearGradient>" +
            "</defs>" +
            '<path d="' +
            area +
            '" fill="url(#' +
            id +
            ')"></path>' +
            '<path class="chart-line" pathLength="1" d="' +
            path +
            '"></path>' +
            '<circle class="chart-dot" cx="' +
            last.x.toFixed(2) +
            '" cy="' +
            last.y.toFixed(2) +
            '" r="2.4"></circle>' +
            "</svg>"
        );
    }

    function equityCurveSVG(options) {
        const opts = options || {};
        const width = opts.width || 760;
        const height = opts.height || 210;
        const padding = 18;
        const count = opts.points || 84;
        const seed = opts.seed || 23;
        const values = makeSeries(
            count,
            seed,
            opts.drift === undefined ? 0.0052 : opts.drift,
            opts.volatility === undefined ? 0.022 : opts.volatility
        );
        const points = toPoints(values, width, height, padding);
        const path = smoothPath(points, 0.16);
        const area = areaPath(points, path, height, padding);
        const id = gradientId(seed);
        const last = points[points.length - 1];
        const label =
            opts.label ||
            "Curva de equity ilustrativa. No representa resultados reales de trading.";

        let grid = "";
        for (let i = 0; i <= 4; i += 1) {
            const y = padding + ((height - padding * 2) / 4) * i;
            grid +=
                '<line class="chart-grid-line" x1="' +
                padding +
                '" y1="' +
                y.toFixed(1) +
                '" x2="' +
                (width - padding) +
                '" y2="' +
                y.toFixed(1) +
                '"></line>';
        }
        for (let i = 0; i <= 6; i += 1) {
            const x = padding + ((width - padding * 2) / 6) * i;
            grid +=
                '<line class="chart-grid-line" x1="' +
                x.toFixed(1) +
                '" y1="' +
                padding +
                '" x2="' +
                x.toFixed(1) +
                '" y2="' +
                (height - padding) +
                '"></line>';
        }

        return (
            '<svg viewBox="0 0 ' +
            width +
            " " +
            height +
            '" role="img" aria-label="' +
            label +
            '">' +
            "<defs>" +
            '<linearGradient id="' +
            id +
            '" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" style="stop-color:var(--accent);stop-opacity:.3"></stop>' +
            '<stop offset="1" style="stop-color:var(--accent);stop-opacity:0"></stop>' +
            "</linearGradient>" +
            "</defs>" +
            grid +
            '<line class="chart-baseline" x1="' +
            padding +
            '" y1="' +
            (height - padding) +
            '" x2="' +
            (width - padding) +
            '" y2="' +
            (height - padding) +
            '"></line>' +
            '<path d="' +
            area +
            '" fill="url(#' +
            id +
            ')"></path>' +
            '<path class="chart-line" pathLength="1" d="' +
            path +
            '"></path>' +
            '<circle class="chart-dot" cx="' +
            last.x.toFixed(2) +
            '" cy="' +
            last.y.toFixed(2) +
            '" r="3"></circle>' +
            '<text class="chart-label" x="' +
            padding +
            '" y="' +
            (height - 4) +
            '">T-0</text>' +
            '<text class="chart-label" x="' +
            (width - padding) +
            '" y="' +
            (height - 4) +
            '" text-anchor="end">VISUAL</text>' +
            "</svg>"
        );
    }

    function asciiSpark(values) {
        const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
        const normalized = normalize(values);
        return normalized
            .map(function (value) {
                return blocks[Math.min(blocks.length - 1, Math.floor(value * blocks.length))];
            })
            .join("");
    }

    function asciiSparkline(seed, count) {
        return asciiSpark(makeSeries(count || 32, seed || 17, 0.008, 0.026));
    }

    function pipelineASCII(steps) {
        const labels = steps || [];
        const widths = labels.map(function (label) {
            return label.length + 2;
        });
        const top = "┌" + widths.map(function (w) {
            return "─".repeat(w);
        }).join("┬") + "┐";
        const middle =
            "│" +
            labels
                .map(function (label, index) {
                    return " " + label.padEnd(widths[index] - 1);
                })
                .join("│") +
            "│";
        const bottom = "└" + widths.map(function (w) {
            return "─".repeat(w);
        }).join("┴") + "┘";
        const arrows =
            " " +
            widths
                .map(function (w, index) {
                    return index < widths.length - 1
                        ? "─".repeat(w) + "▶"
                        : "─".repeat(w) + "▶";
                })
                .join("");
        return top + "\n" + middle + "\n" + bottom + "\n" + arrows;
    }

    const banner = [
        "     ██╗██╗   ██╗ █████╗ ███╗   ██╗",
        "     ██║██║   ██║██╔══██╗████╗  ██║",
        "     ██║██║   ██║███████║██╔██╗ ██║",
        "██   ██║██║   ██║██╔══██║██║╚██╗██║",
        "╚█████╔╝╚██████╔╝██║  ██║██║ ╚████║",
        " ╚════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝",
        "        M U Ñ O Z   Z A P A T A",
    ].join("\n");

    function initSparklines() {
        const nodes = document.querySelectorAll("[data-sparkline]");
        nodes.forEach(function (node) {
            const seed = Number(node.dataset.seed || 17);
            const points = Number(node.dataset.points || 46);
            node.innerHTML = sparklineSVG({
                seed: seed,
                points: points,
                width: 280,
                height: 64,
                label: "Sparkline decorativa, sin datos reales",
            });
        });
    }

    PF.visuals = {
        makeSeries: makeSeries,
        sparklineSVG: sparklineSVG,
        equityCurveSVG: equityCurveSVG,
        asciiSpark: asciiSpark,
        asciiSparkline: asciiSparkline,
        pipelineASCII: pipelineASCII,
        banner: banner,
        initSparklines: initSparklines,
    };
})();
