var WORLD = {
    boxElem: document.getElementById("world-box"),
    coordsElem: document.getElementById("world-coords"),
    biomeElem: document.getElementById("world-biome"),
    seed: 20171007,
    gridRadius: 15,
    edgeDist: 50000,
    TILES: {
        traveler: '&amp;',
        sand: '&nbsp;',
        grass: ',',
        tree: 't',
        water: 'w',
        swamp: '~',
        mountain: 'M',
        forest: 'T',
        house: 'H',
        city: 'C',
        startbox: 'u',
        monument: "\u258B",
        island: '.',
        worldedge: '\u2591'
    },
    invalidStand: '',
    invalidPlace: '',
    hardStand: '',
    setInvalids: function () {
        this.hardStand = this.TILES.mountain + this.TILES.forest + this.TILES.water;
        this.invalidStand = this.TILES.worldedge + this.TILES.water;
        this.invalidPlace = this.TILES.worldedge + this.TILES.monument + this.TILES.mountain + this.TILES.water + this.TILES.island + this.TILES.tree + this.TILES.forest;
    },
    tilemap: [],
    initialize: function () {
        for (let i = -1 * this.gridRadius; i <= this.gridRadius; i++) {
            for (let j = -1 * this.gridRadius; j <= this.gridRadius; j++) {
                let tile = document.createElement("span");
                tile.className = "worldtile unselectable";
                
                WORLD.boxElem.appendChild(tile);
                WORLD.tilemap.push(tile);
            }
            WORLD.boxElem.appendChild(document.createElement("br"));
        }
    },
    build: function () {
        let count = 0;
        for (let i = -1 * this.gridRadius; i <= this.gridRadius; i++) {
            for (let j = -1 * this.gridRadius; j <= this.gridRadius; j++) {
                let newX = YOU.x + j,
                    newY = YOU.y - i,
                    tile = this.deriveTile(newX, newY);

                WORLD.tilemap[count].id = newX + "|" + newY;
                WORLD.tilemap[count].innerHTML = tile;
                WORLD.tilemap[count].style.fontWeight = "";

                if (newX === YOU.x && newY === YOU.y) {
                    YOU.currentTile = tile;
                    WORLD.tilemap[count].style.fontWeight = "bold";
                    WORLD.tilemap[count].innerHTML = YOU.char;
                }

                count++;
            }
        }

        this.coordsElem.innerHTML = YOU.getCoordString();
        this.biomeElem.innerHTML = YOU.biome;

        YOU.checkMoveLog();
    },
    otherPlayers: [],
    otherObjs: [],
    checkPlayersAndObjs: function () {
        for (let i = 0; i < this.otherPlayers.length; i++) {
            let x = this.otherPlayers[i].x,
                y = this.otherPlayers[i].y;

            // in case you forget, this will not need to include future building types, only ones that are generated in the clientside worldgen
            WORLD.changeTile(x, y, WORLD.TILES.traveler, true);
        }

        let atop = false;
        for (let i = 0; i < this.otherObjs.length; i++) {
            let x = this.otherObjs[i].x,
                y = this.otherObjs[i].y,
                char = this.otherObjs[i].char;

            if (char === "H") { // texturepack compatibility
                char = WORLD.TILES.house;
            }
            if (char === "C") {
                char = WORLD.TILES.city;
            }

            WORLD.changeTile(x, y, char);

            if (YOU.x === x && YOU.y === y) {
                atop = true;
            }
        }
        ENGINE.atop_another = atop;
    },
    changeTile: function (x, y, c, checkStructs) {
        if (checkStructs === undefined) checkStructs = false; 

        let item = WORLD.deriveTile(x, y);
        if (checkStructs && (item === WORLD.TILES.house || item === WORLD.TILES.city || item === WORLD.TILES.monument)) {
            return;
        }
        document.getElementById(x + "|" + y).innerHTML = c;
    },
    //getTile: function (x, y) { // out of commission, thanks to pfg in discord
    //    let tile = WORLD.deriveTile(x, y);
    //    if (x === YOU.x && y === YOU.y) {
    //        YOU.currentTile = tile;
    //        if (tile !== WORLD.TILES.house && tile !== WORLD.TILES.city && tile !== WORLD.TILES.monument) {
    //            return "<span id='" + x + "|" + y + "' class='worldtile unselectable' style='font-weight:bold;' >" + YOU.char + "</span>";
    //        }
    //    }

    //    return "<span id='" + x + "|" + y + "' class='worldtile unselectable' >" + tile + "</span>";
    //},
    deriveTile: function (x, y) {
        if (x === 0 && y === 0) {
            YOU.biome = "wasteland";
            return WORLD.TILES.monument;
        }

        // ground
        let bottomtile = this.TILES.sand,
            giganticPerl = this.getPerlin(x + 20000, y - 20000, 10000),
            hugePerl = this.getPerlin(x, y, 5001),
            bigPerl = this.getPerlin(x, y),
            smallPerl = this.getPerlin(x, y, 10),
            smallPerlAlt = this.getPerlin(y, x, 11),
            biome = 'wasteland';

        if (giganticPerl > 0.57) {
            if (giganticPerl < 0.578) {
                bottomtile = this.TILES.sand;
                biome = 'beach';
            } else {
                if (giganticPerl > 0.936) {
                    if (giganticPerl > 0.93615) {
                        bottomtile = this.TILES.tree;
                    } else {
                        bottomtile = this.TILES.island;
                    }
                    biome = 'island';
                } else {
                    bottomtile = this.TILES.water;
                    biome = 'ocean';
                }
            }
        } else if (hugePerl < -0.84) {
            if (hugePerl < -0.85) {
                if (Math.abs(giganticPerl) > this.getPerlin(x, y, 27)) {
                    bottomtile = this.TILES.forest;
                    biome = 'forest';
                } else {
                    bottomtile = this.TILES.grass;
                    biome = 'forest clearing';
                }
            } else {
                bottomtile = this.TILES.grass;
                biome = 'forest edge';
            }
        } else {
            if (bigPerl > 0.7) {
                bottomtile = this.TILES.swamp;
                biome = 'swamp';
            } else if (bigPerl < -0.5 && Math.abs(giganticPerl) > this.getPerlin(x, y, 25)) {
                bottomtile = this.TILES.mountain;
                biome = 'mountains';
            } else {
                if (smallPerl > 0.3) {
                    bottomtile = this.TILES.grass;
                } else if (smallPerlAlt < -0.85) {
                    bottomtile = this.TILES.tree;
                }
            }
        }

        //places
        if (WORLD.invalidPlace.indexOf(bottomtile) === -1) {
            let perlRand = this.getPerlin(x, y, 2.501);
            if (Math.floor(perlRand * 3400) === 421) {
                bottomtile = this.TILES.house;
            }
            if (Math.floor(perlRand * 9000) === 4203) {
                bottomtile = this.TILES.city;
            }
        }

        //edge
        if (this.edgeDist - Math.abs(x) < 10) {
            if (this.edgeDist - Math.abs(x) < 1) {
                bottomtile = this.TILES.worldedge;
            } else {
                let perlEdge = this.getPerlin(x, y, 0.005);
                if (1 / (this.edgeDist - Math.abs(x) + perlEdge) > 0.16) {
                    bottomtile = this.TILES.worldedge;
                }
            }
        }
        if (this.edgeDist - Math.abs(y) < 10) {
            if (this.edgeDist - Math.abs(y) < 1) {
                bottomtile = this.TILES.worldedge;
            } else {
                let perlEdge = this.getPerlin(x, y, 0.005);
                if (1 / (this.edgeDist - Math.abs(y) + perlEdge) > 0.16) {
                    bottomtile = this.TILES.worldedge;
                }
            }
        }

        if (x === YOU.x && y === YOU.y) {
            YOU.biome = biome;
        }
        return bottomtile;
    },
    getBiome: function (tile) {
        // if (tile === 'w') return "Ocean";
        // if (tile === '~') return "Swamp";
        // if (tile === 'M') return "Mountains";
        // if (tile === 'T') return "Forest";
        // return "wasteland";

        return YOU.biome;
    },
    getPerlin: function (x, y, s = 100) {
        return noise.simplex2(x / s, y / s);
    },

    prevStepHadPlayers: false,
    prevStepHadEdge: false,
    prevStepNextToEdge: false,
    prevStepNextToOcean: false,
    prevStepHadCity: false,
    prevStepHadHouse: false,
    prevStepHadMon: false,
    checkWorldNotifsAndLogs: function () { // note to self: stop making such long function names 
        let worldHas = function (t) {
            return WORLD.boxElem.innerText.indexOf(t) !== -1;
        };

        if (SETTINGS.notifTraveler === "true" && WORLD.otherPlayers.length > 0 && !WORLD.prevStepHadPlayers) {
            NOTIF.new("traveler nearby", 500);
            ENGINE.log("in the distance, faint against the dark horizon, a traveler appears.");
            WORLD.prevStepHadPlayers = true;
        } else if (WORLD.otherPlayers.length === 0 && WORLD.prevStepHadPlayers) {
            WORLD.prevStepHadPlayers = false;
            NOTIF.stop();
        }

        let boolmon = worldHas(WORLD.TILES.monument);
        if (!WORLD.prevStepHadMon && boolmon) {
            ENGINE.log("an enormous pillar of rock dominates the sky, its face a deep and smooth purple. it pierces the clouds of ash, splitting them to reveal a small glimpse of the blue sky beyond.");
            WORLD.prevStepHadMon = true;
        } else if (!boolmon && WORLD.prevStepHadMon) {
            WORLD.prevStepHadMon = false;
        }

        let boolhouse = worldHas(WORLD.TILES.house);
        if (SETTINGS.notifHouse === "true" && !WORLD.prevStepHadHouse && boolhouse) {
            NOTIF.new("house nearby", 500);
            WORLD.prevStepHadHouse = true;
        } else if (!boolhouse && WORLD.prevStepHadHouse) {
            WORLD.prevStepHadHouse = false;
            NOTIF.stop();
        }

        let boolcity = worldHas(WORLD.TILES.city);
        if (SETTINGS.notifCity === "true" && !WORLD.prevStepHadCity && boolcity) {
            NOTIF.new("city nearby", 500);
            WORLD.prevStepHadCity = true;
        } else if (!boolcity && WORLD.prevStepHadCity) {
            WORLD.prevStepHadCity = false;
            NOTIF.stop();
        }

        let booledge = worldHas(WORLD.TILES.worldedge);
        if (booledge && !WORLD.prevStepHadEdge) {
            ENGINE.log("the edge of the world rises out of the distant landscape. the sky gets blotted out as you near it.");
            WORLD.prevStepHadEdge = true;
        } else if (!booledge && WORLD.prevStepHadEdge) {
            WORLD.prevStepHadEdge = false;
        }

        let boolproxedge = YOU.checkProximFor(2, WORLD.TILES.worldedge);
        if (boolproxedge && !WORLD.prevStepNextToEdge) {
            ENGINE.log("a massive wall of smooth rock rises into the sky. this does not seem like any natural formation of rock; it juts straight out of the ground at a right angle, and bends up and over your head for many kilometers. if there is a way past this, you clearly are not wanted to go there.");
            WORLD.prevStepNextToEdge = true;
        } else if (!boolproxedge && WORLD.prevStepNextToEdge) {
            WORLD.prevStepNextToEdge = false;
        }

        let boolocean = YOU.checkProximFor(1, WORLD.TILES.water);
        if (boolocean && !WORLD.prevStepNextToOcean) {
            ENGINE.log("the calm ocean laps onto the sand at your feet. from this close the acidic moisture hanging over the water can burn your face; this water is not safe for drinking, much less for swimming. clearly, there is no life left here either.");
            WORLD.prevStepNextToOcean = true;
        } else if (!boolocean && WORLD.prevStepNextToOcean) {
            WORLD.prevStepNextToOcean = false;
        }
    },
    returnTileDesc: function (el) {
        switch (el.innerHTML) {
            case WORLD.TILES.sand: {
                return "sandy plains mixed with ash, forming a dull brown mixture that your feet sink slightly into with every step.";
            }
            case WORLD.TILES.grass: {
                return "grass, or some more durable form of the original plant, breaks the surface of the layer of ash to introduce some small color to the world.";
            }
            case WORLD.TILES.tree: {
                return "a family of trees, mostly dead, but some still hanging onto life. perhaps there's water for them deep underground.";
            }
            case WORLD.TILES.water: {
                return "ocean, tainted by the damaged atmosphere to become permanently acidic.";
            }
            case WORLD.TILES.swamp: {
                return "muddy swamps, full of old branches and dead plants. steam fills the air from constant bubbles.";
            }
            case WORLD.TILES.mountain: {
                return "tall mountains, some whose peaks even break through the ash blanketing the world.";
            }
            case WORLD.TILES.forest: {
                return "strong gray trees, reaching into the sky and blocking out what little light is left. their tall and tangled roots make travel slow and difficult.";
            }
            case WORLD.TILES.house: {
                return "an old structure, probably used for residence, or perhaps even small business.";
            }
            case WORLD.TILES.city: {
                return "a city, arid and empty, pierces the clouds of ash with its highest towers.";
            }
            case WORLD.TILES.monument: {
                return "a massive monument, an imposing figure on the surrounding landscape, made of some kind of deep purple material. it reaches high enough to poke through the floating ash in the sky.";
            }
            case WORLD.TILES.island: {
                return "fresh sand, unlike the filth from back on the shore. perhaps the acidic moisture protected this place from the falling ash.";
            }
            case WORLD.TILES.worldedge: {
                return "a huge wall of rock, smooth and dark, curving inward toward the land you stand upon and reaching higher than you can see.";
            }
            case WORLD.TILES.traveler: {
                if (el.id === YOU.x + "|" + YOU.y) {
                    return "it's you, a traveler.";
                }
                return "a traveler.";
            }
            case WORLD.TILES.startbox: {
                return "some kind of container. it looks new compared to the surrounding landscape.";
            }

            default: {
                return "unsure of this location.";
            }
        }
    }
};

