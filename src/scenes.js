import {SaveManager} from "./storage.js";
import {PhantommuffText} from "./basicObjects.js";
import { HueRotatePipeline } from './HueRotatePipeline.js';
import {MenuCursor,InputManager,SoundManager} from "./managers.js";

export class BootScene extends Phaser.Scene {
    constructor() {
        super({key: "BootScene"});
    }

    preload() {
        this.load.atlas("phantommuff","assets/font/phantommuff.png","assets/font/phantommuff.json");
        this.load.json("options","assets/data/options.json");
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
                const options = this.cache.json.get("options");
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
        this._currentFollowUpdate = null;
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

    addCameraFollow(obj, distance = { x: 0, y: 0 }, speed = 0.16) {
        const array = Array.isArray(obj) ? obj : [obj];
    
        array.forEach(item => {
            if (item._followTween) {
                this.events.off("update", item._followTween);
                item._followTween = null;
            }
        });
    
        const targetPositions = array.map(item => ({ 
            x: (item.x || 0) + distance.x, 
            y: (item.y || 0) + distance.y 
        }));
    
        const updateCameraFollow = (time, delta) => {
            let allArrived = true;
    
            array.forEach((item, index) => {
                const target = targetPositions[index];
                const actualSpeed = Math.min((delta / 1000) * (speed * 60), 1);
    
                item.x = Phaser.Math.Linear(item.x, target.x, actualSpeed);
                item.y = Phaser.Math.Linear(item.y, target.y, actualSpeed);
    
                const distX = Math.abs(target.x - item.x);
                const distY = Math.abs(target.y - item.y);
                if (distX > 0.1 || distY > 0.1) {
                    allArrived = false;
                }
            });
    
            if (allArrived) {
                this.events.off("update", updateCameraFollow);
                array.forEach((item, index) => {
                    item.x = targetPositions[index].x;
                    item.y = targetPositions[index].y;
                    if (item._followTween === updateCameraFollow) {
                        item._followTween = null;
                    }
                });
            }
        }
    
        array.forEach(item => {
            item._followTween = updateCameraFollow;
        });
    
        this.events.on("update", updateCameraFollow);
    }


    addMenuCursor(texts=[],cols=1,type="v-slice",x=90,y=360,followCamera=true,distance=160) {
        //typeには3つある斜めに並ぶv-slice,垂直に並ぶstatic
        const cursor = new MenuCursor({rows: texts.length,cols:cols});
        cursor.lock = false;
        let yoffset = texts.length+distance/2;
        if (!followCamera) yoffset = 0;
        texts.forEach((text,i) => {
            text.y = i*distance+y-yoffset;
            if (type === "v-slice") {
                text.x = x + (i*20);
            } else {
                text.x = x;
            }
            text.targetY = text.y;
            text.targetX = text.x;
        });
        let firstTime = true;
        const updateCursor = (time, delta) => {
            if (!cursor.lock) {
                let moved = false;
                let direction = 0;
                if (this.inputManager.isRepeated("down")) {
                    cursor.move(0,1);
                    this.soundManager.playSE("scrollMenu");
                    moved = true;
                    direction = 1;
                }
                if (this.inputManager.isRepeated("up")) {
                    cursor.move(0,-1);
                    this.soundManager.playSE("scrollMenu");
                    moved = true;
                    direction = -1;
                }
                if (followCamera && moved || firstTime) {
                    firstTime = false;
                    const nextText = texts[cursor.row];

                    const diffY = y - nextText.y;

                    let diffX = 0;
                    if (type === "v-slice") {
                        diffX = x - nextText.x;
                    }
                    this.addCameraFollow(texts,{x: diffX,y: diffY });
                }
                if (cols !== 1) {
                    if (this.inputManager.isRepeated("right")) {
                        cursor.move(1,0);
                        this.soundManager.playSE("scrollMenu");
                    }
                    if (this.inputManager.isRepeated("left")) {
                        cursor.move(-1,0);
                        this.soundManager.playSE("scrollMenu");
                    }
                }
            }
            if (this.inputManager.wasPressed("accept")) {
                this.events.emit("cursorAccepted",cursor.index);
            }
        }
        this.events.on("update",updateCursor);

        cursor.destroy = () => {
            this.events.off("update",updateCursor);
        }

        return cursor;
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
        const transition = this.add.container(0, -1520).setDepth(2000);

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
        const transition = this.add.container(0, -800).setDepth(2000);

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
        this.load.audio("scrollMenu","assets/sounds/scrollMenu.mp3");
        this.load.audio("cancelMenu","assets/sounds/cancelMenu.mp3");
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
            frameRate: 24,
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
        this.load.image("menuDesat","assets/images/menuDesat.png");
        this.load.atlas("menu_freeplay","assets/images/menu_freeplay.png","assets/data/menu_freeplay.json");
        this.load.atlas("menu_options","assets/images/menu_options.png","assets/data/menu_options.json");
        this.load.atlas("menu_online","assets/images/menu_online.png","assets/data/menu_online.json");
    }

    onCreate() {
        this.container = this.add.container(640,0);
        this.bg = this.add.image(640,360,"menuBG").setOrigin(0.5,0.5);
        this.magenta = this.add.image(640,360,"menuDesat").setOrigin(0.5,0.5);
        this.bg.setDepth(10);
        this.magenta.setTint(0xFFfd719b);
        this.magenta.setScale(1.175);
        this.bg.setScale(1.175);
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

        this.accepted = false;

        this.changeSelection(0);

        this.container.setDepth(200);

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

        if (this.inputManager.isRepeated("up")) {
            this.changeSelection(-1);
        } else if (this.inputManager.isRepeated("down")) {
            this.changeSelection(1);
        }

        if (this.inputManager.isRepeated("accept") && !this.accepted) {
            this.accepted = true;
            this.selectCurrentItem();
        }
    }

    changeSelection(dir) {
        this.soundManager.playSE("scrollMenu");
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

        const currentY = this.container.y + this.menuSprites[this.currentIndex].y;

        if (currentY > 500) {
            this.addCameraFollow([this.bg,this.magenta],{x:0,y:(500-currentY)*0.5},0.08);
        }
        else if (currentY < 200) {
            this.addCameraFollow([this.bg,this.magenta],{x:0,y:(200-currentY)*0.5},0.08);
        }
    }

    selectCurrentItem() {
        const item = this.menuItems[this.currentIndex];

        const targetSprite = this.menuSprites[this.currentIndex];

        let newSceneName = "";
        switch (item.name) {
            case "freeplay":
                newSceneName = "FreeplayScene";
                break;
            case "online":
                newSceneName = "OnlineScene";
                break;
            case "options":
                newSceneName = "OptionScene";
                break;
        }

        this.soundManager.playSE("confirmMenu");

        const blinkDuration = 1000;
        const blinkInterval = 50;
        const bg = this.bg;
        this.bg.visible = false;

        let elapsedTime = 0;
        let lastBlinkTime = 0;
        let i = 0;

        const updateBlink = (time, delta) => {
            elapsedTime += delta;

            if (elapsedTime - lastBlinkTime >= blinkInterval) {
                targetSprite.visible = !targetSprite.visible;
                lastBlinkTime = elapsedTime;

                if (targetSprite.visible === false) {
                    if (i % 2 === 0) {
                        this.bg.visible = !this.bg.visible;
                    }
                    i++;
                }
            }

            if (elapsedTime >= blinkDuration) {
                this.events.off("update", updateBlink);
                targetSprite.visible = true;
                targetSprite._isBlinking = false;
                this.startTransition(newSceneName);
            }
        };

        this.events.on("update", updateBlink);
    }
}

export class FreeplayScene extends FNFScene {
    constructor() {
        super("FreeplayScene");
    }

