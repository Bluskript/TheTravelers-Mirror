var NOTIF = {
    game_title: "the travelers",
    interval: "",
    new: function (text, flashtime) {
        NOTIF.stop();
        if (SETTINGS.notifAny !== "true" || !document.hidden) {
            return;
        }

        if (SETTINGS.notifSound === "true") {
            new Audio('/sound/notif.mp3').play();
            // Credit to <tim.kahn> on freesound.org for creating this sound effect.
            // https://freesound.org/people/tim.kahn/sounds/91926/
        }

        if (SETTINGS.notifDesktop === "true") {
            let not = new Notification("", {
                icon: "",
                body: "new notification: " + text + "!"
            });
            not.onclick = function (r) {
                window.focus();
                this.cancel();
            };
        }

        if (flashtime === undefined) {
            flashtime = 1000;
        }

        let flash = false;
        NOTIF.interval = setInterval(function () {
            document.title = flash ? "!!! " + text + " !!!" : "!!!!! NEW !!!!! NEW !!!!! NEW !!!!!";
            flash = !flash;

            if (!document.hidden) {
                NOTIF.stop();
            }
        }, flashtime);
    },
    stop: function () {
        clearInterval(NOTIF.interval);
        document.title = NOTIF.game_title;
    }
};