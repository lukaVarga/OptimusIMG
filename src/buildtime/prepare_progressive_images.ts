import { FileHelpers } from './helpers/file.helpers';
// @ts-ignore
import * as Jimp from 'jimp';
import { consoleMessage } from '../runtime/helpers/console.helpers';
import promptly = require('promptly');
import { PolyfillHelpers } from '../helpers/polyfill.helpers';

export async function prepareProgressiveImages(): Promise<boolean> {
    const path: string = await promptly.prompt('Path to images folder (defaults to public/images): ', {default: 'public/images'});

    console.log(consoleMessage('started preparing progressive images'));

    let images: string[] = FileHelpers.findFilesInDir(path, FileHelpers.IMAGE_REGEX);

    images = images.filter((img: string) => !img.match('-OptimusIMG-progressive'));

    await PolyfillHelpers.asyncForEach(images, async (img: string): Promise<boolean> => {
        const IMG_CONSTRUCT: string[] = img.split(FileHelpers.IMAGE_REGEX).filter((val: string | undefined) => val !== undefined && val !== '');

        try {
            const IMAGE: Jimp = await Jimp.read(img);
            const IMAGE_NAME: string = IMG_CONSTRUCT[0] + '-OptimusIMG-progressive' + IMG_CONSTRUCT[1];
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
