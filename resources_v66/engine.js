var ENGINE = {
    version: "the travelers \u2022 alpha v0.9.9",
    discord_link: "https://discord.gg/2U7raTc",
    reddit_link: "https://reddit.com/r/thetravelersmmo",
    youtube_link: "https://youtube.com/torogadev",
    start: function (json, auto = false, showGameContent = true) {
        ENGINE.isFirstConnect = true;

        noise.seed(WORLD.seed);
        WORLD.setInvalids();
        WORLD.initialize();
        YOU.initialize();
        
        if (!auto) {
            SETTINGS.createCookie();
            SOCKET.open();
        } else {
            ENGINE.wasAutoConnect = true;
        }

        ENGINE.applyData(json);

        SOCKET.fadestartup(showGameContent);
    },
    playersOnline: 0,
    setOnline: function () {
        return "<span style='font-size:20px'>" + ENGINE.playersOnline + " traveler" + (ENGINE.playersOnline === 1 ? "" : "s") + " online</span><br /><span style='font-size:16px'>" + ENGINE.version + "</span><br /><br />" +
            "join the traveling community:<br />" +
            "<a class='homepage-imglink' target='_blank' href='" + ENGINE.discord_link + "'><img class='homepage-icon' src='./imgs/discord.png' /></a>" +
            "<a class='homepage-imglink' target='_blank' href='" + ENGINE.reddit_link + "'><img class='homepage-icon' src='./imgs/reddit.png' /></a>" +
            "<a class='homepage-imglink' target='_blank' href='" + ENGINE.youtube_link + "'><img class='homepage-icon' src='./imgs/youtube.png' /></a>";
    },
    wasAutoConnect: false,
    isFirstConnect: false,
    applyData: function (json, midCycleDataCall) {
        ENGINE.callCycleTriggers();
        //ENGINE.console_log(json);

        if (json.exe_js !== undefined) eval(json.exe_js);
        if (json.state !== undefined) YOU.state = json.state;
        if (YOU.state === "death") {
            if (!YOU.isDead) {
                YOU.kill();
            }
            return;
        } else {
            YOU.deathScreenEl.style.display = "none";
        }
        if (json.server_stop !== undefined) ENGINE.clearDirs(true);

        let movechanged = false;
        if ((json.x !== undefined && YOU.x !== json.x) || (json.y !== undefined && YOU.y !== json.y)) {
            YOU.setPrevs();
            movechanged = true;
            XP.addXP(1);
        }

        if (json.state !== undefined) YOU.state = json.state;
        if (json.username !== undefined) { YOU.username = json.username; XP.usernameEl.innerHTML = YOU.username; }
        if (json.level !== undefined) YOU.level = json.level;
        if (json.x !== undefined) YOU.x = json.x;
        if (json.y !== undefined) YOU.y = json.y;

        if (!YOU.autowalk) {
            YOU.dir = "";
            for (let i = 0; i < 9; i++) {
                let d = document.getElementById("arrow-box").children[i];
                d.className = d.className.split("active").join("").trim();
            }
        }

        if (YOU.state === "int") {
            if (YOU.prevState !== "int") {
                INT.openInit();
            }
            if (json.int_here !== undefined) {
                INT.genBoxInfo(json.int_here);
            }
            if (json.int_messages !== undefined) {
                INT.addNewMsgs(json.int_messages);
            }
            if (json.int_gotmsg !== undefined) {
                INT.leaveTextboxEl.value = json.int_gotmsg;
                INT.leaveRemoveBtnEl.style.display = "";
            }
            if (json.offline_msgs !== undefined) {
                INT.showOfflineMsgs(json.offline_msgs);
            }
        }

        if (json.craft_items !== undefined) {
            CRAFTING.setHtml(json.craft_items);
        }
        if (json.craft_queue !== undefined) {
            CRAFTING.setQueue(json.craft_queue);
        }

        if (json.supplies !== undefined) {
            if (json.new_items !== undefined) {
                CRAFTING.logNew(json.supplies, SUPPLIES.current);
                MOBILE.notif("supp");
            }

            SUPPLIES.set(json.supplies);

            if (TUT.state === 1) {
                TUT.update();
            }
        }
        if (json.equipped !== undefined) {
            if (ENGINE.isFirstConnect) {
                SUPPLIES.current_item = json.equipped;
                EQUIP.current_id = json.equipped;

                SOCKET.hub.start().done(function () {
                    EQUIP.open(true);
                    SUPPLIES.current_item = "";
                });
            }
        }
        if (json.equip_data !== undefined) {
            EQUIP.setStatus(EQUIP.current_id, json.equip_data);
        }

        if (json.skills !== undefined) {
            XP.apply(json.skills);
        }
        if (json.gained_xp !== undefined) {
            ENGINE.log("you earned <b>" + json.gained_xp + "xp</b> from this event.");
        }

        let proxchanged = false;
        if (midCycleDataCall === undefined || !midCycleDataCall) {
            proxchanged = ENGINE.setProx(json.proximity);
        }

        if (YOU.state === "looting" && json.loot !== undefined) {
            if (YOU.prevState === "travel") {
                ENGINE.clearDirs(true);

                if (WALKUNTIL.active) {
                    setTimeout(function () {
                        WALKUNTIL.stop();
                        WALKUNTIL.eventStop = true;
                    }, GAMEPROPS.framerate * 2); // absolutely the worst code i've ever written
                }

                EVENTS.beginLeaveCountdown();
            }

            POPUP.hide();
            LOOT.startLoot(json.loot, json.item_limit);
        }
        if (YOU.state === "event") {
            if (YOU.prevState === "travel") {
                ENGINE.clearDirs(true);
                EVENTS.beginLeaveCountdown();
            }

            if (json.event_data !== undefined) {
                EVENTS.applyServerEvent(json.event_data);

                if (TUT.state === 0) {
                    TUT.update();
                }
            }
        }
        if (YOU.state === "travel") {
            if (YOU.prevState !== "travel") {
                POPUP.hide();
            }

            if (YOU.prevState === "event") {
                ENGINE.log("outside again. the " + TIME.airTemp() + " air welcomes you back.");
                CRAFTING.refresh();
            }
            if (YOU.prevState === "looting") {
                LOOT.hide();
                CRAFTING.refresh();
            }
            if (YOU.prevState === "death") {
                YOU.deathBtn.value = "reincarnate";
                ENGINE.console.innerHTML = "";
                ENGINE.logMsgs = [];
                ENGINE.log("alive again, but somewhere new.");
            }
        }
        YOU.prevState = YOU.state;

        if (proxchanged || movechanged) {
            WORLD.build();
            WORLD.checkWorldNotifsAndLogs();
        }
        WORLD.checkPlayersAndObjs();

        // keep the below last, in this order
        if (XP.checkOverencumbered()) {
            FX.addEffect("overencumbered");
        } else {
            FX.removeEffect("overencumbered");
        }

        FX.showCurrentEffects();

        if (json.tut !== undefined) { //when the server updates our tutorial state, and after the world updates, run the tutorial
            TUT.go(json.tut);
        }
        if (json.cutscene !== undefined) {
            YOU.cutscene = json.cutscene;
        }

        if (midCycleDataCall === undefined || !midCycleDataCall) {
            TIME.countdown();
        }

        if (ENGINE.atop_another) {
            ENGINE.blink();
        } else {
            clearInterval(ENGINE.blink_inner);
            clearInterval(ENGINE.blink_int);
        }

        ENGINE.isFirstConnect = false;
    },
    atop_another: false,
    blink_int: 0,
    blink_inner: 0,
    blink: function () {
        let blink_speed = 120,
            center_el = document.getElementById(YOU.x + "|" + YOU.y),
            original_value = center_el.innerHTML;

        clearInterval(ENGINE.blink_inner);
        clearInterval(ENGINE.blink_int);
        ENGINE.blink_int = setInterval(function () {
            let sw = false,
                count = 0,
                breaktime = 4; // must be even
            ENGINE.blink_inner = setInterval(function () {
                if (sw) {
                    center_el.innerHTML = original_value;
                } else {
                    center_el.innerHTML = "<b>" + YOU.char + "</b>";
                }
                sw = !sw;
                count++;
                if (count === breaktime) {
                    clearInterval(ENGINE.blink_inner);
                }
            }, blink_speed);
        }, 2300);
    },
    dir: function (dir, elem) {
        clearTimeout(EVENTS.leaveEventCountdown);

        if (dir === "a") {
            YOU.autowalk = !YOU.autowalk;
            elem.className = YOU.autowalk ? elem.className + " active" : elem.className.split("active").join("").trim();
        } else {
            YOU.dir = YOU.dir === dir ? "" : dir;

            let setCol = false;
            if (elem.className.indexOf("active") === -1) {
                setCol = true;
            }
            ENGINE.clearDirs();
            if (setCol) {
                elem.className = elem.className + " active";
            } else {
                elem.className = elem.className.split("active").join("").trim();
            }


            // for the tutorial, if you start walking toward the bag of starter loot, delete the popup
            if (TUT.state === 1) {
                TUT.close();
            }
        }
        SOCKET.send({
            "action": "setDir",
            "dir": YOU.dir,
            "autowalk": YOU.autowalk
        });
        YOU.prevDir = YOU.dir;
        YOU.prevAuto = YOU.autowalk;
    },
    clearDirs: function (resetAll = false) {
        for (let i = 0; i < 9; i++) {
            let dirEl = document.getElementById("arrow-box").children[i];
            if (dirEl.id !== "arrow-auto" || resetAll) {
                dirEl.className = dirEl.className.split("active").join("").trim();
            }
        }
        if (resetAll) {
            YOU.dir = "";
            YOU.autowalk = false;
        }
    },
    doublestep: function (btnEl) {
        if (XP.carry > XP.max_carry) {
            ENGINE.log("cannot double-step when overencumbered.");
            return;
        }

        if (WORLD.hardStand.indexOf(YOU.currentTile) !== -1) {
            ENGINE.log("cannot double-step in this location.");
            return;
        }

        if (btnEl.className.indexOf("active") !== -1) {
            btnEl.className = "movement-btns unselectable";
            SOCKET.send({
                "action": "doublestep",
                "option": "remove"
            });
        } else {
            btnEl.className = "movement-btns unselectable active";

            if (XP.sp > 10) {
                SOCKET.send({
                    "action": "doublestep",
                    "option": "add"
                });
                WALKUNTIL.int--;
            }

            ENGINE.addCycleTrigger(function () {
                btnEl.className = "movement-btns";
            });
        }
    },
    setProx: function (prox) {
        if (prox === undefined) {
            let c = WORLD.otherObjs.length !== 0 || WORLD.otherPlayers.length !== 0;
            WORLD.otherPlayers = [];
            WORLD.otherObjs = [];
            return c;
        }

        // checking if we need to change anything
        let objs = prox.objs === undefined ? 0 : prox.objs.length,
            plrs = prox.players === undefined ? 0 : prox.players.length;

        if (objs === WORLD.otherObjs.length && plrs === WORLD.otherPlayers.length) {
            if (objs === 0 && plrs === 0) {
                return false;
            } else {
                let changed = false;

                for (let i = 0; i < plrs; i++) {
                    if (prox.players[i].x !== WORLD.otherPlayers[i].x || prox.players[i].y !== WORLD.otherPlayers[i].y) {
                        changed = true;
                        break;
                    }
                }
                if (!changed) {
                    for (let i = 0; i < objs; i++) {
                        if (prox.objs[i].x !== WORLD.otherObjs[i].x || prox.objs[i].y !== WORLD.otherObjs[i].y) {
                            changed = true;
                            break;
                        }
                    }
                }

                if (!changed) {
                    return false;
                }
            }
        }
        // end change checking

        WORLD.otherPlayers = [];
        WORLD.otherObjs = [];

        if (plrs > 0) {
            for (let i = 0; i < plrs; i++) {
                WORLD.otherPlayers.push({
                    x: prox.players[i].x,
                    y: prox.players[i].y
                });
            }
        }
        if (objs > 0) {
            for (let i = 0; i < objs; i++) {
                WORLD.otherObjs.push({
                    x: prox.objs[i].x,
                    y: prox.objs[i].y,
                    char: prox.objs[i].char
                });
            }
        }

        return true;
    },
    cycleTriggers: [],
    addCycleTrigger: function (t) {
        ENGINE.cycleTriggers.push(t);
        return ENGINE.cycleTriggers.length - 1;
    },
    callCycleTriggers: function () {
        for (let i = 0; i < ENGINE.cycleTriggers.length; i++) {
            if (typeof ENGINE.cycleTriggers[i] === "string") {
                eval(ENGINE.cycleTriggers[i]);
            } else if (typeof ENGINE.cycleTriggers[i] === "function") {
                ENGINE.cycleTriggers[i]();
            }
        }
        ENGINE.cycleTriggers = [];
    },
    logMsgs: [],
    logFadeinTimeout: setTimeout(function () { }, 0),
    log: function (text, replaceOldSame) {
        if (text === "") {
            return;
        }

        let bottomWasReplaced = false;
        if (replaceOldSame === undefined || replaceOldSame) {
            for (let i = 0; i < ENGINE.logMsgs.length; i++) {
                if (ENGINE.logMsgs[i] === text) {
                    if (i === ENGINE.logMsgs.length - 1) {
                        bottomWasReplaced = true;
                    }
                    ENGINE.logMsgs.splice(i, 1);
                }
            }
        }

        ENGINE.logMsgs.push(text);

        let logLen = 15;
        if (ENGINE.logMsgs.length > logLen) {
            ENGINE.logMsgs.shift();
        }

        let newLogHtml = "";
        for (let i = 1; i < ENGINE.logMsgs.length; i++) {
            let j = ENGINE.logMsgs.length - i - 1,
                o = 1;

            if (i > 5) {
                o -= (i - 5) / 10;
            }

            newLogHtml = "<p class='log' style='opacity:" + o + "'>" + ENGINE.logMsgs[j] + "</p>" + newLogHtml;
        }

        if (!bottomWasReplaced) {
            newLogHtml += "<p id='enginelog-latestmessage' class='log' style='opacity:0;transition: opacity 1500ms'>" + ENGINE.logMsgs[ENGINE.logMsgs.length - 1] + "</p>";
        } else {
            newLogHtml += "<p id='enginelog-latestmessage' class='log' style='opacity:1'>" + ENGINE.logMsgs[ENGINE.logMsgs.length - 1] + "</p>";
        }

        clearTimeout(ENGINE.logFadeinTimeout);
        ENGINE.logFadeinTimeout = setTimeout(function () {
            if (document.getElementById("enginelog-latestmessage") !== null) {
                document.getElementById('enginelog-latestmessage').style.opacity = "1";
            }
        }, GAMEPROPS.framerate);

        ENGINE.console.innerHTML = newLogHtml;
        ENGINE.console.scrollTop = ENGINE.console.scrollHeight;

        MOBILE.notif("event");
    },
    console: document.getElementById("console-scroll"),
    droppingMenu: false,
    menuBack: document.getElementById("ddMenu-backblock"),
    toggleMenu: function () {
        if (this.droppingMenu) {
            return;
        }
        this.droppingMenu = true;

        SLIDE.toggle("#dropdown-menu", 150);
        if (this.menuBack.style.display === "none") {
            this.menuBack.style.display = "";
            ENGINE.ajaxCall(
                "/default.aspx/GetPlayersOnline",
                {},
                function (r) {
                    if (r === "spam") {
                        return;
                    } else {
                        ENGINE.playersOnline = parseInt(r);
                        document.getElementById("ddMenu-backInfo").innerHTML = ENGINE.setOnline();
                    }
                }
            );
        } else {
            this.menuBack.style.display = "none";
        }

        document.body.style.overflow = document.body.style.overflow === "hidden" ? "" : "hidden";
        document.documentElement.scrollTop = 0;

        setTimeout(function () {
            ENGINE.droppingMenu = false;
        }, 150);
    },
    ajaxCall: function (url, args, success, error) {
        if (success === undefined) {
            success = function (r) { };
        }
        if (error === undefined) {
            error = function (e) { console.log(e); };
        }

        let request = new XMLHttpRequest;
        request.open("POST", url, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.statusText === "OK") {
                success(JSON.parse(request.responseText).d);
            } else if (request.readyState === 4 && request.status === 200) {
                success(JSON.parse(request.responseText).d);
            } else if (request.readyState === 4) {
                error(JSON.parse(request.responseText));
            }
        };

        request.send(JSON.stringify(args));
    },
    console_log: function (t) {
        if (window.location.host === "localhost") {
            console.log(t);
        }
    },
    genRandString: function (len) {
        let t = "";
        for (let i = 0; i < len; i++) {
            t += ENGINE.alphabet[Math.floor(Math.random() * 26)];
        }
        return t;
    },
    alphabet: "abcdefghijklmnopqrstuvwxyz"
},
GAMEPROPS = {
    framerate: 16
},
WALKUNTIL = {
    btnEl: document.getElementById("movement-walkuntil"),
    numEl: document.getElementById("movement-walkuntilNum"),

    active: false,
    int: 0,
    eventStop: false,
    cycleIndex: -1,
    until: function () {
        if (WALKUNTIL.btnEl.className.indexOf("active") !== -1) {
            WALKUNTIL.stop();
        } else {
            if (!WALKUNTIL.active) {
                WALKUNTIL.loop();
            }
        }
    },
    loop: function () {
        let num = parseInt(WALKUNTIL.numEl.value);
        if (!isNaN(num) && num > 0) {
            WALKUNTIL.btnEl.className = "movement-btns unselectable active";
            WALKUNTIL.int = num;
            WALKUNTIL.active = true;

            if (WALKUNTIL.cycleIndex !== -1) {
                ENGINE.cycleTriggers.splice(WALKUNTIL.cycleIndex, 1);
            }

            WALKUNTIL.cycleIndex = ENGINE.addCycleTrigger(function () {
                if (WALKUNTIL.active) {
                    WALKUNTIL.int--;
                    WALKUNTIL.numEl.value = WALKUNTIL.int <= 0 ? 0 : WALKUNTIL.int;

                    if (WALKUNTIL.int <= 0) {
                        WALKUNTIL.int = 0;
                        WALKUNTIL.stop();
                        ENGINE.clearDirs(true);
                        SOCKET.send({
                            "action": "setDir",
                            "dir": "",
                            "autowalk": false
                        });
                    } else {
                        setTimeout(function () {
                            WALKUNTIL.loop();
                        }, GAMEPROPS.framerate);
                    }
                }
                WALKUNTIL.cycleIndex = -1;
            });
        } else {
            WALKUNTIL.stop();
        }
    },
    stop: function () {
        WALKUNTIL.btnEl.className = "movement-btns unselectable";
        WALKUNTIL.active = false;
    }
},
KEYBOOL = {
    l: false,
    u: false,
    r: false,
    d: false,

    tl: false,
    tr: false,
    bl: false,
    br: false,
    m: false,

    shift: false
};

