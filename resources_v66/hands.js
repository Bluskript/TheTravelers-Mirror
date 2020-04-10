var HANDS = { // weird name right?
    drop: function (el) {
        ENGINE.addCycleTrigger(function () {
            el.className = el.className.split("active").join("");
            ENGINE.clearDirs(true);
        });

        el.className = el.className + " active";

        SOCKET.send({
            "action": "hands",
            "option": "drop"
        });
    }
};