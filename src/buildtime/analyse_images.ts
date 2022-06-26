import { FileHelpers } from './helpers/file.helpers';
// @ts-ignore
import * as Jimp from 'jimp';
import { consoleMessage } from '../runtime/helpers/console.helpers';
import promptly = require('promptly');
import { PolyfillHelpers } from '../helpers/polyfill.helpers';
import { PROGRESSIVE_IMAGE_CONFIG } from '../runtime/progressive_load';
import { IColorRGBA, TColorDifferences } from './helpers/interfaces/color.helpers.interface';
import { ColorHelpers } from './helpers/color.helpers';
import { IImageCompressionLevel } from './helpers/interfaces/file.helpers.interface';

export async function analyseImages(): Promise<boolean> {
    const path: string = await promptly.prompt('Path to images folder (defaults to public/images): ', {default: 'public/images'});

    console.log(consoleMessage('started analysing images, depending on the number of images and image sizes, this might take a while'));

    let images: string[] = FileHelpers.findFilesInDir(path, FileHelpers.IMAGE_REGEX);

    images = images.filter((img: string) => !img.match(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier));

    await PolyfillHelpers.asyncForEach(images, async (img: string): Promise<boolean> => {
        let colors: IColorRGBA[] = [];
        console.log(consoleMessage('analysing image ' + img + ' ...'));

        try {
            const COMPRESSION: IImageCompressionLevel = await FileHelpers.imageCompressionLevel(img);

            if (COMPRESSION === 'low-compression') {
                console.warn(consoleMessage('consider compressing ' + img + ' to achieve a quicker webpage load time ' +
                    '(BIG LOAD TIME EFFECT)'));
                return true;
            } else if (COMPRESSION === 'medium-compression') {
                console.log(consoleMessage('consider further compression of ' + img +
                    ' to achieve a quicker webpage load time (MEDIUM LOAD TIME EFFECT)'));
                return true;
            }

            const IMAGE: Jimp = await Jimp.read(img);
            const COLOR_LIMIT: number = 128;

            try {
                IMAGE.contrast(.6).scan(0, 0, IMAGE.bitmap.width, IMAGE.bitmap.height, (x: number, y: number) => {
                    // @ts-ignore
                    const COLOR: number = IMAGE.getPixelColor(x, y);
                    const COLOR_OBJ: IColorRGBA = Jimp.intToRGBA(COLOR);

                    if (COLOR_OBJ.a === 0) {
                        return;
                    }

                    COLOR_OBJ.a = COLOR_OBJ.a / 255;

                    if (!colors.find((obj: IColorRGBA) => {
                        const DIFF_CATEGORY: TColorDifferences =
                            ColorHelpers.colorDiffCategory(ColorHelpers.colorDiff(obj, COLOR_OBJ, {r: 255, g: 255, b: 255}));
                        return DIFF_CATEGORY === 'difference-not-perceptible' || DIFF_CATEGORY === 'difference-hardly-perceptible';
                    })) {
                        colors = colors.concat([COLOR_OBJ]);
                    }

                    if (colors.length > COLOR_LIMIT) {
                        // Needed because there is no other way to exit from Jimp's scan fn prematurely
                        throw Error('breaking JIMP scan loop');
                    }
                });
            } catch (e: any) {
                if (!e.message.includes('breaking JIMP scan loop')) {
                    throw e;
                }
            }

            if (colors.length > COLOR_LIMIT) {
                console.log(consoleMessage('no action needed for ' + img));
            } else {
                console.warn(consoleMessage('consider converting ' + img +
                    ' icon in SVG format for optimised load and display on different screens'));
            }

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    });

    console.log(consoleMessage('finished analysing images'));
    return true;
}
