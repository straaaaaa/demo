import {
    BootScene,
    DebugScene,
    IntroScene,
    TitleScene,
    MainMenuScene
} from "./scenes.js";

const config = {
    type: Phaser.WEBGL,
    parent: "game",
    width: 1280,
    height: 720,
    backgroundColor: "#000000",
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
    roundPixels: false,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [
        BootScene,
        DebugScene,
        IntroScene,
        TitleScene,
        MainMenuScene
    ]
};
new Phaser.Game(config);