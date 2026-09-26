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
        if (/^\p{Lu}\$/u.test(char)) {
            return "uppercase";
        }

        if (/^\p{Ll}\$/u.test(char)) {
            return "lowercase";
        }

        return "normal";
    }

    updateText() {
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
                }
            }

            const letter = this.scene.add.image(distance, 0, "phantommuff", `${this.getCharName(char)} ${type} instance 10000`);
            letter.currentFrameNum = 0;
            letter.setOrigin(0, this.originy);

            const baseAdd = isBold ? 70 : 110; 
            
            // 【修正した数式】
            // originY が 0.5 (真ん中基準) の場合、画像の中心からのズレを正確に計算します。
            // これにより、アンダーバーは下へ、クォーテーションは上へカチッと配置されます。
            const finalYOffset = jsonOffsetY + (letter.height * (1 - this.originy)) - (baseAdd * (1 - this.originy));

            // 座標の適用
            letter.y += finalYOffset;
            letter.x += jsonOffsetX;

            distance += letter.width + this.distance;
            this.add(letter);
            this.letters.push(letter);
        }

        const offsetX = (distance - this.distance) * this.originx;
        for (let i = 0; i < this.letters.length; i++) {
            this.letters[i].x -= offsetX;
        }
    }
}
