const fragmentShader = `
#define SHADER_NAME HUE_SHIFT_FRAG

precision mediump float;

uniform sampler2D uMainSampler;
uniform float uHueShift; 

varying vec2 outTexCoord;
varying vec4 outTint;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec4 textureColor = texture2D(uMainSampler, outTexCoord);

    vec4 color = textureColor * outTint;

    if (color.a > 0.0) {
        vec3 straightRgb = color.rgb / color.a;

        vec3 hsv = rgb2hsv(straightRgb);
        hsv.x += uHueShift / 360.0;
        hsv.x = fract(hsv.x);

        vec3 shiftedRgb = hsv2rgb(hsv);

        gl_FragColor = vec4(shiftedRgb * color.a, color.a);
    } else {
        gl_FragColor = vec4(0.0);
    }
}
`;

export class HueRotatePipeline extends Phaser.Renderer.WebGL.Pipelines.PreFXPipeline {
    constructor(game) {
        super({
            game: game,
            fragShader: fragmentShader,
            name: 'HueRotatePipeline'
        });
        this.hue = 0;
    }

    onBatch(gameObject) {
        const degrees = this.hue || gameObject._hueDegrees || 0;
        
        this.set1f('uHueShift', degrees);
    }
}
