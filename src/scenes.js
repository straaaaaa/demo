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
        this.updateAble = [];
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
    }

    onCreate() {}

    update(time,delta) {
        this.updateCommon(time,delta);
        this.onUpdate(time,delta);
    }

    updateCommon(time,delta) {
        for (const obj of this.updateAble) {
            obj.update(time,delta);
        }
    }

    onUpdate(time,delta) {};

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
        this.updateAble.push(textObj);
        return textObj;
    }

    startTransition(scene) {
        const transition = this.add.container(0, -1520);

        const gradient = this.add.graphics();

        for (let i = 0; i < 100; i++) {
            const alpha = 1 - (i / 100);
            gradient.fillStyle(0x000000, alpha);
            gradient.fillRect(0, i * 8, 1280, 8);
        }

        const black = this.add.rectangle(
            640,
            -360,
            1280,
            720,
            0x000000
        );

        transition.add([black, gradient]);

        this.tweens.add({
            targets: transition,
            y: 720,
            duration: 800,
            ease: "Linear",
            onComplete: () => {
                this.scene.start(scene);
            }
        });
    }

    enterTransition() {
        const transition = this.add.container(0, -800);

        const gradient = this.add.graphics();

        for (let i = 0; i < 100; i++) {
            const alpha = i / 100;
            gradient.fillStyle(0x000000, alpha);
            gradient.fillRect(0, i * 8, 1280, 8);
        }

        const black = this.add.rectangle(
            640,
            1160,
            1280,
            720,
            0x000000
        );

        transition.add([gradient, black]);

        this.tweens.add({
            targets: transition,
            y: 720,
            duration: 800,
            ease: "Linear",
            onComplete: () => {
                transition.destroy();
            }
        });
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
        this.load.atlas("titleEnter","assets/images/titleEnter.png","assets/data/titleEnter.json");
        this.load.audio("confirmMenu","assets/sounds/confirmMenu.mp3");
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

    onUpdate(time,delta) {
        if (!this.soundManager.bgm) return;
        if (this.inputManager.wasPressed("accept")) {
            this.scene.start("TitleScene");
            return;
        }
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

        this.pressEnter = this.add.sprite(
            100,
            576,
            "titleEnter",
            "ENTER IDLE0000"
        );

        this.pressEnter.setOrigin(0,0);

        this.anims.create({
            key: "titleEnterPressed",
            frames: [
                {
                    key: "titleEnter",
                    frame: "ENTER PRESSED0000"
                },
                {
                    key: "titleEnter",
                    frame: "ENTER PRESSED0001"
                }
            ],
            frameRate: 12,
            repeat: -1
        });

        this.titleTextColors = [
            0x33FFFF,
            0x3333CC
        ];

        this.titleTextAlphas = [
            1,
            0.64
        ];

        const colorStart = Phaser.Display.Color.ValueToColor(this.titleTextColors[0]);
        const colorEnd = Phaser.Display.Color.ValueToColor(this.titleTextColors[1]);

        const alphaStart = this.titleTextAlphas[0];
        const alphaEnd = this.titleTextAlphas[1];

        this.tweens.add({
            targets: { progress: 0 },
            progress: 100,
            duration: 1000,
            loop: -1,
            yoyo: true,
            ease: "Quad.easeInOut",
            onUpdate: (tween, target) => {
                if (this.pressed) return;
                const interpolatedColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                    colorStart,
                    colorEnd,
                    100,
                    target.progress
                );

                const hexColor = Phaser.Display.Color.GetColor(
                    interpolatedColor.r,
                    interpolatedColor.g,
                    interpolatedColor.b
                );
            
                this.pressEnter.setTint(hexColor);

                const currentAlpha = Phaser.Math.Interpolation.Linear([alphaStart, alphaEnd], target.progress / 100);

                this.pressEnter.setAlpha(currentAlpha);
            }
        });

        this.pressed = false;

        this.cameras.main.fadeIn(1000, 255, 255, 255);
    }

    onUpdate(time, delta) {
        if (this.inputManager.wasPressed("accept") && !this.pressed) {
            this.pressEnter.setTint(0xFFFFFF);
            this.pressEnter.setAlpha(1);
            this.pressEnter.play("titleEnterPressed");
            this.soundManager.playSE("confirmMenu");
            this.pressed = true;
            this.time.delayedCall(1000, () => {
                this.startTransition("MainMenuScene");
            });
        }
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

export class MainMenuScene extends FNFScene {
    constructor() {
        super("MainMenuScene");
    }

    preload() {
        this.load.image("menuBG","assets/images/menuBG.png");
        this.load.atlas("menu_freeplay","assets/images/menu_freeplay.png","assets/data/menu_freeplay.json");
        this.load.atlas("menu_options","assets/images/menu_options.png","assets/data/menu_options.json");
        this.load.atlas("menu_online","assets/images/menu_online.png","assets/data/menu_online.json");
    }

    bgColorChange(hue) {
        //ここでのhueは0~200の範囲にする(わかりやすいようにするため)
        this.tweens.add({
            targets: this.fx,
            _hue: hue*1.8,
            duration: 500,
            ease: 'Linear',
            onUpdate: () => {
                this.fx.hue(this.fx._hue);
            }
        });
    }

    onCreate() {
        this.container = this.add.container(640,0);
        this.bg = this.add.image(640,360,"menuBG").setOrigin(0.5,0.5);
        this.freeplay = this.add.sprite(0,160,"menu_freeplay","freeplay idle0000").setOrigin(0.5,0);
        this.freeplay.idleKey = "freeplay_idle";
        this.freeplay.selectedKey = "freeplay_selected";

        this.online = this.add.sprite(0,340,"menu_online","online basic0000").setOrigin(0.5,0);
        this.online.idleKey = "online_idle";
        this.online.selectedKey = "online_selected";

        this.options = this.add.sprite(0,520,"menu_options","options basic0000").setOrigin(0.5,0);
        this.options.idleKey = "options_idle";
        this.options.selectedKey = "options_selected";

        this.createAnimations();

        this.container.add([this.freeplay,this.online,this.options]);

        this.menuSprites = [this.freeplay, this.online, this.options];
        this.menuItems = [
            { name: "freeplay", hue: 160 },
            { name: "online", hue: 110 },
            { name: "options", hue: 140 }
        ];

        this.currentIndex = 0;
        this.isTransitioning = false;

        this.changeSelection(0);

        this.fx = this.bg.postFX.addColorMatrix();
        this.enterTransition();
    }

    createAnimations() {
        this.anims.create({
            key: "freeplay_idle",
            frames: this.anims.generateFrameNames("menu_freeplay",{
                prefix: "freeplay idle",
                start: 0,
                end: 8,
                suffix: "",
                zeroPad: 4
            }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: "freeplay_selected",
            frames: this.anims.generateFrameNames("menu_freeplay",{
                prefix: "freeplay selected",
                start: 0,
                end: 2,
                suffix: "",
                zeroPad: 4
            }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: "online_idle",
            frames: this.anims.generateFrameNames("menu_online",{
                prefix: "online basic",
                start: 0,
                end: 8,
                suffix: "",
                zeroPad: 4
            }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: "online_selected",
            frames: this.anims.generateFrameNames("menu_online",{
                prefix: "online white",
                start: 0,
                end: 2,
                suffix: "",
                zeroPad: 4
            }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: "options_idle",
            frames: this.anims.generateFrameNames("menu_options",{
                prefix: "options basic",
                start: 0,
                end: 8,
                suffix: "",
                zeroPad: 4
            }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: "options_selected",
            frames: this.anims.generateFrameNames("menu_options",{
                prefix: "options white",
                start: 0,
                end: 2,
                suffix: "",
                zeroPad: 4
            }),
            frameRate: 24,
            repeat: -1
        });
    }

    onUpdate(time,delta) {
        if (this.isTransitioning) return;

        if (this.inputManager.wasPressed("up")) {
            this.changeSelection(-1);
        } else if (this.inputManager.wasPressed("down")) {
            this.changeSelection(1);
        }

        if (this.inputManager.wasPressed("accept")) {
            this.selectCurrentItem();
        }
    }

    changeSelection(dir) {
        let nextIndex = this.currentIndex + dir;
        if (nextIndex < 0) nextIndex = this.menuItems.length -1;
        if (nextIndex >= this.menuItems.length) nextIndex = 0;

        this.currentIndex = nextIndex;

        for (let i = 0; i < this.menuSprites.length; i++) {
            const sprite = this.menuSprites[i];
            if (i === this.currentIndex) {
                sprite.anims.play(sprite.selectedKey,true);
            } else {
                sprite.anims.play(sprite.idleKey,true);
            }
        }
    }
}