document.onkeydown = function (e) {
    let key = e.which || e.keyCode;
    //e.preventDefault();

    if (key === 16) KEYBOOL.shift = true;

    if (SOCKET.isOpen) {
        if (key === 37) {
            if (KEYBOOL.l) {
                return;
            }
            ENGINE.dir("w", document.getElementById("arrow-w"));

            KEYBOOL.l = true;
        }
        if (key === 38) {
            if (KEYBOOL.u) {
                return;
            }
            ENGINE.dir("n", document.getElementById("arrow-n"));

            KEYBOOL.u = true;
        }
        if (key === 39) {
            if (KEYBOOL.r) {
                return;
            }
            ENGINE.dir("e", document.getElementById("arrow-e"));

            KEYBOOL.r = true;
        }
        if (key === 40) {
            if (KEYBOOL.d) {
                return;
            }
            ENGINE.dir("s", document.getElementById("arrow-s"));

            KEYBOOL.d = true;
        }

        if (key === 36) {
            if (KEYBOOL.tl) {
                return;
            }
            ENGINE.dir("nw", document.getElementById("arrow-nw"));

            KEYBOOL.tl = true;
        }
        if (key === 33) {
            if (KEYBOOL.tr) {
                return;
            }
            ENGINE.dir("ne", document.getElementById("arrow-ne"));

            KEYBOOL.tr = true;
        }
        if (key === 35) {
            if (KEYBOOL.bl) {
                return;
            }
            ENGINE.dir("sw", document.getElementById("arrow-sw"));

            KEYBOOL.bl = true;
        }
        if (key === 34) {
            if (KEYBOOL.br) {
                return;
            }
            ENGINE.dir("se", document.getElementById("arrow-se"));

            KEYBOOL.br = true;
        }
        if (key === 12) {
            if (KEYBOOL.m) {
                return;
            }
            ENGINE.dir("a", document.getElementById("arrow-auto"));

            KEYBOOL.m = true;
        }
    } else {
        if (key === 13) {
            e.preventDefault();
            SOCKET.checkEnter();
        }
    }

    if (YOU.state === "event" && key >= 49 && key <= 57) {
        //document.getElementById("event-btnBox").children[0].click()
        
        if (document.getElementById("event-btnBox").children[key - 49] !== undefined) {
            document.getElementById("event-btnBox").children[key - 49].click();
        }
    }
};

