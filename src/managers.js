export class MenuCursor {
    constructor({
        rows = 1,
        cols = 1,
        loop = true
    }) {
        this.rows = rows;
        this.cols = cols;
        this.loop = loop;

        this.row = 0;
        this.col = 0;
    }

    move (dx,dy) {
        let r = this.row + dy;
        let c = this.col + dx;

        if (this.loop) {
            r = (r + this.rows) % this.rows;
            c = (c + this.cols) % this.cols;
        } else {
            r = Phaser.Math.Clamp(r,0,this.rows-1);
            c = Phaser.Math.Clamp(c,0,this.cols-1);
        }

        this.row = r;
        this.col = c;
    }

    get index() {
        return this.row * this.cols + this.col;
    }
}

export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.keyboard = scene.input.keyboard;

        this.keyCache = {};
    }
    getKeys(action) {
        const options = this.scene.registry.get("options");
        const keybind = options.controls;
        const keys = keybind?.[action].value;
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
    isRepeated(action, delay = 500, interval = 100) {
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

    playSE(key,volume=1) {
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