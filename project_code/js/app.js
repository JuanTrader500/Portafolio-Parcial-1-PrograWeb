/* ==========================================================================
   app.js — bootstrap del portafolio
   ========================================================================== */

(function () {
    "use strict";

    const PF = (window.PF = window.PF || {});

    function init() {
        PF.effects.init();
        PF.terminal.init();

        const year = document.getElementById("year");
        if (year) year.textContent = String(new Date().getFullYear());
    }

    PF.app = {
        version: "1.0.0",
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
