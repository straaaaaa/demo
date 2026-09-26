import {SaveManager} from "./storage.js";
import {PhantommuffText} from "./basicObjects.js";

export class BootScene extends Phaser.Scene {
    constructor() {
        super({key: "BootScene"});
    }

    preload() {
        this.load.atlas("phantommuff","assets/font/phantommuff.png","assets/font/phantommuff.json");
    }

    create() {
        const charA = this.add.sprite(640, 360, "phantommuff", "a uppercase instance 10000");
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
            this.scene.start("TitleScene");
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

    createCommon() {}

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

export class TitleScene extends FNFScene {
    constructor() {
        super("TitleScene");
    }

    onCreate() {
        this.input.setDefaultCursor("none");
        this.scene.launch("DebugScene");
        this.drawText(630,360,"De B012,.;:@[]!?_-=^~|''()","bold");
    }
}