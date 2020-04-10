var INT = {
    initEl: document.getElementById("int-popup"),
    blockerEl: document.getElementById("int-blocker"),

    msgBoxEl: document.getElementById("int-messagebox"),
    messagesEl: document.getElementById("int-messages"),
    textBoxEl: document.getElementById("int-textbox"),
    usernamesEl: document.getElementById("int-usernames"),
    atLocEl: document.getElementById("int-atthisloc"),
    areaEl: document.getElementById("int-areainfo"),
    btnSendEl: document.getElementById("int-sendBtn"),
    sendingEl: document.getElementById("int-sending"),

    openInit: function () {
        INT.initEl.style.display = "";
        INT.blockerEl.style.display = "";
        POPUP.evCycle.style.display = "";

        INT.usernamesEl.innerHTML = "";
        INT.areaEl.innerHTML = "";
        INT.messagesEl.innerHTML = "";
        INT.textBoxEl.value = "";
    },
    genBoxInfo: function (users) {
        users.sort((a, b) => a.username > b.username);

        let countOnline = 0,
            userHtml = "";
        users.forEach(j => {
            if (j.username === YOU.username) return;

            userHtml += "<b>" + j.username + "</b><p class='int-playerinfo'>" + (j.online ? "awake" : "asleep") + "</p><br />";
            if (j.online) {
                userHtml += "<input type='button' disabled='disabled' class='int-btns' value='attack' />";
                userHtml += "<input type='button' disabled='disabled' class='int-btns' value='offer trade' />";
            } else {
                userHtml += "<input type='button' class='int-btns' value='leave message' onclick='INT.openOfflineMsg(this.dataset.username)' data-username='" + j.username + "' />";
                userHtml += "<input type='button' disabled='disabled' class='int-btns' value='loot' />";
                userHtml += "<input type='button' disabled='disabled' class='int-btns' value='kill' />";
            }
            userHtml += "<br /><br />";
            if (j.online) countOnline++;
        });
        INT.usernamesEl.innerHTML = userHtml;

        let userLength = users.length - 1;
        if (countOnline === 0 && userLength === 0) { // int ended and user is alone
            INT.areaEl.innerHTML = "<div class='init-message'>there's no one here.</div>";
            INT.atLocEl.style.display = "none";
            INT.msgBoxEl.style.height = "initial";
            INT.textBoxEl.style.display = "none";
            INT.btnSendEl.style.display = "none";
            INT.atLocEl.style.marginTop = "";
        } else {
            INT.msgBoxEl.style.height = "";
            INT.atLocEl.style.display = "";
            INT.atLocEl.style.marginTop = "";
            INT.textBoxEl.style.display = "";
            INT.btnSendEl.style.display = "";

            if (countOnline === userLength) { // all are online
                INT.areaEl.innerHTML = "<div class='init-message'>the other " + (userLength === 1 ? "traveler watches" : "travelers watch") + " you carefully.</div>";
            } else {
                if (userLength - countOnline === 1 && userLength >= 2) { // one is offline
                    INT.areaEl.innerHTML = "<div class='init-message'>the other " + (countOnline === 1 ? "traveler watches" : "travelers watch") + " you carefully. another rests at their feet, unconscious.</div>";
                } else {
                    if (countOnline === 0) { // all are offline
                        INT.areaEl.innerHTML = "<div class='init-message'>" + (userLength === 1 ? "a traveler rests " : (userLength > 5 ? "numerous travelers rest " : "a few travelers rest ")) + "on the ground here, unconscious.</div>";
                        INT.textBoxEl.style.display = "none";
                        INT.msgBoxEl.style.height = "initial";
                        INT.btnSendEl.style.display = "none";
                        INT.atLocEl.style.marginTop = "30px";
                    } else { // multiple are offline, one or multiple online
                        INT.areaEl.innerHTML = "<div class='init-message'>the other " + (userLength === 1 ? "traveler watches" : "travelers watch") + " you carefully. " + (userLength === 1 ? "a traveler rests " : (userLength > 5 ? "numerous travelers rest " : "a few travelers rest ")) + "on the ground here, unconscious.</div>";
                    }
                }
            }
        }
    },
    leaveInit: function () {
        SOCKET.send({
            "action": "leave_int"
        });
        ENGINE.addCycleTrigger("INT.close();");
    },
    close: function () {
        INT.initEl.style.display = "none";
        INT.blockerEl.style.display = "none";
        POPUP.evCycle.style.display = "none";
        INT.messagesEl.innerHTML = "";
    },

    sendMessage: function (btn) {
        let text = INT.textBoxEl.value.trim();
        
        if (text.length > 0 && text.length <= 200) {
            INT.textBoxEl.value = "";
            SOCKET.send({
                "action": "chat",
                "message": text
            });

            btn.setAttribute('disabled', 'disabled');
            INT.sendingEl.style.display = "";
            ENGINE.addCycleTrigger("document.getElementById('" + btn.id + "').removeAttribute('disabled');INT.sendingEl.style.display='none';");
        }
    },
    addNewMsgs: function (msg_array) {
        msg_array.forEach(j => INT.messagesEl.innerHTML += "<div class='int-message'>" + (j.from === YOU.username ? "<b>[" + j.from + "]&nbsp;</b>" : "[" + j.from + "]&nbsp;") + j.text + "</div>");
        INT.msgBoxEl.scrollTop = INT.msgBoxEl.scrollHeight;
    },

    leavePopupEl: document.getElementById("int-leavemsg-pop"),
    leaveLeaveSideEl: document.getElementById("int-leavemsg-side"),
    leaveShowSideEl: document.getElementById("int-showmsgs-side"),
    leaveDescEl: document.getElementById("int-leavemsg-desc"),
    leaveTextboxEl: document.getElementById("int-leavemsg-textbox"),
    leaveBlockerEl: document.getElementById("int-leavemsg-blocker"),
    leaveSendBtnEl: document.getElementById("int-leavemsg-send"),
    leaveRemoveBtnEl: document.getElementById("int-leavemsg-remove"),
    openOfflineMsg: function (username) {
        INT.leaveLeaveSideEl.style.display = "";
        INT.leaveShowSideEl.style.display = "none";

        INT.leavePopupEl.style.display = "";
        INT.leaveBlockerEl.style.display = "";
        INT.leaveTextboxEl.value = "";
        INT.leaveRemoveBtnEl.style.display = "none";
        INT.leaveDescEl.innerHTML = "leave a message for <b>" + username + "</b> to wake up to.";
        INT.leaveSendBtnEl.setAttribute("onclick", "INT.sendOfflineMsg('" + username + "');");
        INT.leaveRemoveBtnEl.setAttribute("onclick", "INT.removeOfflineMsg('" + username + "');");

        SOCKET.send({
            "action": "int_getmsg",
            "username": username
        });
    },
    sendOfflineMsg: function (username) {
        let msg = INT.leaveTextboxEl.value.trim();

        if (msg.length > 0) {
            INT.leavePopupEl.style.display = "none";
            INT.leaveBlockerEl.style.display = "none";
            INT.leaveTextboxEl.value = "";

            SOCKET.send({
                "action": "int_leavemsg",
                "username": username,
                "msg": msg
            });
        }
    },
    removeOfflineMsg: function (username) {
        INT.cancelOfflineMsg();

        SOCKET.send({
            "action": "int_removemsg",
            "username": username
        });
    },
    cancelOfflineMsg: function () {
        INT.leavePopupEl.style.display = "none";
        INT.leaveBlockerEl.style.display = "none";
    },
    showMsgsEl: document.getElementById("int-showmsgs"),
    showMsgDescEl: document.getElementById("int-showmsg-desc"),
    showOfflineMsgs: function (msgs) {
        if (msgs.length === 0) return;

        INT.leavePopupEl.style.display = "";
        INT.leaveBlockerEl.style.display = "";
        INT.leaveLeaveSideEl.style.display = "none";
        INT.leaveShowSideEl.style.display = "";

        let desc = (msgs.length === 1 ? "there seems to be a note left " : "it seems like people left notes ") + " on the ground beside you while you were unconscious.",
            addHtml = "";

        ENGINE.log(desc);
        INT.showMsgDescEl.innerHTML = desc;

        msgs.forEach((m) => { addHtml += "<div class='int-offlinemsgs'>" + m + "</div>"; });
        INT.showMsgsEl.innerHTML = addHtml;
    }
};