import { PlayerObject } from "./model.js";
/**
 * An animation which can be played on a {@link PlayerObject}.
 *
 * This is an abstract class. Subclasses of this class would implement
 * particular animations.
 */
export declare abstract class PlayerAnimation {
    /**
     * The speed of the animation.
     *
     * @defaultValue `1.0`
     */
    speed: number;
    /**
     * Whether the animation is paused.
     *
     * @defaultValue `false`
     */
    paused: boolean;
    /**
     * The current progress of the animation.
     */
    progress: number;
    /**
     * Plays the animation.
     *
     * @param player - the player object
     * @param delta - progress difference since last call
     */
    protected abstract animate(player: PlayerObject, delta: number): void;
    /**
     * Plays the animation, and update the progress.
     *
     * The elapsed time `deltaTime` will be scaled by {@link speed}.
     * If {@link paused} is `true`, this method will do nothing.
     *
     * @param player - the player object
     * @param deltaTime - time elapsed since last call
     */
    update(player: PlayerObject, deltaTime: number): void;
}
/**
 * A class that helps you create an animation from a function.
 *
 * @example
 * To create an animation that rotates the player:
 * ```
 * new FunctionAnimation((player, progress) => player.rotation.y = progress)
 * ```
 */
export declare class FunctionAnimation extends PlayerAnimation {
    fn: (player: PlayerObject, progress: number, delta: number) => void;
    constructor(fn: (player: PlayerObject, progress: number, delta: number) => void);
    protected animate(player: PlayerObject, delta: number): void;
}
export declare class IdleAnimation extends PlayerAnimation {
    protected animate(player: PlayerObject): void;
}
export declare class WalkingAnimation extends PlayerAnimation {
    /**
     * Whether to shake head when walking.
     *
     * @defaultValue `true`
     */
    headBobbing: boolean;
    protected animate(player: PlayerObject): void;
}
export declare class RunningAnimation extends PlayerAnimation {
    protected animate(player: PlayerObject): void;
}
export declare class FlyingAnimation extends PlayerAnimation {
    protected animate(player: PlayerObject): void;
}
