import { ModelType } from "skinview-utils";
import { Group, Mesh, Object3D, Texture } from "three";
/**
 * Notice that innerLayer and outerLayer may NOT be the direct children of the Group.
 */
export declare class BodyPart extends Group {
    readonly innerLayer: Object3D;
    readonly outerLayer: Object3D;
    constructor(innerLayer: Object3D, outerLayer: Object3D);
}
export declare class SkinObject extends Group {
    readonly head: BodyPart;
    readonly body: BodyPart;
    readonly rightArm: BodyPart;
    readonly leftArm: BodyPart;
    readonly rightLeg: BodyPart;
    readonly leftLeg: BodyPart;
    private modelListeners;
    private slim;
    private _map;
    private layer1Material;
    private layer1MaterialBiased;
    private layer2Material;
    private layer2MaterialBiased;
    constructor();
    get map(): Texture | null;
    set map(newMap: Texture | null);
    get modelType(): ModelType;
    set modelType(value: ModelType);
    private getBodyParts;
    setInnerLayerVisible(value: boolean): void;
    setOuterLayerVisible(value: boolean): void;
    resetJoints(): void;
}
export declare class CapeObject extends Group {
    readonly cape: Mesh;
    private material;
    constructor();
    get map(): Texture | null;
    set map(newMap: Texture | null);
}
export declare class ElytraObject extends Group {
    readonly leftWing: Group;
    readonly rightWing: Group;
    private material;
    constructor();
    resetJoints(): void;
    /**
     * Mirrors the position & rotation of left wing,
     * and apply them to the right wing.
     */
    updateRightWing(): void;
    get map(): Texture | null;
    set map(newMap: Texture | null);
}
export declare class EarsObject extends Group {
    readonly rightEar: Mesh;
    readonly leftEar: Mesh;
    private material;
    constructor();
    get map(): Texture | null;
    set map(newMap: Texture | null);
}
export declare type BackEquipment = "cape" | "elytra";
export declare class PlayerObject extends Group {
    readonly skin: SkinObject;
    readonly cape: CapeObject;
    readonly elytra: ElytraObject;
    readonly ears: EarsObject;
    constructor();
    get backEquipment(): BackEquipment | null;
    set backEquipment(value: BackEquipment | null);
    resetJoints(): void;
}
