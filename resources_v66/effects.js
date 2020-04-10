var FX = {
    boxEl: document.getElementById("stats-effects"),
    currentEl: document.getElementById("stats-current"),

    current: { },

    addEffect: function (name, cyclesRemaining) {
        if (cyclesRemaining === undefined) cyclesRemaining = -1;

        FX.removeEffect(name);
        FX.current[name] = {
            "cycles": cyclesRemaining
        };
    },
    removeEffect: function (name) {
        if (FX.current[name] !== undefined) delete FX.current[name];
    },

    showCurrentEffects: function () {
        if (Object.keys(FX.current).length !== 0) {
            FX.boxEl.style.display = "";

            let html = "";
            for (let i = 0; i < Object.keys(FX.current).length; i++) {
                let name = Object.keys(FX.current)[i],
                    job = FX.current[name],
                    cyclesRemaining = job.cycles;

                html += "\u2022 " + name + (cyclesRemaining === -1 ? "<br />" : ": " + cyclesRemaining + "<br />");
            }
            FX.currentEl.innerHTML = html;
        } else {
            FX.boxEl.style.display = "none";
        }
    }
};