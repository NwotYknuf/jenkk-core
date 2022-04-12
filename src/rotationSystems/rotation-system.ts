import { Game } from '../game/game';

enum RotationType {
    CCW,
    CW,
    _180
}

abstract class RotationSystem {

    public abstract rotate(game: Game, rotation: RotationType): boolean;

}

export { RotationSystem, RotationType }