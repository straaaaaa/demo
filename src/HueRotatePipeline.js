export class HueRotatePipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            game,
            name: 'HueRotatePipeline',
            frag: `
            #define SHADER_NAME HUE_ROTATE_FS

            precision mediump float;

            uniform sampler2D uMainSampler;
            uniform float uDegrees;
            varying vec2 outTexCoord;

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
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - 3.0);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            void main() {
                vec4 color = texture2D(uMainSampler, outTexCoord);

                if (color.a == 0.0) {
                    gl_FragColor = color;
                    return;
                }

                vec3 rgb = color.rgb / color.a;
                vec3 hsv = rgb2hsv(rgb);

                hsv.x = fract(hsv.x + uDegrees / 360.0);

                vec3 finalRgb = hsv2rgb(hsv) * color.a;

                gl_FragColor = vec4(finalRgb, color.a);
            }
            `
        });
        this.degrees = 0;
    }

    onPreRender() {
        this.set1f('uDegrees', this.degrees);
    }
}