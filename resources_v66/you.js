var YOU = {

    //server values
    x: 500,
    y: 500,
    username: "",
    state: "travel",
    level: 0,
    dir: "",
    autowalk: false,
    cutscene: -1,

    //game values
    char: WORLD.TILES.traveler,
    step: 1,
    prevX: 0,
    prevY: 0,
    prevBiome: '',
    prevState: 'travel',
    prevDir: '',
    prevAuto: false,
    biome: '',
    prevTile: '',
    currentTile: WORLD.TILES.sand,
    initialize: function () {
        this.setPrevs();
    },
    setPrevs: function () {
        this.prevBiome = this.biome;
        this.prevTile = this.currentTile;
        this.prevX = this.x;
        this.prevY = this.y;
    },
    getCoordString: function () {
        return (YOU.x > 0 ? "+" : "") + YOU.x + ", " + (YOU.y > 0 ? "+" : "") + YOU.y;
    },
    checkMoveLog: function () {
        let text = '';

        if (this.prevBiome === "wasteland" && this.biome === "mountains") {
            text = "the wasted sands yield to colossal mountains, their peaks shrouded by the floating ash.";
        }
        if (this.prevBiome === "wasteland" && this.biome === "beach") {
            text = "the ground turns a sullen gray, beaten back by the acidic waters.";
        }
        if (this.prevBiome === "wasteland" && this.biome === "swamp") {
            text = "your feet begin to sink softly into the mud as steaming swamps stretch ahead.";
        }
        if (this.prevBiome === "wasteland" && this.biome === "forest edge") {
            text = "the old trees break out of the cracked sand, casting what little light there is into shadow.";
        }

        if (this.prevBiome === "mountains" && this.biome === "wasteland") {
            text = "the cascading rocks finally disperse, revealing the broken wasteland ahead.";
        }
        if (this.prevBiome === "mountains" && this.biome === "beach") {
            text = "the altitude lowers smoothly into grayed beaches, revealing the roaring oceans beyond.";
        }
        if (this.prevBiome === "mountains" && this.biome === "swamp") {
            text = "towering stone turns into bubbling mud, the mountains quickly disappearing into the fog.";
        }
        if (this.prevBiome === "mountains" && this.biome === "forest edge") {
            text = "the mountain's edge gives way to the shadows of the woods.";
        }

        if (this.prevBiome === "swamp" && this.biome === "wasteland") {
            text = "the sludge hardens into sand and grass as the swamp falls behind.";
        }
        if (this.prevBiome === "swamp" && this.biome === "beach") {
            text = "colorless beaches extend ahead, replacing the old mud and heavy steam.";
        }
        if (this.prevBiome === "swamp" && this.biome === "mountains") {
            text = "massive rocks suddenly reach for the skies, putting a fast end to the swamps.";
        }
        if (this.prevBiome === "swamp" && this.biome === "forest edge") {
            text = "the fog darkens as the tall trees rise ahead, finally making way to the shadows.";
        }

        if (this.prevBiome === "forest edge" && this.biome === "wasteland") {
            text = "the shadows of the great forest turn to light, revealing deserts stretching to the horizon.";
        }
        if (this.prevBiome === "forest edge" && this.biome === "beach") {
            text = "the bleak sands sneak into the rotted roots, the acid ocean stretching endlessly beyond the last of the woods.";
        }
        if (this.prevBiome === "forest edge" && this.biome === "mountains") {
            text = "the blanket of high leaves concedes to the bitter winds of the mountains.";
        }
        if (this.prevBiome === "forest edge" && this.biome === "swamp") {
            text = "mud slides underneath the twisted brambles and steam slides between the trees.";
        }

        if (text !== "") {
            ENGINE.log(text);
        }
    },

    checkProximFor: function (range, tile) {
        if (range === 0) return false;
        for (let i = -range; i <= range; i++) {
            for (let j = -range; j <= range; j++) {
                if (i === 0 && j === 0) continue;

                let k = (YOU.x + i) + "|" + (YOU.y + j);
                if (document.getElementById(k) !== null && document.getElementById(k).innerHTML === tile) {
                    return true;
                }
            }
        }
        return false;
    },

    deathScreenEl: document.getElementById("death-screen"),
    deathTitleEl: document.getElementById("death-title"),
    deathDescEl: document.getElementById("death-desc"),
    deathBtn: document.getElementById("death-reincarnate-btn"),
    deathMsgs: [
        "how great a hindrance death is on humanity? if death, and the fear thereof, never had stopped them, what wondrous success could their species have achieved?",
        "when working together, humanity has achieved incredible feats; however, as soon as one gains a desire for power, the operation crumbles, and the one would tend to enslave and kill their former friends to their own benefit. thus, progress is sacrified for short-term gain, and as a species, humanity fails.",
        "a human desires to have that which they want, when they want it. it is a tragedy that humans don't desire to benefit their race as a whole, but rather benefit themselves and their personal lives, often to the detriment of others.",
        "what great hypocrisy that humans, when considering the wise ones who advanced their world, think with awe and wonder and respect, yet are not truly inspired to act selflessly."
    ],
    isDead: false,
    kill: function () {
        SUPPLIES.current = {};
        EQUIP.close();
        YOU.isDead = true;
        YOU.prevState = "death";
        YOU.biome = "";
        YOU.prevBiome = "";
        YOU.deathScreenEl.style.display = "";

        if (!ENGINE.isFirstConnect) {
            YOU.deathTitleEl.innerHTML = "died at (" + YOU.x + ", " + YOU.y + ")";
        } else {
            YOU.deathTitleEl.innerHTML = "";
        }

        YOU.deathDescEl.innerHTML = YOU.getDeathMsg();
    },
    getDeathMsg: function () {
        return YOU.deathMsgs[Math.floor(Math.random() * YOU.deathMsgs.length)];
    },
    reincarnate: function () {
        YOU.deathBtn.value = "loading...";
        SOCKET.send({
            "action": "reincarnate"
        });
        YOU.isDead = false;
    }
};