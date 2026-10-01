import {SaveManager} from "./storage.js";
import {PhantommuffText} from "./basicObjects.js";
import {InputManager,SoundManager} from "./managers.js";

export class BootScene extends Phaser.Scene {
    constructor() {
        super({key: "BootScene"});
    }

    preload() {
        this.load.atlas("phantommuff","assets/font/phantommuff.png","assets/font/phantommuff.json");
    }

    create() {
        this.input.once("pointerdown",async () => {
            if (this.sound.context.state === "suspended") {
                await this.sound.context.resume();
            }
            const saved = SaveManager.loadOptions();

            if (saved) {
                this.registry.set("options",saved);
            } else {
                const options = {
                    noteColors: {
                        name: "NOTE COLORS",
                        values: [
                            { r: 255, g: 0, b: 0 },
                            { r: 0, g: 255, b: 255 },
                            { r: 0, g: 255, b: 0 },
                            { r: 255, g: 0, b: 255 }
                        ]
                    },
                    controls: {
                        name: "CONTROLS",
                        left: ["A", "ArrowLeft"],
                        down: ["S", "ArrowDown"],
                        up: ["W", "ArrowUp"],
                        right: ["D", "ArrowRight"],
                        accept: ["Space", "Enter"],
                        back: ["Escape","BackSpace"],
                        reset: ["R"]
                    },
                    graphics: {
                        name:"GRAPHICS",
                        fps: 120,
                        disableFpsCounter: false
                    },
                    gameplay: {
                        name: "GAMEPLAY",
                        DownScroll: false,
                        middlescroll: false,
                        opponentNotes: true,
                        ghostTapping: true,
                        ratingOffset: 0,
                    }
                };
                this.registry.set("options",options);
            }
            this.scene.start("IntroScene");
        })
    }
}

export class DebugScene extends Phaser.Scene {
    constructor() {
        super({key: "DebugScene"});
    }

    create() {
        const textStyle = {
            fontFamily: 'Arial',
            fontSize: '18px',
            fill: '#ffffff',
        };
        const fps = this.game.loop.actualFps;
        this.debugText = this.add.text(10, 10,"", textStyle);
    }

    updateDebugText() {
        const fps = this.game.loop.actualFps;

        let memory = "N/A";
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize / 1048576;
            const total = performance.memory.totalJSHeapSize / 1048576;
            memory = `${used.toFixed(1)}MB / ${total.toFixed(1)}MB`;
        }

        this.debugText.setText([
            `FPS: ${fps.toFixed(1)}`,
            `Memory: ${memory}`
        ]);
    }

    update(time,delta) {
        this.updateDebugText();
    }
}

export class FNFScene extends Phaser.Scene {
    constructor(key) {
        super({key: key});
    }

    create() {
        this.createCommon();
        this.onCreate();
    }

    createCommon() {
        this.input.setDefaultCursor("none");
        this.inputManager = new InputManager(this);
        const sound = this.registry.get("soundManager");
        if (sound) {
            sound.scene = this;
            this.soundManager = sound;
        } else {
            this.soundManager = new SoundManager(this);
            this.registry.set("soundManager",this.soundManager);
        }
        if (!this.scene.isActive("DebugScene")) {
            this.scene.launch("DebugScene");
        }
        this.scene.bringToTop("DebugScene");

        this.sys.displayList.on('add', (gameObject) => {
            if ((gameObject.type === 'Sprite' || gameObject.type === 'Image') && gameObject.texture) {
                gameObject.texture.setFilterMode(Phaser.Textures.FilterMode.LINEAR);
            }
        });
    }

    onCreate() {}

    drawText(x,y,text,type,originX,originY,scale,distance) {
        const textObj = new PhantommuffText(
            this,
            x,
            y,
            text,
            type,
            originX,
            originY,
            scale,
            distance
        );
        return textObj;
    }
}

export class IntroScene extends FNFScene {
    constructor() {
        super("IntroScene");
    }
    preload() {
        this.load.audio("freakyMenu","assets/music/freakyMenu.mp3");
        this.load.json("text","assets/data/text.json");
        this.load.image("newgrounds_logo","assets/images/newgrounds_logo.png");
        this.load.atlas("gfDanceTitle","assets/images/gfDanceTitle.png","assets/data/gfDanceTitle.json");
        this.load.atlas("logoBumpin","assets/images/logoBumpin.png","assets/data/logoBumpin.json");
    }

