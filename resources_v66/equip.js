var EQUIP = {
    menuEl: document.getElementById("supplies-equipactions"),
    titleEl: document.getElementById("supplies-equipped-title"),
    descEl: document.getElementById("equip-desc"),
    statusEl: document.getElementById("equip-currentstatus"),
    actionsEl: document.getElementById("supplies-equipped-buttons"),

    current: "",
    current_id: "",

    isOpen: false,
    open: function (dontTriggerSend) {

        EQUIP.isOpen = true;
        EQUIP.menuEl.style.display = "";

        let item = SUPPLIES.current[SUPPLIES.current_item].data;
        if (item.name === EQUIP.current_id && dontTriggerSend === undefined) return;

        if (dontTriggerSend === undefined) {
            EQUIP.setStatus('');
        }

        EQUIP.current = item.title;
        EQUIP.current_id = item.name;
        EQUIP.titleEl.innerHTML = "equipped: <b>" + item.title + "</b>";
        EQUIP.descEl.innerHTML = item.func_desc;

        ENGINE.log("equipped <b>" + item.title + "</b>.");
        if (item.func_start !== undefined) {
            eval(item.func_start);
        }

        if (dontTriggerSend === undefined || !dontTriggerSend) {
            SOCKET.send({
                "action": "equip",
                "item": SUPPLIES.current_item
            });
        }

        EQUIP.actionsEl.innerHTML = "";
        if (item.func_actions !== undefined) {
            for (let i = 0; i < Object.keys(item.func_actions).length; i++) {
                let name = Object.keys(item.func_actions)[i],
                    server = item.func_actions[name].server,
                    client = item.func_actions[name].client,
                    btn = document.createElement("input");

                btn.type = "button";
                btn.className = "craft-btns focus";
                btn.value = item.func_actions[name].btn_text;
                btn.setAttribute("style", "padding: 2px 5px;font-size:14px;margin: 0 3px 6px;");
                btn.onclick = function () {
                    SOCKET.send({
                        "action": "equipment",
                        "option": server
                    });
                    eval(client);

                    EQUIP.setStatus(EQUIP.current_id, name);
                };
                EQUIP.actionsEl.appendChild(btn);
            }
        }

        let dequip = document.createElement("input");
        dequip.type = "button";
        dequip.className = "craft-btns focus";
        dequip.value = "unequip";
        dequip.setAttribute("style", "padding: 2px 5px;font-size:14px;margin: 0 3px 6px;");
        dequip.onclick = function () {
            SOCKET.send({
                "action": "dequip"
            });
            EQUIP.close();
            ENGINE.log("unequipped <b>" + EQUIP.current + "</b>.", false);
            EQUIP.current = "";
            EQUIP.current_id = "";
        };
        EQUIP.actionsEl.appendChild(dequip);

        SUPPLIES.closeMenu();
    },
    setStatus: function (item_id, btn_id) {
        if (item_id !== undefined && item_id !== "" && btn_id !== undefined
            && SUPPLIES.current[item_id] !== undefined
            && SUPPLIES.current[item_id].data.func_actions !== undefined
            && SUPPLIES.current[item_id].data.func_actions[btn_id] !== undefined
            && SUPPLIES.current[item_id].data.func_actions[btn_id].btn_text !== undefined
            && SUPPLIES.current[item_id].data.func_actions[btn_id].show_status !== undefined
            && SUPPLIES.current[item_id].data.func_actions[btn_id].show_status) { // i have too many item possibilities lol
            EQUIP.statusEl.style.display = "";
            EQUIP.statusEl.innerHTML = "<b>current status</b>: " + SUPPLIES.current[item_id].data.func_actions[btn_id].btn_text;
        } else {
            EQUIP.statusEl.style.display = "none";
        }
    },
    close: function () {
        EQUIP.isOpen = false;
        EQUIP.setStatus("");
        EQUIP.menuEl.style.display = "none";
    }
};