    onCreate() {
        if (this.texts && this.texts.length > 0) {
            this.texts.forEach(text => { if(text.destroy) text.destroy(); });
        }
        const texts = [
            this.drawText(0,0,"Untold Loneliness","bold",0),
            this.drawText(0,0,"Unknown Suffering","bold",0),
            this.drawText(0,0,"Termination","bold",0),
            this.drawText(0,0,"2hot","bold",0),
            this.drawText(0,0,"Come along with me","bold",0)
        ]
        this.menuCursor = this.addMenuCursor(texts);
        if (this.menuCursor) {
            this.menuCursor.row = 0;
        }
        this.texts = texts;
        this.bg = this.add.image(640,360,"menuDesat").setOrigin(0.5,0.5);
        this.bg.setTint(0xFFea71f);
        this.bg.setScale(1.175);
        this.enterTransition();
    }

    onUpdate(time,delta) {
        if (this.inputManager.wasPressed("back")) {
            if (this.menuCursor) {
                this.menuCursor.destroy();
                this.menuCursor = null;
            }
            this.startTransition("MainMenuScene");
        }

        if (!this.menuCursor || !this.texts) return;

        let i = 0;
        for (const text of this.texts) {

            if (!text) continue; 

            if (this.menuCursor.index === i) {
                if (text.alpha !== 1.0) {
                    text.alpha = 1.0;
                }
            } else {
                if (text.alpha !== 0.6) {
                    text.alpha = 0.6;
                }
            }
            i++
        }
    }
}

export class OptionScene extends FNFScene {
    constructor() {
        super("OptionScene");
    }

