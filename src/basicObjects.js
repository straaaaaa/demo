export class PhantommuffText extends Phaser.GameObjects.Container {
    constructor(scene,x,y,text,type,originX = 0.5,originY=0.5,scale = 1,distance = 2) {
        super(scene,x,y);
        scene.add.existing(this);
        this.text = text;
        this.type = type;
        this.textScale = scale;
        this.originx = originX;
        this.originy = originY;
        this.distance = distance;
        this.depth = 1000;
        this.letters = [];
        this.updateText();
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
            '?': 'question',
            '!': 'exclamation',
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
        if (/^\p{Lu}$/u.test(char)) {
            return "uppercase";
        }

        if (/^\p{Ll}$/u.test(char)) {
            return "lowercase";
        }

        return "normal";
    }

    updateText() {
        this.removeAll(true);
        this.setScale(this.textScale)
        this.letters.length = 0;
        let distance = 0;
        for (let i = 0; i < this.text.length; i++) {
            const char = this.text[i];
            if (char === " ") {
                distance += this.distance + 40 * this.textScale;
            }
            let type = this.getCharType(char);
            if (this.type === "bold") {
                type = "bold";
            }
            const letter = this.scene.add.image(distance,0,"phantommuff",`${this.getCharName(char)} ${type} instance 10000`);
            letter.currentFrameNum = 0;
            letter.setOrigin(0,this.originy);
            distance += letter.width + this.distance;
            this.add(letter);
            this.letters.push(letter);
        }
        const offsetX = (distance-this.distance) * this.originx;
        for (let i = 0; i < this.letters.length; i++) {
            this.letters[i].x -= offsetX;
        }
    }
}
