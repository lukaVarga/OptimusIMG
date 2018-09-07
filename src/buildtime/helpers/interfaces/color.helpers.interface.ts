export interface IColorRGB {
    r: number;
    g: number;
    b: number;
}

export interface IColorRGBA extends IColorRGB {
    a: number;
}

export interface IColorXYZ {
    x: number;
    y: number;
    z: number;
}

export interface IColorLab {
    L: number;
    a: number;
    b: number;
}

export type TColorDifferences = 'difference-not-perceptible' | 'difference-hardly-perceptible' | 'difference-perceptible'
    | 'colors-more-similar-than-opposite' | 'colors-more-opposite-than-similar' | 'colors-exact-opposite' | 'difference-out-of-bounds';
