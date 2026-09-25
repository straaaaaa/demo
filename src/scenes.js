import {SaveManager} from "./storage.js";
import {PhantommuffText} from "./basicObjects.js";

export class BootScene extends Phaser.Scene {
    constructor() {
        super({key: "BootScene"});
    }

    preload() {
        alert("preload")
        this.xmlLoaded = false;
    this.pngLoaded = false;

    // ファイルごとに読み込み成功を検知する
    this.load.on('filecomplete', (key, type, data) => {
        if (key === 'phantommuff') {
            if (type === 'image') this.pngLoaded = true;
            if (type === 'xml') this.xmlLoaded = true;
        }
    });
        this.load.atlasXML("phantommuff","./assets/font/phantommuff.png","./assets/font/phantommuff.xml");
    }

    create() {
        let debugText = "【デバッグ結果】\n";
    debugText += `PNGの読み込み状態: ${this.pngLoaded ? "⭕成功" : "❌未完了"}\n`;
    debugText += `XMLの読み込み状態: ${this.xmlLoaded ? "⭕成功" : "❌未完了"}\n`;
    debugText += `Phaserへの登録状態: ${this.textures.exists("phantommuff") ? "⭕登録完了" : "❌登録失敗"}\n\n`;

    // 🔴 3. もしXMLが読み込めているのに登録失敗している場合、XMLの中身を画面に出す
    if (this.xmlLoaded && !this.textures.exists("phantommuff")) {
        debugText += "⚠️ XMLの解析エラーの可能性が高いです。\n";
        try {
            // キャッシュから生のXMLテキストを取り出して、最初の300文字を表示
            const xmlCache = this.cache.xml.get("phantommuff");
            if (xmlCache) {
                const serializer = new XMLSerializer();
                const xmlString = serializer.serializeToString(xmlCache);
                debugText += "--- XMLの中身(頭の300文字) ---\n";
                debugText += xmlString.substring(0, 300) + "\n...";
            } else {
                debugText += "XMLのキャッシュ自体が空っぽです。\n";
            }
        } catch(e) {
            debugText += `XML取得エラー: ${e.message}\n`;
        }
    }

    // 画面に黒背景で文字を大きく表示する
    this.add.rectangle(0, 0, 1280, 720, 0x000000).setOrigin(0);
    this.add.text(20, 20, debugText, { fontSize: '20px', fill: '#ffffff', wordWrap: { width: 1200 } });
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
        this.drawText(630,360,"DebugTeXt012,.;:@[]","");
    }
}