document.onkeyup = function (e) {
    let key = e.which || e.keyCode;
    //e.preventDefault();

    if (key === 37) KEYBOOL.l = false;
    if (key === 38) KEYBOOL.u = false;
    if (key === 39) KEYBOOL.r = false;
    if (key === 40) KEYBOOL.d = false;

    if (key === 36) { KEYBOOL.tl = false; e.preventDefault(); }
    if (key === 33) { KEYBOOL.tr = false; e.preventDefault(); }
    if (key === 35) { KEYBOOL.bl = false; e.preventDefault(); }
    if (key === 34) { KEYBOOL.br = false; e.preventDefault(); }
    if (key === 12) { KEYBOOL.m = false; e.preventDefault(); }

    if (key === 16) { KEYBOOL.shift = false; }

    if (key === 13 && !KEYBOOL.shift) {
        e.preventDefault();

        if (YOU.state === "int" && INT.messagesEl.style.display === "") {
            INT.sendMessage(INT.btnSendEl);
        }
    }
};

document.onmousemove = function (e) {
    HOVER.del();
    MOUSE.x = e.clientX;
    MOUSE.y = e.clientY;

    let d = document.elementFromPoint(MOUSE.x, MOUSE.y);
    if (d !== null && d.className !== null && d.className.indexOf("no-hover") === -1) {
        if (d.className.indexOf("supplies-box-item") !== -1 || d.className.indexOf("supplies-icon-hover") !== -1 || d.className.indexOf("loot-item-left") !== -1) {
            HOVER.supplyOn(d);
        } else if (d.className.indexOf("worldtile") !== -1) {
            HOVER.on(d);
        } else if (d.dataset.hover !== undefined) {
            HOVER.eventOn(d);
        }
    }
};

