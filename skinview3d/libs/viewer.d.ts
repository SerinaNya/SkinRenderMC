import { ModelType, RemoteImage, TextureSource } from "skinview-utils";
import { Color, ColorRepresentation, PointLight, Group, PerspectiveCamera, Scene, Texture, WebGLRenderer, AmbientLight, Mapping } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { PlayerAnimation } from "./animation.js";
import { BackEquipment, PlayerObject } from "./model.js";
import { NameTagObject } from "./nametag.js";
export interface LoadOptions {
    /**
     * Whether to make the object visible after the texture is loaded.
     *
     * @defaultValue `true`
     */
    makeVisible?: boolean;
}
export interface SkinLoadOptions extends LoadOptions {
    /**
     * The model of the player (`"default"` for normal arms, and `"slim"` for slim arms).
     *
     * When set to `"auto-detect"`, the model will be inferred from the skin texture.
     *
     * @defaultValue `"auto-detect"`
     */
    model?: ModelType | "auto-detect";
    /**
     * Whether to display the ears drawn on the skin texture.
     *
     * - `true` - Display the ears drawn on the skin texture.
     * - `"load-only"` - Loads the ear texture, but do not make them visible.
     *   You can make them visible later by setting `PlayerObject.ears.visible` to `true`.
     * - `false` - Do not load or show the ears.
     *
     * @defaultValue `false`
     */
    ears?: boolean | "load-only";
}
export interface CapeLoadOptions extends LoadOptions {
    /**
     * The equipment (`"cape"` or `"elytra"`) to show when the cape texture is loaded.
     *
     * If `makeVisible` is set to false, this option will have no effect.
     *
     * @defaultValue `"cape"`
     */
    backEquipment?: BackEquipment;
}
export interface EarsLoadOptions extends LoadOptions {
    /**
     * The type of the provided ear texture.
     *
     * - `"standalone"` means the provided texture is a 14x7 image that only contains the ears.
     * - `"skin"` means the provided texture is a skin texture with ears, and we will use its ear part.
     *
     * @defaultValue `"standalone"`
     */
    textureType?: "standalone" | "skin";
}
export interface SkinViewerOptions {
    /**
     * The canvas where the renderer draws its output.
     *
     * @defaultValue If unspecified, a new canvas element will be created.
     */
    canvas?: HTMLCanvasElement;
    /**
     * The CSS width of the canvas.
     */
    width?: number;
    /**
     * The CSS height of the canvas.
     */
    height?: number;
    /**
     * The pixel ratio of the canvas.
     *
     * When set to `"match-device"`, the current device pixel ratio will be used,
     * and it will be automatically updated when the device pixel ratio changes.
     *
     * @defaultValue `"match-device"`
     */
    pixelRatio?: number | "match-device";
    /**
     * The skin texture of the player.
     *
     * @defaultValue If unspecified, the skin will be invisible.
     */
    skin?: RemoteImage | TextureSource;
    /**
     * The model of the player (`"default"` for normal arms, and `"slim"` for slim arms).
     *
     * When set to `"auto-detect"`, the model will be inferred from the skin texture.
     *
     * If the `skin` option is not specified, this option will have no effect.
     *
     * @defaultValue `"auto-detect"`
     */
    model?: ModelType | "auto-detect";
    /**
     * The cape texture of the player.
     *
     * @defaultValue If unspecified, the cape will be invisible.
     */
    cape?: RemoteImage | TextureSource;
    /**
     * The ear texture of the player.
     *
     * When set to `"current-skin"`, the ears drawn on the current skin texture (as is specified in the `skin` option) will be shown.
     *
     * To use an individual ear texture, you have to specify the `textureType` and the `source` option.
     * `source` is the texture to use, and `textureType` can be either `"standalone"` or `"skin"`:
     *   - `"standalone"` means the provided texture is a 14x7 image that only contains the ears.
     *   - `"skin"` means the provided texture is a skin texture with ears, and we will show its ear part.
     *
     * @defaultValue If unspecified, the ears will be invisible.
     */
    ears?: "current-skin" | {
        textureType: "standalone" | "skin";
        source: RemoteImage | TextureSource;
    };
    /**
     * Whether to preserve the buffers until manually cleared or overwritten.
     *
     * @defaultValue `false`
     */
    preserveDrawingBuffer?: boolean;
    /**
     * Whether to pause the rendering and animation loop.
     *
     * @defaultValue `false`
     */
    renderPaused?: boolean;
    /**
     * The background of the scene.
     *
     * @defaultValue transparent
     */
    background?: ColorRepresentation | Texture;
    /**
     * The panorama background to use.
     *
     * This option overrides the `background` option.
     */
    panorama?: RemoteImage | TextureSource;
    /**
     * Camera vertical field of view, in degrees.
     *
     * The distance between the player and the camera will be automatically computed from `fov` and `zoom`.
     *
     * @defaultValue `50`
     *
     * @see {@link SkinViewer.adjustCameraDistance}
     */
    fov?: number;
    /**
     * Zoom ratio of the player.
     *
     * This value affects the distance between the object and the camera.
     * When set to `1.0`, the top edge of the player's head coincides with the edge of the canvas.
     *
     * The distance between the player and the camera will be automatically computed from `fov` and `zoom`.
     *
     * @defaultValue `0.9`
     *
     * @see {@link SkinViewer.adjustCameraDistance}
     */
    zoom?: number;
    /**
     * Whether to enable mouse control function.
     *
     * This function is implemented using {@link OrbitControls}.
     * By default, zooming and rotating are enabled, and panning is disabled.
     *
     * @defaultValue `true`
     */
    enableControls?: boolean;
    /**
     * The animation to play on the player.
     *
     * @defaultValue If unspecified, no animation will be played.
     */
    animation?: PlayerAnimation;
    /**
     * The name tag to display above the player.
     *
     * @defaultValue If unspecified, no name tag will be displayed.
     * @see {@link SkinViewer.nameTag}
     */
    nameTag?: NameTagObject | string;
}
/**
 * The SkinViewer renders the player on a canvas.
 */
