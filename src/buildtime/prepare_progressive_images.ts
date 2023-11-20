import { FileHelpers } from './helpers/file.helpers';
// @ts-ignore
import * as Jimp from 'jimp';
import { consoleMessage } from '../runtime/helpers/console.helpers';
import promptly = require('promptly');
import { PolyfillHelpers } from '../helpers/polyfill.helpers';
import { PROGRESSIVE_IMAGE_CONFIG } from '../runtime/progressive_load';
import * as fs from 'fs';
import sharp from 'sharp';

export async function prepareProgressiveImages(): Promise<boolean> {
    const path: string = await promptly.prompt('Path to images folder (defaults to public/images): ', {default: 'public/images'});
    const generateWebP: boolean = (await promptly.prompt('Generate webp (Y/n): ', {default: 'Y'})).toLowerCase() === 'y';
    const generateLowRes: boolean = (await promptly.prompt('Generate low resolution variants (Y/n): ', {default: 'Y'})).toLowerCase() === 'y';

    console.log(consoleMessage('started preparing progressive images'));
    let fileSizeOriginalImg: number = 0;
    let newSize: number = 0;
    let newImages: number = 0;

    const IMAGES: string[] = FileHelpers.findFilesInDir(path, FileHelpers.IMAGE_REGEX);

    const FILTERED_IMAGES: string[] = IMAGES.filter((img: string) => !img.match(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier));

    console.time('execution time');
    await PolyfillHelpers.asyncForEach(FILTERED_IMAGES, async (img: string, index: number): Promise<boolean> => {
        console.log(consoleMessage(`CHECKING: ${index + 1} / ${FILTERED_IMAGES.length}`));

        fileSizeOriginalImg += ((fs.statSync(img).size / 1024) / 1024);

        const IMG_CONSTRUCT: string[] = img.split(FileHelpers.IMAGE_REGEX).filter((val: string | undefined) => val !== undefined && val !== '');

        const IMAGE_NAME: string = IMG_CONSTRUCT[0] + PROGRESSIVE_IMAGE_CONFIG.srcIdentifier + IMG_CONSTRUCT[1];

        try {
            if (generateWebP && img.match(FileHelpers.IMAGE_REGEX)) {
                const WEBP_NAME: string = IMAGE_NAME
                    .replace(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier, '')
                    .replace(FileHelpers.IMAGE_REGEX, '.webp');

                await sharp(img).webp({ quality: 75, effort: 6 }).toFile(WEBP_NAME);
                newSize += ((fs.statSync(WEBP_NAME).size / 1024) / 1024);
                newImages += 1;

                console.log(consoleMessage(`generated webp ${WEBP_NAME}`));
            }

            if (IMAGES.some((image: string) => image === IMAGE_NAME)) {
                console.log(consoleMessage('skipping image ' + IMG_CONSTRUCT[0] + IMG_CONSTRUCT[1] + ' as it already has a progressive version'));
                return true;
            }

            if (generateLowRes) {
                const IMAGE: Jimp = await Jimp.read(img);
                const RESIZED: Jimp = await IMAGE.quality(70).scale(0.2).blur(8).write(IMAGE_NAME);

                console.log(consoleMessage('prepared low res image ' + IMAGE_NAME));

                if (generateWebP && IMAGE_NAME.match(FileHelpers.IMAGE_REGEX)) {
                    const LOW_RES_WEBP_NAME: string = IMAGE_NAME.replace(FileHelpers.IMAGE_REGEX, '.webp');
                    await sharp(img).resize({height: RESIZED.getHeight(), width: RESIZED.getWidth()}).toFile(LOW_RES_WEBP_NAME);

                    console.log(consoleMessage(`generated webp ${LOW_RES_WEBP_NAME}`));
                }
            }

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    });

    console.log(consoleMessage(`generated ${newImages} new webp images`));
    console.log(consoleMessage(`original images total size is ${fileSizeOriginalImg} MB`));
    console.log(consoleMessage(`generated webp images total size is ${newSize} MB`));

    console.log(consoleMessage('finished preparing progressive images'));
    console.timeEnd('execution time');
    return true;
}
