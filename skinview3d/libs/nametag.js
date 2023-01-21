import { CanvasTexture, NearestFilter, Sprite, SpriteMaterial } from "three";
/**
 * A Minecraft name tag, i.e. a text label with background.
 */
export class NameTagObject extends Sprite {
    constructor(text = "", options = {}) {
        const material = new SpriteMaterial({
            transparent: true,
            alphaTest: 1e-5
        });
        super(material);
        this.textMaterial = material;
        this.text = text;
        this.font = options.font === undefined ? "48px Minecraft" : options.font;
        this.margin = options.margin === undefined ? [5, 10, 5, 10] : options.margin;
        this.textStyle = options.textStyle === undefined ? "white" : options.textStyle;
        this.backgroundStyle = options.backgroundStyle === undefined ? "rgba(0,0,0,.25)" : options.backgroundStyle;
        this.height = options.height === undefined ? 4.0 : options.height;
        const repaintAfterLoaded = options.repaintAfterLoaded === undefined ? true : options.repaintAfterLoaded;
        if (repaintAfterLoaded && !document.fonts.check(this.font, this.text)) {
            this.paint();
            this.painted = this.loadAndPaint();
        }
        else {
            this.paint();
            this.painted = Promise.resolve();
        }
    }
    async loadAndPaint() {
        await document.fonts.load(this.font, this.text);
        this.paint();
    }
    paint() {
        const canvas = document.createElement("canvas");
        // Measure the text size
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let ctx = canvas.getContext("2d");
        ctx.font = this.font;
        const metrics = ctx.measureText(this.text);
        // Compute canvas size
        canvas.width = this.margin[3] + metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight + this.margin[1];
        canvas.height = this.margin[0] + metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + this.margin[2];
        // After change canvas size, the context needs to be re-created
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ctx = canvas.getContext("2d");
        ctx.font = this.font;
        // Fill background
        ctx.fillStyle = this.backgroundStyle;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw text
        ctx.fillStyle = this.textStyle;
        ctx.fillText(this.text, this.margin[3] + metrics.actualBoundingBoxLeft, this.margin[0] + metrics.actualBoundingBoxAscent);
        // Apply texture
        const texture = new CanvasTexture(canvas);
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        this.textMaterial.map = texture;
        this.textMaterial.needsUpdate = true;
        // Update size
        this.scale.x = canvas.width / canvas.height * this.height;
        this.scale.y = this.height;
    }
}
//# sourceMappingURL=nametag.js.map