export declare class SkinViewer {
    /**
     * The canvas where the renderer draws its output.
     */
    readonly canvas: HTMLCanvasElement;
    readonly scene: Scene;
    readonly camera: PerspectiveCamera;
    readonly renderer: WebGLRenderer;
    /**
     * The OrbitControls component which is used to implement the mouse control function.
     *
     * @see {@link https://threejs.org/docs/#examples/en/controls/OrbitControls | OrbitControls - three.js docs}
     */
    readonly controls: OrbitControls;
    /**
     * The player object.
     */
    readonly playerObject: PlayerObject;
    /**
     * A group that wraps the player object.
     * It is used to center the player in the world.
     */
    readonly playerWrapper: Group;
    readonly globalLight: AmbientLight;
    readonly cameraLight: PointLight;
    readonly composer: EffectComposer;
    readonly renderPass: RenderPass;
    readonly fxaaPass: ShaderPass;
    readonly skinCanvas: HTMLCanvasElement;
    readonly capeCanvas: HTMLCanvasElement;
    readonly earsCanvas: HTMLCanvasElement;
    private skinTexture;
    private capeTexture;
    private earsTexture;
    private backgroundTexture;
    private _disposed;
    private _renderPaused;
    private _zoom;
    /**
     * Whether to rotate the player along the y axis.
     *
     * @defaultValue `false`
     */
    autoRotate: boolean;
    /**
     * The angular velocity of the player, in rad/s.
     *
     * @defaultValue `1.0`
     * @see {@link autoRotate}
     */
    autoRotateSpeed: number;
    private _animation;
    private clock;
    private animationID;
    private onContextLost;
    private onContextRestored;
    private _pixelRatio;
    private devicePixelRatioQuery;
    private onDevicePixelRatioChange;
    private _nameTag;
    constructor(options?: SkinViewerOptions);
    private updateComposerSize;
    private recreateSkinTexture;
    private recreateCapeTexture;
    private recreateEarsTexture;
    loadSkin(empty: null): void;
    loadSkin<S extends TextureSource | RemoteImage>(source: S, options?: SkinLoadOptions): S extends TextureSource ? void : Promise<void>;
    resetSkin(): void;
    loadCape(empty: null): void;
    loadCape<S extends TextureSource | RemoteImage>(source: S, options?: CapeLoadOptions): S extends TextureSource ? void : Promise<void>;
    resetCape(): void;
    loadEars(empty: null): void;
    loadEars<S extends TextureSource | RemoteImage>(source: S, options?: EarsLoadOptions): S extends TextureSource ? void : Promise<void>;
    resetEars(): void;
    loadPanorama<S extends TextureSource | RemoteImage>(source: S): S extends TextureSource ? void : Promise<void>;
    loadBackground<S extends TextureSource | RemoteImage>(source: S, mapping?: Mapping): S extends TextureSource ? void : Promise<void>;
    private draw;
    /**
    * Renders the scene to the canvas.
    * This method does not change the animation progress.
    */
    render(): void;
    setSize(width: number, height: number): void;
    dispose(): void;
    get disposed(): boolean;
    /**
     * Whether rendering and animations are paused.
     * Setting this property to true will stop both rendering and animation loops.
     * Setting it back to false will resume them.
     */
    get renderPaused(): boolean;
    set renderPaused(value: boolean);
    get width(): number;
    set width(newWidth: number);
    get height(): number;
    set height(newHeight: number);
    get background(): null | Color | Texture;
    set background(value: null | ColorRepresentation | Texture);
    adjustCameraDistance(): void;
    resetCameraPose(): void;
    get fov(): number;
    set fov(value: number);
    get zoom(): number;
    set zoom(value: number);
    get pixelRatio(): number | "match-device";
    set pixelRatio(newValue: number | "match-device");
    /**
     * The animation that is current playing, or `null` if no animation is playing.
     *
     * Setting this property to a different value will change the current animation.
     * The player's pose and the progress of the new animation will be reset before playing.
     *
     * Setting this property to `null` will stop the current animation and reset the player's pose.
     */
    get animation(): PlayerAnimation | null;
    set animation(animation: PlayerAnimation | null);
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
    get nameTag(): NameTagObject | null;
    set nameTag(newVal: NameTagObject | string | null);
}
