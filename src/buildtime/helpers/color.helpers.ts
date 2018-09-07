import { IColorLab, IColorRGB, IColorRGBA, IColorXYZ } from './interfaces/color.helpers.interface';

export class ColorHelpers {
    public static colorDiff(color1: IColorRGBA, color2: IColorRGBA, background: IColorRGB): number {
        const LAB_COLOR1: IColorLab = this.rgba2lab(color1, background);
        const LAB_COLOR2: IColorLab = this.rgba2lab(color2, background);

        return Math.sqrt(Math.pow(LAB_COLOR1.L - LAB_COLOR2.L, 2) +
               Math.pow(LAB_COLOR1.a - LAB_COLOR2.a, 2) +
               Math.pow(LAB_COLOR1.b - LAB_COLOR2.b, 2));
    }

    public static colorDiffCategory(diff: number): string {
        if (diff <= 1.0) {
            return 'difference-not-perceptible';
        } else if (diff < 2) {
            return 'difference-hardly-perceptible';
        } else if (diff < 10) {
            return 'difference-perceptible';
        } else if (diff < 49) {
            return 'colors-more-similar-than-opposite';
        } else if (diff < 100) {
            return 'colors-more-opposite-than-similar';
        } else if (diff === 100) {
            return 'colors-exact-opposite';
        } else {
            return 'difference-out-of-bounds';
        }
    }

    public static rgba2lab(foreground: IColorRGBA, background: IColorRGB): IColorLab {
        return this.xyz2lab(this.rgb2xyz(this.rgba2rgb(background, foreground)));
    }

    public static rgba2rgb(background: IColorRGB, foreground: IColorRGBA): IColorRGB {
        const alphaModifier: number = (1 - foreground.a);

        return {
            r: Math.floor(foreground.a * foreground.r + alphaModifier * background.r),
            g: Math.floor(foreground.a * foreground.g + alphaModifier * background.g),
            b: Math.floor(foreground.a * foreground.b + alphaModifier * background.b),
        };
    }

    // X, Y, Z output under D65/2° standard illuminant
    public static rgb2xyz(color: IColorRGB): IColorXYZ {
        const adjustedR: number = this.adjustChannelForXYZ(color.r);
        const adjustedG: number = this.adjustChannelForXYZ(color.g);
        const adjustedB: number = this.adjustChannelForXYZ(color.b);

        return {
            x: adjustedR * 0.4124564 + adjustedG * 0.3575761 + adjustedB * 0.1804375,
            y: adjustedR * 0.2126729 + adjustedG * 0.7151522 + adjustedB * 0.0721750,
            z: adjustedR * 0.0193339 + adjustedG * 0.1191920 + adjustedB * 0.9503041,
        };
    }

    public static xyz2lab(color: IColorXYZ): IColorLab {
        const adjustedX: number = this.adjustChannelForLab(color.x, 'x');
        const adjustedY: number = this.adjustChannelForLab(color.y, 'y');
        const adjustedZ: number = this.adjustChannelForLab(color.z, 'z');

        const L: number = (116 * adjustedY) - 16;
        const a: number = 500 * (adjustedX - adjustedY);
        const b: number = 200 * (adjustedY - adjustedZ);

        return {L, a, b};
    }

    private static adjustChannelForXYZ(channel: number): number {
        channel = channel / 255;

        return channel > 0.04045 ? Math.pow(((channel + 0.055) / 1.055), 2.4) : channel / 12.92;
    }

    private static adjustChannelForLab(channel: number, channelName: string): number {
        const D65: IColorXYZ = {
            x: 0.95047,
            y: 1.0000001,
            z: 1.08883,
        };

        channel = channel / D65[channelName];

        return channel > 0.008856 ? Math.pow(channel, (1 / 3)) : (((903.3 * channel) + 16) / 116);
    }
}
