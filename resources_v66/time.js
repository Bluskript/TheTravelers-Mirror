var TIME = {
    period: 10,
    hundms: 0,
    turn: 0,
    
    countdownEl: document.getElementById("time-countdown"),
    ofdayEl: document.getElementById("time-ofday"),
    countdown_interval: undefined,
    dc_timeout: "",

    countdown: function () {
        let setTimes = function (t) {
            TIME.countdownEl.innerHTML = t;
            POPUP.evCycleText.innerHTML = "cycle: " + t;
        };

        TIME.setDate();
        TIME.turn++;
        TIME.hundms = 0;

        clearInterval(TIME.countdown_interval);
        clearInterval(TIME.dc_timeout);
        setTimes("1.0");

        TIME.countdown_interval = setInterval(function () {
            TIME.hundms++;
            if (TIME.hundms === TIME.period) {
                setTimes("loading...");
                clearInterval(TIME.countdown_interval);
                TIME.dc_timeout = setTimeout(function () {
                    let switchbool = true;
                    TIME.countdown_interval = setInterval(function () {
                        if (switchbool) {
                            setTimes("you've disconnected.");
                        } else {
                            setTimes("refresh the page.");
                        }
                        switchbool = !switchbool;
                    }, 1750);

                    setTimeout(function () {
                        document.getElementById("event-cycle").style.display = "none";
                    }, GAMEPROPS.framerate);

                    SOCKET.close();
                    NOTIF.new("disconnected");
                    POPUP.new("you've disconnected from the game.", "please refresh the page to reconnect.", [
                        {
                            disp: "refresh",
                            func: function () {
                                window.location.reload(false);
                            },
                            disable: false
                        }
                    ]);
                }, 6000);
            } else {
                let c = TIME.period - TIME.hundms;
                c = c < 10 ? c = "0" + c.toString() : c.toString();

                setTimes(c[0] + "." + c[1]);
            }
        }, 100);
    },
    setDate: function () {
        let turn = TIME.turn,
            yearTurns = 86400,
            seasonTurns = 21600,
            dayTurns = 240,
            hourTurns = 10,
            sixMinuteTurns = 1,
            totalYears = 1,
            totalSeasons = 0,
            totalDays = 1,
            totalHours = 0,
            totalSixMinutes = 0,
            getSeason = function (t) {
                return t === 0 ? "winter" : t === 1 ? "spring" : t === 2 ? "summer" : "autumn";
            };

        while (turn > yearTurns) {
            turn -= yearTurns;
            totalYears++;
        }
        while (turn > seasonTurns) {
            turn -= seasonTurns;
            totalSeasons++;
        }
        while (turn > dayTurns) {
            turn -= dayTurns;
            totalDays++;
        }
        while (turn > hourTurns) {
            turn -= hourTurns;
            totalHours++;
        }
        while (turn > sixMinuteTurns) {
            turn -= sixMinuteTurns;
            totalSixMinutes++;
        }

        let minutes = "",
            years = "",
            totalSixStr = (totalSixMinutes * 6).toString();

        if (totalSixStr.length < 2) {
            if (totalSixStr.length === 0) {
                minutes = "00";
            } else {
                if (totalSixStr === "6") {
                    minutes = "06";
                } else {
                    minutes = totalSixStr + "0";
                }
            }
        } else {
            minutes = totalSixStr;
        }

        if (totalHours >= 12) {
            TIME.ampm = "p.m.";
        } else {
            TIME.ampm = "a.m.";
        }
        if (totalHours > 12) {
            totalHours -= 12;
        }
        if (totalHours === 0) {
            totalHours = 12;
        }

        if (totalYears < 10) {
            years = "00" + totalYears;
        }
        if (totalYears < 100 && totalYears >= 10) {
            years = "0" + totalYears;
        }

        TIME.year = totalYears;
        TIME.season = getSeason(totalSeasons);
        TIME.day = totalDays;
        TIME.hour = totalHours;
        TIME.minute = totalSixMinutes * 6;

        TIME.logSpecialTime();

        let f = totalHours + ":" + minutes + " " + TIME.ampm + ", " + TIME.season + " " + totalDays + ", " + years;
        TIME.ofdayEl.innerHTML = f;
        POPUP.evCycleTime.innerHTML = f;
    },

    year: 1,
    season: "winter",
    day: 1,
    hour: 12,
    ampm: "a.m.",
    minute: 0,

    airTemp: function () {
        if (TIME.season === "winter") {
            return "cool";
        } else if (TIME.season === "autumn" || TIME.season === "spring") {
            return "warm";
        } else if (TIME.season === "summer") {
            return "hot";
        }
    },

    logSpecialTime: function () {
        if (TIME.day === 1 && TIME.hour === 12 && TIME.ampm === "a.m." && TIME.minute === 0 && TIME.season === "winter") {
            ENGINE.log("another year has passed. the world decays further, the past descending deeper into time.");
        } else if (TIME.day === 2 && TIME.hour === 12 && TIME.ampm === "a.m." && TIME.minute === 0) {
            if (TIME.season === "winter") {
                ENGINE.log("the air grows cooler as autumn passes. the ash in the sky protects the earth from growing cold, like a blanket.");
            }
        } else if (TIME.day === 1 && TIME.hour === 12 && TIME.ampm === "a.m." && TIME.minute === 0) {
            if (TIME.season === "spring") {
                ENGINE.log("winter ends, and the world begins to warm.");
            } else if (TIME.season === "summer") {
                ENGINE.log("the air becomes almost unbearably hot, burning from the sun hidden behind the ashen sky.");
            } else if (TIME.season === "autumn") {
                ENGINE.log("finally summer ends, the scorching atmosphere relenting.");
            }
        }
    }
};