// I like to code as much on my own from scratch as possible, but Perlin noise
// generation was some pretty heavy math that I couldn't figure out myself.
// So, I copied and modified it slightly from the below Github link for 
// this project. Much thanks to Stefan Gustavson, Peter Eastman, 
// and Joseph Gentle for doing the dirty work on Perlin noise, even though 
// they'll probably never see my game. 

// Everything below this point is no longer my own work, and the licensing
// and copyright statements only apply thusly.

// ==============================================

// https://github.com/josephg/noisejs
// Copyright (c) 2013, Joseph Gentle

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
// AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
// LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
// OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
// PERFORMANCE OF THIS SOFTWARE.
!function(n){var t=n.noise={};function e(n,t,e){this.x=n,this.y=t,this.z=e}e.prototype.dot2=function(n,t){return this.x*n+this.y*t};var r=[new e(1,1,0),new e(-1,1,0),new e(1,-1,0),new e(-1,-1,0),new e(1,0,1),new e(-1,0,1),new e(1,0,-1),new e(-1,0,-1),new e(0,1,1),new e(0,-1,1),new e(0,1,-1),new e(0,-1,-1)],o=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],a=new Array(512),w=new Array(512);t.seed=function(n){n>0&&n<1&&(n*=65536),(n=Math.floor(n))<256&&(n|=n<<8);for(var t=0;t<256;t++){var e;e=1&t?o[t]^255&n:o[t]^n>>8&255,a[t]=a[t+256]=e,w[t]=w[t+256]=r[e%12]}},t.seed(WORLD.seed);var i=.5*(Math.sqrt(3)-1),s=(3-Math.sqrt(3))/6;t.simplex2=function(n,t){var e,r,o=(n+t)*i,h=Math.floor(n+o),f=Math.floor(t+o),d=(h+f)*s,u=n-h+d,v=t-f+d;u>v?(e=1,r=0):(e=0,r=1);var c=u-e+s,y=v-r+s,M=u-1+2*s,l=v-1+2*s,p=w[(h&=255)+a[f&=255]],x=w[h+e+a[f+r]],q=w[h+1+a[f+1]],A=.5-u*u-v*v,m=.5-c*c-y*y,z=.5-M*M-l*l;return 70*((A<0?0:(A*=A)*A*p.dot2(u,v))+(m<0?0:(m*=m)*m*x.dot2(c,y))+(z<0?0:(z*=z)*z*q.dot2(M,l)))}}(this);