export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.keyboard = scene.input.keyboard;

        this.keyCache = {};
    }
    getKeys(action) {
        const options = this.scene.registry.get("keybind");
        const keybind = options.controls
        const keys = keybind?.[action];
        if (!keys) return [];

        return keys.map(code => {
            if (!this.keyCache[code]) {
                this.keyCache[code] = this.keyboard.addKey(code);
            }
            return this.keyCache[code];
        })
    }

    wasPressed(action) {
            return this.getKeys(action)
                .some(key =>Phaser.Input.Keyboard.JustDown(key));
    }

    isDown(action) {
        return this.getKeys(action)
                .some(key =>key.isDown);
    }

    isReleased(action) {
        return this.getKeys(action)
            .some(key => Phaser.Input.Keyboard.JustUp(key));
    }
    isRepeated(action, delay = 300, interval = 60) {
        return this.getKeys(action).some(key => {
            const duration = key.getDuration();

            if (Phaser.Input.Keyboard.JustDown(key)) {
                return true;
            }

            if (key.isDown && duration > delay) {
                return (duration - delay) % interval < 16;
            }

            return false;
        });
    }
}

export class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.bgm = null;
    }

    playBGM(key,volume=1) {
        if (this.bgm) this.bgm.stop();

        this.bgm = this.scene.sound.add(key, { loop: true });
        this.bgm.setVolume(volume);
        this.bgm.play();
    }

    playSE(key,volume) {
        this.scene.sound.play(key, {
            volume: volume
        });
    }

    updateVolume(volume) {
        if (this.bgm) {
            this.bgm.setVolume(volume);
        }
    }

    stopAll() {
        this.scene.sound.stopAll();
        this.bgm = null;
    }
}