    preload() {
        this.load.atlas("checkboxanim","assets/images/checkboxanim.png","assets/data/checkboxanim.json");
    }

    onCreate() {
        const options = Object.keys(this.registry.get("options"));
        const texts = [];
        for (const option of options) {
            const text = this.drawText(0,0,option,"bold");
            texts.push(text);
        }
        this.menuCursor = this.addMenuCursor(texts,1,"static",640,240,false,120);
        this.texts = texts;
        this.bg = this.add.image(640,360,"menuDesat").setOrigin(0.5,0.5);
        this.bg.setTint(0xFFEA71FD);
        this.bg.setScale(1.175);

        this.events.on("cursorAccepted",(index) => {
            this.enter(index);
        });

        this.anims.create({
            key: "check_on",
            frames: this.anims.generateFrameNames("checkboxanim",{
                prefix:"checkbox anim",
                start: 0,
                end:9,
                zeroPad: 4
            }),
            frameRate: 24,
            repeat: 0
        });

        this.anims.create({
            key: "check_off",
            frames: this.anims.generateFrameNames("checkboxanim",{
                prefix: "checkbox anim",
                start: 9,
                end: 0,
                zeroPad: 4
            }),
            frameRate: 24,
            repeat: 0
        });

        this.positionNames = ["main"];

        this.enterTransition();
    }

    onUpdate(time,delta) {
        let i = 0;
        if (this.inputManager.wasPressed("back")) {
            this.back();
        }
        if (this.positionNames.at(-1) === "main") {
            for (const text of this.texts) {
                if (this.menuCursor.index === i) {
                    if (!text.text.startsWith(">")) {
                        text.text = `>${text.text}<`;
                        text.updateText();
                    }
                } else {
                    if (text.text.startsWith(">")) {
                        text.text = text.text.slice(1,-1);
                        text.updateText();
                    }
                }
                i++;
            }
        } else {
        }
    }

    back() {
        switch(this.positionNames.length) {
            case 1:
                if (this.menuCursor) {
                    this.menuCursor.destroy();
                    this.menuCursor = null;
                }
                this.startTransition("MainMenuScene");
                break;
            default:
                const current = this.positionNames.pop();
                this.setItems(this.positionNames.at(-1),current);
        }
    }

    enter(index) {
        switch (this.positionNames.at(-1)) {
            case "main":
                const options = Object.keys(this.registry.get("options"));
                this.positionNames.push(options[index]);
                this.setItems(options[index]);
                break;
        }
    }

    setItems(key,current=null) {
        if (this.texts && this.texts.length > 0) {
            for (const text of this.texts) {
                if (text && text.destroy) {
                    text.destroy();
                }
            }
        }
        this.texts = [];
        this.menuCursor.destroy();
        if (key === "main") {
            const options = Object.keys(this.registry.get("options"));
            for (const option of options) {
                const text = this.drawText(0,0,option,"bold");
                this.texts.push(text);
            }
            this.menuCursor = this.addMenuCursor(this.texts,1,"static",640,240,false,120);
            const index = options.indexOf(current);
            if (index >= 0) {
                this.menuCursor.row = index;
            }
        } else {
            const itemObjects = this.registry.get("options")[key];
            for (const itemKey in itemObjects) {
                const item = itemObjects[itemKey];
                const text = this.drawText(0,0,`${itemKey}`,"normal",0);
                text.addValue(item.type,item.value);
                this.texts.push(text);
            }
            this.menuCursor = this.addMenuCursor(this.texts);
        }
    }

    saveOptions(newOptions) {
        this.registry.set("options",newOptions);
    }
}