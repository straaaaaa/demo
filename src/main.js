import {
    BootScene,
    DebugScene,
    IntroScene,
    TitleScene
} from "./scenes.js";

const config = {
    type: Phaser.WEBGL,
    width: 1280,
    height: 720,
    backgroundColor: "#000000",

    render: {
        antialias: true,
        antialiasGL: true,
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
        IntroScene,
        TitleScene
    ]
};
new Phaser.Game(config);