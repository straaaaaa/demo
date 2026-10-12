import {
    BootScene,
    DebugScene,
    IntroScene,
    TitleScene,
    MainMenuScene,
    FreeplayScene,
    OptionScene
} from "./scenes.js";

const config = {
    type: Phaser.WEBGL,
    parent: "game",
    width: 1280,
    height: 720,
    backgroundColor: "#000000",
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    pauseOnBlur: false,
    fps: {
        target:60,
        forceSetTimeOut:true
    },
    audio: {
        disableWebAudio: false,
        noAudio:false,
        pauseOnBlur: false
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [
        BootScene,
        DebugScene,
        IntroScene,
        TitleScene,
        MainMenuScene,
        FreeplayScene,
        OptionScene
    ]
};
new Phaser.Game(config);