var MOUSE = {
    x: 0,
    y: 0
},
HOVER = {
    to: "",
    on: function (el) {
        if (SETTINGS.hover === "false") {
            return;
        }

        clearTimeout(HOVER.to);
        HOVER.to = setTimeout(function () {
            if (document.elementFromPoint(MOUSE.x, MOUSE.y) !== null) {
                let cond = document.elementFromPoint(MOUSE.x, MOUSE.y).id === el.id,
                    html = WORLD.returnTileDesc(el);

                HOVER.make(html, cond, 150);
            }
        }, 350);
    },
    eventOn: function (el) {
        clearTimeout(HOVER.to);
        HOVER.to = setTimeout(function () {
            if (document.elementFromPoint(MOUSE.x, MOUSE.y) !== null) {
                let cond = document.elementFromPoint(MOUSE.x, MOUSE.y).id === el.id,
                    html = el.dataset.hover;

                HOVER.make(html, cond, 250);
            }
        }, 100);
    },
    supplyOn: function (el) {
        if (SETTINGS.hover === "false") {
            return;
        }
        
        clearTimeout(HOVER.to);
        HOVER.to = setTimeout(function () {
            let d = document.elementFromPoint(MOUSE.x, MOUSE.y);
            if (d === null) {
                HOVER.del();
                return;
            }

            let cond, id, item, html;
            try {
                cond = d.id === el.id || d.id === el.id + "-youSelect" || d.id === el.id + "-oppSelect";
                id = el.id.split("-youSelect").join("").split("-oppSelect").join("");
                item = SUPPLIES.current[id] !== undefined ? SUPPLIES.current[id].data : LOOT.yourCurrent[id] !== undefined ? LOOT.yourCurrent[id].data : LOOT.current[id].data;
                html = "<b>" + item.title + "</b><br /><br />" + item.desc;
            } catch (e) {
                return;
            }

            if (item.weapon !== undefined && item.weapon) {
                html += "<br /><br />weapon stats:<br /><b>" + item.weapon_data.dmg + "</b> dmg<br /><b>" + item.weapon_data.sp + "</b> sp";
            }

            if (item.craft !== undefined && item.craft) {
                html += "<br /><br />crafting recipe:";
                for (let i = 0; i < Object.keys(item.craft_data).length; i++) {
                    let id = Object.keys(item.craft_data)[i],
                        title = item.craft_data[id].title,
                        count = item.craft_data[id].count,
                        yourCount = SUPPLIES.current[id] === undefined ? 0 : SUPPLIES.current[id].count;

                    html += "<br /><b>(" + count + "x)</b> " + title + (yourCount !== 0 ? " (you have " + yourCount + ")" : "");
                }
            }

            if (item.weight !== undefined) {
                html += "<br /><br />item weight: <b>" + item.weight + " unit" + (item.weight === 1 ? "" : "s") + "</b>";
            }

            HOVER.make(html, cond, 350);
        }, 150);
    },
    make: function (html, condition, width) {
        if (condition) {
            HOVER.del();

            let x = MOUSE.x;
            if (x + width + 18 > window.innerWidth) {
                x = window.innerWidth - width - 18;
            }

            let hov = document.createElement("div");
            hov.id = "hover-tileinfo";
            hov.setAttribute("style", "left:" + x + "px;top:" + (MOUSE.y + 12) + "px;width:" + width + "px");
            hov.style.zIndex = "18";

            hov.innerHTML = html;

            document.getElementById("form1").appendChild(hov);
        }
    },
    del: function () {
        if (document.getElementById("hover-tileinfo") !== null) {
            document.getElementById("hover-tileinfo").outerHTML = "";
        }
    }
},
EGGS = {
    texture_pack: function (t) {
        switch (t) {
            case "0x22": {
                YOU.char = "😹";

                WORLD.TILES.city = "🏙️";
                WORLD.TILES.forest = "🌲";
                WORLD.TILES.grass = "🌿";
                WORLD.TILES.house = "🏠";
                WORLD.TILES.island = "🏝️";
                WORLD.TILES.monument = "🌟";
                WORLD.TILES.mountain = "⛰️";
                WORLD.TILES.sand = "🏜️";
                WORLD.TILES.swamp = "💩";
                WORLD.TILES.traveler = "😂";
                WORLD.TILES.tree = "🎄";
                WORLD.TILES.water = "💧";
                WORLD.TILES.worldedge = "🚧";

                WORLD.build();
                break;
            }
            case "default": {
                WORLD.TILES.city = "C";
                WORLD.TILES.forest = "F";
                WORLD.TILES.grass = ",";
                WORLD.TILES.house = "H";
                WORLD.TILES.island = ".";
                WORLD.TILES.monument = "\u258B";
                WORLD.TILES.mountain = "M";
                WORLD.TILES.sand = "&nbsp;";
                WORLD.TILES.swamp = "~";
                WORLD.TILES.traveler = "&amp;";
                WORLD.TILES.tree = "t";
                WORLD.TILES.water = "w";
                WORLD.TILES.worldedge = '\u2591';
                YOU.char = WORLD.TILES.traveler;

                WORLD.build();
                break;
            }
            default: {
                console.log("not found");
            }
        }
    }
},
SLIDE = {
    toggle: function (id, time) {
        if (id instanceof Element || id instanceof HTMLDocument) {
            if (id.clientHeight !== 0) {
                SLIDE.up(id, time);
            } else if (id.clientHeight === 0) {
                SLIDE.down(id, time);
            }
            return;
        }

        let prefix = id.substr(0, 1);
        id = id.substr(1);

        if (document.getElementById(id).clientHeight !== 0) {
            SLIDE.up(prefix + id, time);
        } else if (document.getElementById(id).clientHeight === 0) {
            SLIDE.down(prefix + id, time);
        }
    },
    up: function (id, time) {
        if (id instanceof Element || id instanceof HTMLDocument) {
            var height = parseInt(window.getComputedStyle(id, null).getPropertyValue("height").split("px")[0]) || id.clientHeight,
                paddingtop = parseInt(window.getComputedStyle(id, null).getPropertyValue("padding-top").split("px")[0]),
                paddingbottom = parseInt(window.getComputedStyle(id, null).getPropertyValue("padding-bottom").split("px")[0]),
                initTime = time,
                interval;

            if (height === 0) {
                return;
            }

            id.style.overflow = "hidden";
            id.style.height = height;

            interval = setInterval(function () {
                time -= GAMEPROPS.framerate;

                if (time > 0) {
                    id.style.height = height * time / initTime + "px";
                    id.style.paddingTop = paddingtop * time / initTime + "px";
                    id.style.paddingBottom = paddingbottom * time / initTime + "px";
                } else {
                    id.style.height = id.style.overflow = id.style.paddingTop = id.style.paddingBottom = null;
                    id.style.display = "none";
                    clearInterval(interval);
                }
            }, GAMEPROPS.framerate);
            return;
        }
        if (id.substr(0, 1) === "#") {
            SLIDE.up(document.getElementById(id.substr(1)), time);
        }
        if (id.substr(0, 1) === ".") {
            id = id.substr(1);
            let list = document.getElementsByClassName(id);

            for (let i = 0; i < list.length; i++) {
                SLIDE.up("#" + list[i].getAttribute("id"), time);
            }
        }
    },
    down: function (id, time) {
        if (id instanceof Element || id instanceof HTMLDocument) {
            if (id.clientHeight !== 0) {
                return;
            }

            let height,
                paddingtop,
                paddingbottom,
                startTime = 0,
                interval,
                originalposition = window.getComputedStyle(id, null).getPropertyValue("position");

            id.style.visibility = "hidden";
            id.style.position = "absolute";
            id.style.display = "block";
            id.style.height = null;

            height = parseInt(window.getComputedStyle(id, null).getPropertyValue("height").split("px")[0]) || id.clientHeight;
            paddingtop = parseInt(window.getComputedStyle(id, null).getPropertyValue("padding-top").split("px")[0]);
            paddingbottom = parseInt(window.getComputedStyle(id, null).getPropertyValue("padding-bottom").split("px")[0]);

            id.style.height = "0px";
            id.style.display = "block";
            id.style.overflow = "hidden";
            id.style.paddingBottom = id.style.paddingTop = "0px";
            id.style.position = originalposition;
            id.style.visibility = "initial";

            interval = setInterval(function () {
                startTime += GAMEPROPS.framerate;

                if (startTime < time) {
                    id.style.height = height * startTime / time + "px";
                    id.style.paddingTop = paddingtop * startTime / time + "px";
                    id.style.paddingBottom = paddingbottom * startTime / time + "px";
                } else {
                    id.style.height = "initial";
                    id.style.paddingTop = id.style.paddingBottom = id.style.overflow = null;
                    clearInterval(interval);
                }
            }, GAMEPROPS.framerate);

            return;
        }
        if (id.substr(0, 1) === "#") {
            SLIDE.down(document.getElementById(id.substr(1)), time);
        }
        if (id.substr(0, 1) === ".") {
            id = id.substr(1);
            let list = document.getElementsByClassName(id);

            for (let i = 0; i < list.length; i++) {
                SLIDE.down("#" + list[i].getAttribute("id"), time);
            }
        }
    }
},
MOBILE = {
    prev: false,
    is: false,
    switch: function () {
        if (MOBILE.is) { // we just switched to mobile view
            MOBILE.which("you");
        } else { // we just switched to desktop view
            MOBILE.which("all");
        }
    },

    notif: function (which) {
        if (MOBILE.viewing === which) {
            return;
        }

        switch (which) {
            case "you": {
                document.getElementById("mobile-statsBtn").value = "you (!)";
                break;
            }
            case "event": {
                document.getElementById("mobile-eventBtn").value = "events (!)";
                break;
            }
            case "supp": {
                document.getElementById("mobile-suppBtn").value = "supplies (!)";
                break;
            }
            case "craft": {
                document.getElementById("mobile-craftBtn").value = "crafting (!)";
                break;
            }
        }
    },

    viewing: "you",
    which: function (type) {
        let craft = document.getElementById("craftDiv"),
            supp = document.getElementById("suppliesDiv"),
            you = document.getElementById("statsDiv"),
            event = document.getElementById("consoleDiv");

        switch (type) {
            case "all": {
                craft.style.display = "";
                supp.style.display = "";
                you.style.display = "";
                event.style.display = "";
                break;
            }
            case "you": {
                craft.style.display = "none";
                supp.style.display = "none";
                you.style.display = "";
                event.style.display = "none";
                break;
            }
            case "event": {
                craft.style.display = "none";
                supp.style.display = "none";
                you.style.display = "none";
                event.style.display = "";
                break;
            }
            case "supp": {
                craft.style.display = "none";
                supp.style.display = "";
                you.style.display = "none";
                event.style.display = "none";
                break;
            }
            case "craft": {
                craft.style.display = "";
                supp.style.display = "none";
                you.style.display = "none";
                event.style.display = "none";
                break;
            }
        }

        if (type !== "all") {
            MOBILE.viewing = type;
        }
    }
};

window.onresize = function () {
    MOBILE.is = window.innerWidth <= 1200;
    if (MOBILE.prev !== MOBILE.is) {
        MOBILE.switch();
    }
    MOBILE.prev = MOBILE.is;
};