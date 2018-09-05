import { FileHelpers } from './helpers/file.helpers';
// @ts-ignore
import * as Jimp from 'jimp';
import { consoleMessage } from '../runtime/helpers/console.helpers';
import promptly = require('promptly');
import { PolyfillHelpers } from '../helpers/polyfill.helpers';
import { PROGRESSIVE_IMAGE_CONFIG } from '../runtime/progressive_load';

export async function prepareProgressiveImages(): Promise<boolean> {
    const path: string = await promptly.prompt('Path to images folder (defaults to public/images): ', {default: 'public/images'});

    console.log(consoleMessage('started preparing progressive images'));

    const IMAGES: string[] = FileHelpers.findFilesInDir(path, FileHelpers.IMAGE_REGEX);

    const FILTERED_IMAGES: string[] = IMAGES.filter((img: string) => !img.match(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier));

    await PolyfillHelpers.asyncForEach(FILTERED_IMAGES, async (img: string): Promise<boolean> => {
        const IMG_CONSTRUCT: string[] = img.split(FileHelpers.IMAGE_REGEX).filter((val: string | undefined) => val !== undefined && val !== '');

        const IMAGE_NAME: string = IMG_CONSTRUCT[0] + PROGRESSIVE_IMAGE_CONFIG.srcIdentifier + IMG_CONSTRUCT[1];

        if (IMAGES.some((image: string) => image === IMAGE_NAME)) {
            console.log(consoleMessage('skipping image ' + IMG_CONSTRUCT[0] + IMG_CONSTRUCT[1] + ' as it already has a progressive version'));
            return true;
        }

        try {
            const IMAGE: Jimp = await Jimp.read(img);
            await IMAGE.scale(0.2).blur(8).write(IMAGE_NAME);

            console.log(consoleMessage('prepared image ' + IMAGE_NAME));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    });

    console.log(consoleMessage('finished preparing progressive images'));
    return true;
}
