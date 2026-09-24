alert("main.jsStart");
import {
    BootScene,
    DebugScene,
    FNFScene,
    TitleScene
} from "./scenes.js";

const config = {
    type: Phaser.WEBGL,
    width: 1280,
    height: 720,
    parent: "game",
    backgroundColor: "#000000",

    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false,
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [
        BootScene,
        DebugScene,
        FNFScene
    ]
};
alert("main.jsEnd")
try {
    new Phaser.Game(config);
    alert("game created");
} catch (error) {
    alert(error.stack || error);
}