    onCreate() {
        this.soundManager.playBGM("freakyMenu");

        this.textsSprite = [];

        const randomTexts = this.cache.json.get("text");
        const index = Math.floor(Math.random() * randomTexts.splashText.length);
        const randomText = randomTexts.splashText[index];
        this.texts = [
            "The Funkin' Crew Inc.--presents",
            "In association--with--NewGrounds",
            randomText,
            "Friday--Night--Funkin"
        ]
        this.count = 0;
        this.interval = 0.588;
    }

    update(time,delta) {
        if (!this.soundManager.bgm) return;
        const current = this.soundManager.bgm.seek;
        while((this.count) * this.interval < current) {
            if (this.count === 16) {
                this.scene.start("TitleScene");
                return;
            }
            this.displayNextText();
            this.count ++;
        }
    }

    displayNextText() {
        const section = num => ((num) >> 2);
        const sectionIndex = section(this.count);
        if (!this.texts[sectionIndex]) return;
        const texts = this.texts[sectionIndex].split("--");
        let textIndex = (this.count-1) % 4;
        if (textIndex === 3) {
            this.clear();
            return;
        }
        if (texts.length === 2) {
            switch(textIndex) {
                case 1:
                    return;
                case 2:
                    textIndex--;
            }
        }
        const startY = 200;
        const y = startY + (textIndex*60);
        const text = texts[textIndex]
        if (!text) return;
        if (text === "NewGrounds") {
            const logo = this.add.image(640,y+60,"newgrounds_logo");
            logo.setOrigin(0.5,0);
            logo.setScale(0.8);
            this.textsSprite.push(logo);
        }
        
        const textSprite = this.drawText(640,y,text,"bold");
        if (textSprite) {
            this.textsSprite.push(textSprite);
        }
    }

    clear() {
        for (const text of this.textsSprite) {
            text.destroy();
        }
        this.textsSprite = [];
    }
}

export class TitleScene extends FNFScene {
    constructor() {
        super("TitleScene");
    }

    onCreate() {
        if (!this.anims.exists('gfDanceLeft')) {
            const generateGfFrames = (indices) => {
                return indices.map(index => {
                    const frameNumber = String(index).padStart(4, '0');
                    return { key: 'gfDanceTitle', frame: `gfDance${frameNumber}` };
                });
            };

            const leftIndices = [30, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
            const rightIndices = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
            const safeLeftIndices = leftIndices.map(idx => idx > 29 ? 0 : idx);

            this.anims.create({
                key: 'gfDanceLeft',
                frames: generateGfFrames(safeLeftIndices),
                frameRate: 24,
                repeat: 0
            });

            this.anims.create({
                key: 'gfDanceRight',
                frames: generateGfFrames(rightIndices),
                frameRate: 24,
                repeat: 0
            });
        }

        if (!this.anims.exists('logoBump')) {
            this.anims.create({
                key: 'logoBump',
                frames: this.anims.generateFrameNames('logoBumpin', {
                    prefix: 'logo bumpin',
                    start: 0,
                    end: 14,
                    zeroPad: 4
                }),
                frameRate: 24,
                repeat: 0
            });
        }

        this.logo = this.add.sprite(-150, -100, "logoBumpin").setOrigin(0, 0);

        this.logo.play('logoBump');

        this.gf = this.add.sprite(512, 40, "gfDanceTitle").setOrigin(0, 0);
        this.bpm = 102; 
        this.interval = 60 / this.bpm;
        
        const currentBgmTime = this.soundManager.bgm ? this.soundManager.bgm.seek : 0;
        this.count = Math.floor(currentBgmTime / this.interval);

        this.gf.play('gfDanceLeft');

        this.cameras.main.fadeIn(1000, 255, 255, 255);
    }

    update(time, delta) {
        if (!this.soundManager.bgm) return;

        const current = this.soundManager.bgm.seek;

        while ((this.count) * this.interval < current) {
            this.dance();
            this.count++;
        }
    }

    dance() {
        if (!this.gf) return;
        this.logo.play("logoBump");

        if (this.count % 2 === 0) {
            this.gf.play('gfDanceLeft');
        } else {
            this.gf.play('gfDanceRight');
        }
    }
}