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
        BootScene
    ]
};
new Phaser.Game(config);