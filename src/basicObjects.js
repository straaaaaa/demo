export class PhantommuffText extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, type, originX = 0.5, originY = 0.5, scale = 1, distance = 2) {
        super(scene, x, y);
        scene.add.existing(this);
        this.text = text;
        this.type = type;
        this.textScale = scale;
        this.originx = originX;
        this.originy = originY;
        this.distance = distance;
        this.lastX = 0;
        this.depth = 1000;
        this.letters = [];
        this.updateText();
        this.time = 0;
        this.interval = 41.67;
    }

    getCharName(char) {
        const symbolMap = {
            ',': 'comma',
            '.': 'period',
            '\'': 'apostrophe',
            '"': 'quote',
            '/': 'forward slash',
            '\\': 'back slash',
            '*': 'asterisk',
            '?': 'question',
            '!': 'exclamation',
            ':': ':',
            ';': ';',
            '<': '<',
            '>': '>',
            '[': '[',
            ']': ']',
            '^': '^',
            '_': '_',
            '{': '{',
            '}': '}',
            '|': '|',
            '~': '~',
            '+': '+',
            '-': '-'
        };

        return symbolMap[char] || char.toLowerCase();
    }

    getCharType(char) {
        if (!/^[a-zA-Z]$/.test(char)) return "normal";

        if (/^\p{Lu}/u.test(char)) return "uppercase";
        if (/^\p{Ll}/u.test(char)) return "lowercase";

        return "normal";
    }

    updateText() {
        this.currentFrameNum = 0;
        this.removeAll(true);
        this.setScale(this.textScale);
        this.letters.length = 0;

        const alphabetConfig = this.scene.cache.json.get('phantommuff_config') || { characters: {} };

        let distance = 0;
        for (let i = 0; i < this.text.length; i++) {
            const char = this.text[i];
            if (char === " ") {
                distance += this.distance + 30;
                continue;
            }

            let type = this.getCharType(char);
            const isBold = (this.type === "bold");
            if (isBold) {
                type = "bold";
            }

            let jsonOffsetX = 0;
            let jsonOffsetY = 0;
            const lowercaseChar = char.toLowerCase();

            if (alphabetConfig.characters && alphabetConfig.characters[lowercaseChar]) {
                const charData = alphabetConfig.characters[lowercaseChar];
                const offsets = isBold ? charData.bold : charData.normal;
                if (offsets) {
                    jsonOffsetX = offsets[0] || 0;
                    jsonOffsetY = offsets[1] || 0;
                    alert(jsonOffsetY);
                }
            }

            const letter = this.scene.add.image(distance, 0, "phantommuff", `${this.getCharName(char)} ${type} instance 10000`);
            letter.frameString = `${this.getCharName(char)} ${type} instance 1000`;
            letter.setOrigin(0,0);

            const baseAdd = isBold ? 70 : 110;
            
            const finalYOffset = jsonOffsetY + (letter.frame.realHeight - baseAdd);

            letter.y -= finalYOffset;
            letter.x += jsonOffsetX;

            distance += letter.width + this.distance;
            this.add(letter);
            this.letters.push(letter);
        }

        const offsetX = (distance - this.distance) * this.originx;
        for (let i = 0; i < this.letters.length; i++) {
            this.letters[i].x -= offsetX;
        }
        if (this.letters.length > 0) {
            const lastLetter = this.letters.at(-1);
            this.lastX = lastLetter.x + lastLetter.width + this.distance;
        }
    }

    addValue(type,value) {
        switch (type) {
            case "bool":
                const checkbox = this.scene.add.sprite(this.lastX+10,50,"checkboxanim");
                checkbox.xx = checkbox.x;
                checkbox.yy = checkbox.y;
                checkbox.xOffset = 0;
                checkbox.yOffset = 2;
                checkbox.setOrigin(0,0);
                checkbox.setScale(0.6);
                this.add(checkbox);
                this.valueObj = checkbox;
                break;
            case "int":
                this.text = `${this.text} ${value}`;
                this.updateText();
                break;
        }
    }

    update(time,delta) {
        this.time += delta;
        while (this.time >= this.interval) {
            this.currentFrameNum ++;
            if (this.currentFrameNum > 3) this.currentFrameNum = 0;
            this.time -= this.interval;
        }

        for (const letter of this.letters) {
            const frameString = `${letter.frameString}${this.currentFrameNum}`;
            letter.setFrame(frameString);
        }

        if (this.valueObj) {
            const frameName = this.valueObj?.anims?.currentFrame?.textureFrame;
            if (frameName) {
                if (frameName.includes("reverse")) {
                    this.valueObj.Xoffset = 25;
                    this.valueObj.Yoffset = 28;
                }
                else if (frameName.includes("anim0")) {
                    this.valueObj.Xoffset = 34;
                    this.valueObj.Yoffset = 25;
                }
                else if (frameName.includes("finish")) {
                    this.valueObj.Xoffset = 3;
                    this.valueObj.Yoffset = 12;
                }
                else if (frameName.includes("checkbox0000")) {
                    this.valueObj.Xoffset = 0;
                    this.valueObj.Yoffset = 2;
                }
            }

            this.valueObj.x = this.valueObj.xx+this.valueObj.Xoffset;
            this.valueObj.y = this.valueObj.yy+this.valueObj.Yoffset;
        }
    }
}
