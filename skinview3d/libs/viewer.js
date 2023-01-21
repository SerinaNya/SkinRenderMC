import { inferModelType, isTextureSource, loadCapeToCanvas, loadEarsToCanvas, loadEarsToCanvasFromSkin, loadImage, loadSkinToCanvas } from "skinview-utils";
import { Color, PointLight, EquirectangularReflectionMapping, Group, NearestFilter, PerspectiveCamera, Scene, Texture, Vector2, WebGLRenderer, AmbientLight, CanvasTexture, WebGLRenderTarget, FloatType, DepthTexture, Clock, Object3D } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { PlayerObject } from "./model.js";
import { NameTagObject } from "./nametag.js";
/**
 * The SkinViewer renders the player on a canvas.
 */
export class SkinViewer {
    constructor(options = {}) {
        this.globalLight = new AmbientLight(0xffffff, 0.4);
        this.cameraLight = new PointLight(0xffffff, 0.6);
        this.skinTexture = null;
        this.capeTexture = null;
        this.earsTexture = null;
        this.backgroundTexture = null;
        this._disposed = false;
        this._renderPaused = false;
        /**
         * Whether to rotate the player along the y axis.
         *
         * @defaultValue `false`
         */
        this.autoRotate = false;
        /**
         * The angular velocity of the player, in rad/s.
         *
         * @defaultValue `1.0`
         * @see {@link autoRotate}
         */
        this.autoRotateSpeed = 1.0;
        this._nameTag = null;
        this.canvas = options.canvas === undefined ? document.createElement("canvas") : options.canvas;
        this.skinCanvas = document.createElement("canvas");
        this.capeCanvas = document.createElement("canvas");
        this.earsCanvas = document.createElement("canvas");
        this.scene = new Scene();
        this.camera = new PerspectiveCamera();
        this.camera.add(this.cameraLight);
        this.scene.add(this.camera);
        this.scene.add(this.globalLight);
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            preserveDrawingBuffer: options.preserveDrawingBuffer === true // default: false
        });
        this.onDevicePixelRatioChange = () => {
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.updateComposerSize();
            if (this._pixelRatio === "match-device") {
                this.devicePixelRatioQuery = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
                this.devicePixelRatioQuery.addEventListener("change", this.onDevicePixelRatioChange, { once: true });
            }
        };
        if (options.pixelRatio === undefined || options.pixelRatio === "match-device") {
            this._pixelRatio = "match-device";
            this.devicePixelRatioQuery = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
            this.devicePixelRatioQuery.addEventListener("change", this.onDevicePixelRatioChange, { once: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
        }
        else {
            this._pixelRatio = options.pixelRatio;
            this.devicePixelRatioQuery = null;
            this.renderer.setPixelRatio(options.pixelRatio);
        }
        this.renderer.setClearColor(0, 0);
        let renderTarget;
        if (this.renderer.capabilities.isWebGL2) {
            // Use float precision depth if possible
            // see https://github.com/bs-community/skinview3d/issues/111
            renderTarget = new WebGLRenderTarget(0, 0, {
                depthTexture: new DepthTexture(0, 0, FloatType)
            });
        }
        this.composer = new EffectComposer(this.renderer, renderTarget);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.fxaaPass = new ShaderPass(FXAAShader);
        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.fxaaPass);
        this.playerObject = new PlayerObject();
        this.playerObject.name = "player";
        this.playerObject.skin.visible = false;
        this.playerObject.cape.visible = false;
        this.playerWrapper = new Group();
        this.playerWrapper.add(this.playerObject);
        this.scene.add(this.playerWrapper);
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enablePan = false; // disable pan by default
        this.controls.minDistance = 10;
        this.controls.maxDistance = 256;
        if (options.enableControls === false) {
            this.controls.enabled = false;
        }
        if (options.skin !== undefined) {
            this.loadSkin(options.skin, {
                model: options.model,
                ears: options.ears === "current-skin"
            });
        }
        if (options.cape !== undefined) {
            this.loadCape(options.cape);
        }
        if (options.ears !== undefined && options.ears !== "current-skin") {
            this.loadEars(options.ears.source, {
                textureType: options.ears.textureType
            });
        }
        if (options.width !== undefined) {
            this.width = options.width;
        }
        if (options.height !== undefined) {
            this.height = options.height;
        }
        if (options.background !== undefined) {
            this.background = options.background;
        }
        if (options.panorama !== undefined) {
            this.loadPanorama(options.panorama);
        }
        if (options.nameTag !== undefined) {
            this.nameTag = options.nameTag;
        }
        this.camera.position.z = 1;
        this._zoom = options.zoom === undefined ? 0.9 : options.zoom;
        this.fov = options.fov === undefined ? 50 : options.fov;
        this._animation = options.animation === undefined ? null : options.animation;
        this.clock = new Clock();
        if (options.renderPaused === true) {
            this._renderPaused = true;
            this.animationID = null;
        }
        else {
            this.animationID = window.requestAnimationFrame(() => this.draw());
        }
        this.onContextLost = (event) => {
            event.preventDefault();
            if (this.animationID !== null) {
                window.cancelAnimationFrame(this.animationID);
                this.animationID = null;
            }
        };
        this.onContextRestored = () => {
            this.renderer.setClearColor(0, 0); // Clear color might be lost
            if (!this._renderPaused && !this._disposed && this.animationID === null) {
                this.animationID = window.requestAnimationFrame(() => this.draw());
            }
        };
        this.canvas.addEventListener("webglcontextlost", this.onContextLost, false);
        this.canvas.addEventListener("webglcontextrestored", this.onContextRestored, false);
    }
    updateComposerSize() {
        this.composer.setSize(this.width, this.height);
        const pixelRatio = this.renderer.getPixelRatio();
        this.composer.setPixelRatio(pixelRatio);
        this.fxaaPass.material.uniforms["resolution"].value.x = 1 / (this.width * pixelRatio);
        this.fxaaPass.material.uniforms["resolution"].value.y = 1 / (this.height * pixelRatio);
    }
    recreateSkinTexture() {
        if (this.skinTexture !== null) {
            this.skinTexture.dispose();
        }
        this.skinTexture = new CanvasTexture(this.skinCanvas);
        this.skinTexture.magFilter = NearestFilter;
        this.skinTexture.minFilter = NearestFilter;
        this.playerObject.skin.map = this.skinTexture;
    }
    recreateCapeTexture() {
        if (this.capeTexture !== null) {
            this.capeTexture.dispose();
        }
        this.capeTexture = new CanvasTexture(this.capeCanvas);
        this.capeTexture.magFilter = NearestFilter;
        this.capeTexture.minFilter = NearestFilter;
        this.playerObject.cape.map = this.capeTexture;
        this.playerObject.elytra.map = this.capeTexture;
    }
    recreateEarsTexture() {
        if (this.earsTexture !== null) {
            this.earsTexture.dispose();
        }
        this.earsTexture = new CanvasTexture(this.earsCanvas);
        this.earsTexture.magFilter = NearestFilter;
        this.earsTexture.minFilter = NearestFilter;
        this.playerObject.ears.map = this.earsTexture;
    }
    loadSkin(source, options = {}) {
        if (source === null) {
            this.resetSkin();
        }
        else if (isTextureSource(source)) {
            loadSkinToCanvas(this.skinCanvas, source);
            this.recreateSkinTexture();
            if (options.model === undefined || options.model === "auto-detect") {
                this.playerObject.skin.modelType = inferModelType(this.skinCanvas);
            }
            else {
                this.playerObject.skin.modelType = options.model;
            }
            if (options.makeVisible !== false) {
                this.playerObject.skin.visible = true;
            }
            if (options.ears === true || options.ears == "load-only") {
                loadEarsToCanvasFromSkin(this.earsCanvas, source);
                this.recreateEarsTexture();
                if (options.ears === true) {
                    this.playerObject.ears.visible = true;
                }
            }
        }
        else {
            return loadImage(source).then(image => this.loadSkin(image, options));
        }
    }
    resetSkin() {
        this.playerObject.skin.visible = false;
        this.playerObject.skin.map = null;
        if (this.skinTexture !== null) {
            this.skinTexture.dispose();
            this.skinTexture = null;
        }
    }
    loadCape(source, options = {}) {
        if (source === null) {
            this.resetCape();
        }
        else if (isTextureSource(source)) {
            loadCapeToCanvas(this.capeCanvas, source);
            this.recreateCapeTexture();
            if (options.makeVisible !== false) {
                this.playerObject.backEquipment = options.backEquipment === undefined ? "cape" : options.backEquipment;
            }
        }
        else {
            return loadImage(source).then(image => this.loadCape(image, options));
        }
    }
    resetCape() {
        this.playerObject.backEquipment = null;
        this.playerObject.cape.map = null;
        this.playerObject.elytra.map = null;
        if (this.capeTexture !== null) {
            this.capeTexture.dispose();
            this.capeTexture = null;
        }
    }
    loadEars(source, options = {}) {
        if (source === null) {
            this.resetEars();
        }
        else if (isTextureSource(source)) {
            if (options.textureType === "skin") {
                loadEarsToCanvasFromSkin(this.earsCanvas, source);
            }
            else {
                loadEarsToCanvas(this.earsCanvas, source);
            }
            this.recreateEarsTexture();
            if (options.makeVisible !== false) {
                this.playerObject.ears.visible = true;
            }
        }
        else {
            return loadImage(source).then(image => this.loadEars(image, options));
        }
    }
    resetEars() {
        this.playerObject.ears.visible = false;
        this.playerObject.ears.map = null;
        if (this.earsTexture !== null) {
            this.earsTexture.dispose();
            this.earsTexture = null;
        }
    }
    loadPanorama(source) {
        return this.loadBackground(source, EquirectangularReflectionMapping);
    }
    loadBackground(source, mapping) {
        if (isTextureSource(source)) {
            if (this.backgroundTexture !== null) {
                this.backgroundTexture.dispose();
            }
            this.backgroundTexture = new Texture();
            this.backgroundTexture.image = source;
            if (mapping !== undefined) {
                this.backgroundTexture.mapping = mapping;
            }
            this.backgroundTexture.needsUpdate = true;
            this.scene.background = this.backgroundTexture;
        }
        else {
            return loadImage(source).then(image => this.loadBackground(image, mapping));
        }
    }
    draw() {
        const dt = this.clock.getDelta();
        if (this._animation !== null) {
            this._animation.update(this.playerObject, dt);
        }
        if (this.autoRotate) {
            this.playerWrapper.rotation.y += dt * this.autoRotateSpeed;
        }
        this.controls.update();
        this.render();
        this.animationID = window.requestAnimationFrame(() => this.draw());
    }
    /**
    * Renders the scene to the canvas.
    * This method does not change the animation progress.
    */
    render() {
        this.composer.render();
    }
    setSize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.updateComposerSize();
    }
    dispose() {
        this._disposed = true;
        this.canvas.removeEventListener("webglcontextlost", this.onContextLost, false);
        this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored, false);
        if (this.devicePixelRatioQuery !== null) {
            this.devicePixelRatioQuery.removeEventListener("change", this.onDevicePixelRatioChange);
            this.devicePixelRatioQuery = null;
        }
        if (this.animationID !== null) {
            window.cancelAnimationFrame(this.animationID);
            this.animationID = null;
        }
        this.controls.dispose();
        this.renderer.dispose();
        this.resetSkin();
        this.resetCape();
        this.resetEars();
        this.background = null;
        this.fxaaPass.fsQuad.dispose();
    }
    get disposed() {
        return this._disposed;
    }
    /**
     * Whether rendering and animations are paused.
     * Setting this property to true will stop both rendering and animation loops.
     * Setting it back to false will resume them.
     */
    get renderPaused() {
        return this._renderPaused;
    }
    set renderPaused(value) {
        this._renderPaused = value;
        if (this._renderPaused && this.animationID !== null) {
            window.cancelAnimationFrame(this.animationID);
            this.animationID = null;
            this.clock.stop();
            this.clock.autoStart = true;
        }
        else if (!this._renderPaused && !this._disposed && !this.renderer.getContext().isContextLost() && this.animationID == null) {
            this.animationID = window.requestAnimationFrame(() => this.draw());
        }
    }
    get width() {
        return this.renderer.getSize(new Vector2()).width;
    }
    set width(newWidth) {
        this.setSize(newWidth, this.height);
    }
    get height() {
        return this.renderer.getSize(new Vector2()).height;
    }
    set height(newHeight) {
        this.setSize(this.width, newHeight);
    }
    get background() {
        return this.scene.background;
    }
    set background(value) {
        if (value === null || value instanceof Color || value instanceof Texture) {
            this.scene.background = value;
        }
        else {
            this.scene.background = new Color(value);
        }
        if (this.backgroundTexture !== null && value !== this.backgroundTexture) {
            this.backgroundTexture.dispose();
            this.backgroundTexture = null;
        }
    }
    adjustCameraDistance() {
        let distance = 4.5 + 16.5 / Math.tan(this.fov / 180 * Math.PI / 2) / this.zoom;
        // limit distance between 10 ~ 256 (default min / max distance of OrbitControls)
        if (distance < 10) {
            distance = 10;
        }
        else if (distance > 256) {
            distance = 256;
        }
        this.camera.position.multiplyScalar(distance / this.camera.position.length());
        this.camera.updateProjectionMatrix();
    }
    resetCameraPose() {
        this.camera.position.set(0, 0, 1);
        this.camera.rotation.set(0, 0, 0);
        this.adjustCameraDistance();
    }
    get fov() {
        return this.camera.fov;
    }
    set fov(value) {
        this.camera.fov = value;
        this.adjustCameraDistance();
    }
    get zoom() {
        return this._zoom;
    }
    set zoom(value) {
        this._zoom = value;
        this.adjustCameraDistance();
    }
    get pixelRatio() {
        return this._pixelRatio;
    }
    set pixelRatio(newValue) {
        if (newValue === "match-device") {
            if (this._pixelRatio !== "match-device") {
                this._pixelRatio = newValue;
                this.onDevicePixelRatioChange();
            }
        }
        else {
            if (this._pixelRatio === "match-device" && this.devicePixelRatioQuery !== null) {
                this.devicePixelRatioQuery.removeEventListener("change", this.onDevicePixelRatioChange);
                this.devicePixelRatioQuery = null;
            }
            this._pixelRatio = newValue;
            this.renderer.setPixelRatio(newValue);
            this.updateComposerSize();
        }
    }
    /**
     * The animation that is current playing, or `null` if no animation is playing.
     *
     * Setting this property to a different value will change the current animation.
     * The player's pose and the progress of the new animation will be reset before playing.
     *
     * Setting this property to `null` will stop the current animation and reset the player's pose.
     */
    get animation() {
        return this._animation;
    }
    set animation(animation) {
        if (this._animation !== animation) {
            this.playerObject.resetJoints();
            this.playerObject.position.set(0, 0, 0);
            this.playerObject.rotation.set(0, 0, 0);
            this.clock.stop();
            this.clock.autoStart = true;
        }
        if (animation !== null) {
            animation.progress = 0;
        }
        this._animation = animation;
    }
    /**
     * The name tag to display above the player, or `null` if there is none.
     *
     * When setting this property to a `string` value, a {@link NameTagObject}
     * will be automatically created with default options.
     *
     * @example
     * ```
     * skinViewer.nameTag = "hello";
     * skinViewer.nameTag = new NameTagObject("hello", { textStyle: "yellow" });
     * skinViewer.nameTag = null;
     * ```
     */
    get nameTag() {
        return this._nameTag;
    }
    set nameTag(newVal) {
        if (this._nameTag !== null) {
            // Remove the old name tag from the scene
            this.playerWrapper.remove(this._nameTag);
        }
        if (newVal !== null) {
            if (!(newVal instanceof Object3D)) {
                newVal = new NameTagObject(newVal);
            }
            // Add the new name tag to the scene
            this.playerWrapper.add(newVal);
            // Set y position
            newVal.position.y = 20;
        }
        this._nameTag = newVal;
    }
}
//# sourceMappingURL=viewer.js.map