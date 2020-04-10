SETTINGS = {
    mainEl: document.getElementById("settings-menu"),
    darkCheck: document.getElementById("set-darkmode"),
    hoverCheck: document.getElementById("set-hover"),
    autopastCheck: document.getElementById("set-autowalkpast"),
    autopastTimeInput: document.getElementById("set-autowalkpast-time"),
    notifAnyCheck: document.getElementById("set-notifAny"),
    notifSoundCheck: document.getElementById("set-notifSound"),
    notifDesktopCheck: document.getElementById("set-notifDesktop"),
    notifTravelerCheck: document.getElementById("set-notifTraveler"),
    notifCityCheck: document.getElementById("set-notifCity"),
    notifHouseCheck: document.getElementById("set-notifHouse"),
    notifLevelCheck: document.getElementById("set-notifLevel"),
    setSupplyDrop: document.getElementById("set-supply-view"),

    open: function () {
        this.mainEl.style.display = "";
    },
    close: function () {
        this.mainEl.style.display = "none";
    },

    toggleDarkMode: function () {
        if (document.getElementById("css-darkmode") === null) {
            let css = document.createElement('link');
            css.setAttribute('id', 'css-darkmode');
            css.setAttribute('rel', 'stylesheet');
            css.setAttribute('href', document.getElementById("styleCss").href.split("__travelers.css").join("_darkmode.css"));
            document.getElementsByTagName("head")[0].appendChild(css);

            this.checkOn(this.darkCheck);
            SETTINGS.change("darkmode", "true");
        } else {
            document.getElementById("css-darkmode").outerHTML = "";

            this.checkOff(this.darkCheck);
            SETTINGS.change("darkmode", "false");
        }
    },
    toggleHover: function () {
        if (SETTINGS.hover === "true") {
            this.checkOff(this.hoverCheck);
            SETTINGS.change("hover", "false");
        } else {
            this.checkOn(this.hoverCheck);
            SETTINGS.change("hover", "true");
        }
    },
    toggleAutoPast: function () {
        if (SETTINGS.autowalkpast === "true") {
            this.checkOff(this.autopastCheck);
            SETTINGS.change("autowalkpast", "false");
        } else {
            this.checkOn(this.autopastCheck);
            SETTINGS.change("autowalkpast", "true");
        }
    },
    setAutopastTime: function (cycles) {
        if (cycles === "" || cycles < 0) {
            SETTINGS.change("autowalkpasttime", 0);
        } else {
            SETTINGS.change("autowalkpasttime", cycles - 1);
        }
    },
    toggleNotifAny: function () {
        if (SETTINGS.notifAny === "true") {
            this.checkOff(this.notifAnyCheck);
            SETTINGS.change("notifAny", "false");
            document.getElementById("notif-sub00").style.opacity = "0.5";
            document.getElementById("notif-sub0").style.opacity = "0.5";
            document.getElementById("notif-sub1").style.opacity = "0.5";
            document.getElementById("notif-sub2").style.opacity = "0.5";
            document.getElementById("notif-sub3").style.opacity = "0.5";
            document.getElementById("notif-sub4").style.opacity = "0.5";
        } else {
            this.checkOn(this.notifAnyCheck);
            SETTINGS.change("notifAny", "true");
            document.getElementById("notif-sub00").style.opacity = "";
            document.getElementById("notif-sub0").style.opacity = "";
            document.getElementById("notif-sub1").style.opacity = "";
            document.getElementById("notif-sub2").style.opacity = "";
            document.getElementById("notif-sub3").style.opacity = "";
            document.getElementById("notif-sub4").style.opacity = "";
        }
    },
    toggleNotifSound: function () {
        if (SETTINGS.notifSound === "true") {
            this.checkOff(this.notifSoundCheck);
            SETTINGS.change("notifSound", "false");
        } else {
            this.checkOn(this.notifSoundCheck);
            SETTINGS.change("notifSound", "true");
        }
    },
    toggleNotifDesktop: function () {
        if (SETTINGS.notifDesktop === "true") {
            this.checkOff(this.notifDesktopCheck);
            SETTINGS.change("notifDesktop", "false");
        } else {
            if (Notification.permission !== 'granted') {
                Notification.requestPermission((r) => {
                    if (r === 'granted') {
                        this.checkOn(this.notifDesktopCheck);
                        SETTINGS.change("notifDesktop", "true");
                    } else {
                        this.checkOff(this.notifDesktopCheck);
                        SETTINGS.change("notifDesktop", "false");
                    }
                });
            } else {
                this.checkOn(this.notifDesktopCheck);
                SETTINGS.change("notifDesktop", "true");
            }
        }
    },
    toggleNotifTraveler: function () {
        if (SETTINGS.notifTraveler === "true") {
            this.checkOff(this.notifTravelerCheck);
            SETTINGS.change("notifTraveler", "false");
        } else {
            this.checkOn(this.notifTravelerCheck);
            SETTINGS.change("notifTraveler", "true");
        }
    },
    toggleNotifCity: function () {
        if (SETTINGS.notifCity === "true") {
            this.checkOff(this.notifCityCheck);
            SETTINGS.change("notifCity", "false");
        } else {
            this.checkOn(this.notifCityCheck);
            SETTINGS.change("notifCity", "true");
        }
    },
    toggleNotifHouse: function () {
        if (SETTINGS.notifHouse === "true") {
            this.checkOff(this.notifHouseCheck);
            SETTINGS.change("notifHouse", "false");
        } else {
            this.checkOn(this.notifHouseCheck);
            SETTINGS.change("notifHouse", "true");
        }
    },
    toggleNotifLevel: function () {
        if (SETTINGS.notifLevelup === "true") {
            this.checkOff(this.notifLevelCheck);
            SETTINGS.change("notifLevelup", "false");
        } else {
            this.checkOn(this.notifLevelCheck);
            SETTINGS.change("notifLevelup", "true");
        }
    },
    setSupplyView: function (type) {
        if (type === 1) { //icon
            SUPPLIES.sortStyle = "icon";
            SETTINGS.change("supplyView", "icon");
        } else if (type === 2) { //list
            SUPPLIES.sortStyle = "list";
            SETTINGS.change("supplyView", "list");
        }
        SUPPLIES.set(SUPPLIES.current);
        CRAFTING.setHtml(CRAFTING.server_list);
    },

    defaultList: {
        darkmode: "false",
        hover: "true",
        autowalkpast: "true",
        autowalkpasttime: "29",
        notifAny: "true",
        notifSound: "false",
        notifDesktop: "false",
        notifTraveler: "true",
        notifCity: "false",
        notifHouse: "false",
        notifLevelup: "true",
        supplyView: "icon"
    },

    darkmode: "false",
    hover: "true",
    autowalkpast: "true",
    autowalkpasttime: "29",
    notifAny: "true",
    notifSound: "false",
    notifDesktop: "false",
    notifTraveler: "true",
    notifCity: "false",
    notifHouse: "false",
    notifLevelup: "true",
    supplyView: "icon",

    get: function (setting) {
        let c = document.cookie;

        if (c.indexOf(setting + "=") !== -1 && c.indexOf(setting + "=" + c.split(setting + "=")[1]) !== -1) {
            let val = c.split(setting + "=")[1];
            if (c.indexOf(";") !== -1) {
                return val.split(";")[0];
            } else {
                return val;
            }
        } else {
            return "";
        }
    },
    change: function (key, value) {
        document.cookie = key + "=" + value + ";expires=" + new Date(2147483646999).toUTCString() + ";path=/";

        eval('SETTINGS.' + key + '="' + value + '"');
    },
    applyCookie: function () {
        for (let i = 0; i < Object.keys(SETTINGS.defaultList).length; i++) {
            let key = Object.keys(SETTINGS.defaultList)[i],
                value = SETTINGS.get(key);

            if (value === "") {
                document.cookie = key + "=" + SETTINGS.defaultList[key] + ";expires=" + new Date(2147483646999).toUTCString() + ";path=/";
            } else {
                SETTINGS.change(key, value);
            }
        }

        //visual effects associated with non-default values, and all checkboxes must check for false 
        if (SETTINGS.darkmode === "true") {
            SETTINGS.toggleDarkMode();
        }
        if (SETTINGS.autowalkpast === "false") {
            this.checkOff(this.autopastCheck);
        }
        if (SETTINGS.notifAny === "false") {
            this.checkOff(this.notifAnyCheck);
            document.getElementById("notif-sub1").style.opacity = "0.5";
            document.getElementById("notif-sub2").style.opacity = "0.5";
            document.getElementById("notif-sub3").style.opacity = "0.5";
            document.getElementById("notif-sub4").style.opacity = "0.5";
        }
        if (SETTINGS.notifSound === "false") {
            this.checkOff(this.notifSoundCheck);
        }
        if (SETTINGS.notifDesktop === "false" || Notification.permission !== 'granted') {
            this.checkOff(this.notifDesktopCheck);
        }
        if (SETTINGS.notifTraveler === "false") {
            this.checkOff(this.notifTravelerCheck);
        }
        if (SETTINGS.notifCity === "false") {
            this.checkOff(this.notifCityCheck);
        }
        if (SETTINGS.notifHouse === "false") {
            this.checkOff(this.notifHouseCheck);
        }
        if (SETTINGS.notifLevelup === "false") {
            this.checkOff(this.notifLevelCheck);
        }
        if (SETTINGS.hover === "false") {
            this.checkOff(this.hoverCheck);
        }
        if (SETTINGS.supplyView === "list") {
            this.setSupplyView(2);
            this.setSupplyDrop.value = 2;
        }
        this.autopastTimeInput.value = (parseInt(SETTINGS.get("autowalkpasttime")) + 1).toString();
    },
    createCookie: function () {
        for (let i = 0; i < Object.keys(SETTINGS.defaultList).length; i++) {
            let key = Object.keys(SETTINGS.defaultList)[i],
                value = SETTINGS.defaultList[key];

            document.cookie = key + "=" + value + ";expires=" + new Date(2147483646999).toUTCString() + ";path=/";
        }
        this.applyCookie();
    },
    deleteCookie: function () {
        for (let i = 0; i < SETTINGS.defaultList.length; i++) {
            let key = Object.keys(SETTINGS.defaultList[i])[0],
                value = SETTINGS.defaultList[i][key];

            document.cookie = key + "=" + value + ";expires=" + new Date(0).toUTCString() + ";path=/";
            this.change(key, value);
        }
    },

    checkToggle: function (el) {
        if (el.className.indexOf("settings-checked") !== -1) {
            this.checkOff(el);
            return false;
        } else {
            this.checkOn(el);
            return true;
        }
    },
    checkOn: function (el) {
        el.className = el.className.split("settings-checked").join("").trim() + " settings-checked";
    },
    checkOff: function (el) {
        el.className = el.className.split("settings-checked").join("").trim();
    }
},
ACC = {
    boxEl: document.getElementById("account-menu"),
    loadingEl: document.getElementById("account-loading"),
    mainEl: document.getElementById("account-main"),
    emailEl: document.getElementById("account-email"),
    usernameEl: document.getElementById("account-username"),

    acctLoaded: false,
    yourEmail: "",
    toggle: function () {
        if (ACC.boxEl.style.display === "") {
            ACC.close();
        } else {
            ACC.open();
        }
    },
    open: function () {
        ACC.boxEl.style.display = "";
        ACC.loadingEl.innerHTML = "loading...";

        if (!ACC.acctLoaded) {
            ENGINE.ajaxCall(
                "/default.aspx/GetAcctInfo",
                {},
                function (r) {
                    if (r === "0") {
                        ACC.loadingEl.innerHTML = "failed to load account.";
                    } else {
                        ACC.loadingEl.style.display = "none";
                        ACC.mainEl.style.display = "";

                        ACC.yourEmail = r;
                        ACC.fillEmailLine();
                        ACC.usernameEl.innerHTML = "<b>username</b>: " + YOU.username;

                        //if (r === "") {
                        //    ACC.changeEmailBtn.style.display = "none";
                        //}

                        ACC.acctLoaded = true;
                    }
                }
            );
        }
    },
    fillEmailLine: function () {
        ACC.emailEl.innerHTML = "<b>email</b>: " + (ACC.yourEmail === "" ? "<i style='font-size:14px'>(no email on this account)</i> <span class='spanlink' onclick='ACC.addEmailBox();'>add email</span>" : ACC.yourEmail);
    },
    close: function () {
        ACC.boxEl.style.display = "none";
        ACC.changePassBox.style.display = "none";
    },

    addEmailBox: function () {
        ACC.emailEl.innerHTML = "<b>email</b>: <input type='text' id='account-addemail' placeholder='add an email' maxlength='200'/><span class='spanlink' style='margin:0 0 0 5px' onclick='ACC.addEmail()' id='account-email-add-btn'>add</span><span class='spanlink' style='margin:0 0 0 10px' onclick='ACC.fillEmailLine()'>cancel</span><span id='account-email-error' class='account-badspan'></span>";
    },
    addingEmail: false,
    addEmail: function () {
        let t = document.getElementById("account-addemail"),
            error = document.getElementById("account-email-error"),
            addBtn = document.getElementById("account-email-add-btn");

        if (t !== null && error !== null && addBtn !== null) {
            let fail = function (text) {
                error.innerHTML = text;
                t.setAttribute("style", "font-size:15px;box-shadow:0 0 0 1px " + (SETTINGS.darkmode === "true" ? "#ff4747" : "#a80000") + " !important");
                addBtn.innerHTML = "add";
                ACC.addingEmail = false;
            };

            if (ACC.addingEmail) {
                return;
            }
            ACC.addingEmail = true;

            addBtn.innerHTML = "loading...";
            error.innerHTML = "";
            t.setAttribute("style", "font-size:15px;");

            if (SOCKET.validateEmail(t.value)) {
                let email = t.value.trim();

                ENGINE.ajaxCall(
                    "/default.aspx/AddEmail",
                    {
                        "email": email
                    },
                    function (r) {
                        if (r === "2") {
                            fail("that email is taken");
                        } else {
                            if (r === "1") {
                                ACC.yourEmail = email.toLowerCase();
                                ACC.fillEmailLine();
                                //ACC.changeEmailBtn.style.display = "";
                            } else {
                                fail("invalid email");
                            }
                        }
                    }
                );
            } else {
                fail("invalid valid email");
            }
        }
    },
    
    //changeEmailBtn: document.getElementById("change-emailBtn"),
    changeEmailBox: document.getElementById("change-emailBox"),

    changePassBtn: document.getElementById("change-passwordBtn"),
    changePassBox: document.getElementById("change-passwordBox"),
    oldpass: document.getElementById("change-oldpassTxt"),
    newpass: document.getElementById("change-newpassTxt"),
    conpass: document.getElementById("change-conpassTxt"),
    badChangePass: document.getElementById("bad-changepass"),
    submitPassBtn: document.getElementById("submit-newPass"),

    changingpass: false,
    changepass: function () {
        if (ACC.changingpass) {
            return;
        }
        ACC.changingpass = true;

        let oldp = ACC.oldpass.value.trim(),
            newp = ACC.newpass.value.trim(),
            conp = ACC.conpass.value.trim(),
            failed = function (t) {
                ACC.submitPassBtn.value = "submit";
                ACC.badChangePass.innerHTML = t;
                ACC.changingpass = false;
            };

        ACC.submitPassBtn.value = "loading...";
        ACC.badChangePass.innerHTML = "";
        ACC.badChangePass.style.color = "";

        if (newp !== conp) {
            failed("passwords don't match");
            return;
        }
        if (newp.length < 6) {
            failed("passwords must be at least 6 characters");
            return;
        }
        if (oldp.length < 6) {
            failed("incorrect old password");
            return;
        }
        if (oldp === newp) {
            failed("same as old password");
            return;
        }

        ENGINE.ajaxCall(
            "/default.aspx/ChangePassword",
            {
                "oldp": oldp,
                "newp": newp,
                "conp": conp
            },
            function (r) {
                if (r === "0") {
                    failed("improper submit data");
                } else {
                    if (r === "1") {
                        failed("please try again");
                    } else {
                        ACC.badChangePass.style.color = SETTINGS.darkmode === "true" ? "#fff" : "#000";
                        ACC.badChangePass.innerHTML = "password changed successfully";

                        ACC.oldpass.value = "";
                        ACC.newpass.value = "";
                        ACC.conpass.value = "";
                    }
                }

                ACC.changingpass = false;
                ACC.submitPassBtn.value = "submit";
            }
        );
    },

    toggleEmailBox: function () {
        if (ACC.changeEmailBox.style.display === "") {
            ACC.changeEmailBox.style.display = "none";
        } else {
            ACC.changeEmailBox.style.display = "";
        }
        ACC.changePassBox.style.display = "none";
    },
    togglePassBox: function () {
        if (ACC.changePassBox.style.display === "") {
            ACC.changePassBox.style.display = "none";
        } else {
            ACC.changePassBox.style.display = "";
        }
        //ACC.changeEmailBox.style.display = "none";
    }
};