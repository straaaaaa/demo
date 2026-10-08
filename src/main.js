import { HueRotatePipeline } from './HueRotatePipeline.js';
import {
    BootScene,
    DebugScene,
    IntroScene,
    TitleScene,
    MainMenuScene,
    OptionScene
} from "./scenes.js";

const config = {
    type: Phaser.WEBGL,
    parent: "game",
    width: 1280,
    height: 720,
    backgroundColor: "#000000",
    pipeline: { HueRotatePipeline },
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
        MainMenuScene,
        OptionScene
    ]
};
new Phaser.Game(config);