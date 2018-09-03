import { prepareProgressiveImages } from '../../src/buildtime/prepare_progressive_images';
import promptly from 'promptly';
import { FileHelpers } from '../../src/buildtime/helpers/file.helpers';
import { consoleMessage } from '../../src/runtime/helpers/console.helpers';
// @ts-ignore
import * as Jimp from 'jimp';
import * as fs from 'fs';
import { PolyfillHelpers } from '../../src/helpers/polyfill.helpers';

describe('prepareProgressiveImages', () => {
    const IMG_SAMPLES: string[] = [
        '__tests__/buildtime/img-samples/sample-1.jpg',
        '__tests__/buildtime/img-samples/sample-2.jpeg',
        '__tests__/buildtime/img-samples/sample-3.gif',
        '__tests__/buildtime/img-samples/sample-4.png',
        '__tests__/buildtime/img-samples/sample-5.jpg',
    ];

    const GENERATED_IMAGES: string[] = [
        '__tests__/buildtime/img-samples/sample-1-OptimusIMG-progressive.jpg',
        '__tests__/buildtime/img-samples/sample-2-OptimusIMG-progressive.jpeg',
        '__tests__/buildtime/img-samples/sample-4-OptimusIMG-progressive.png',
        '__tests__/buildtime/img-samples/sample-5-OptimusIMG-progressive.jpg',
    ];

    beforeAll(() => {
        console.log = jest.fn();
    });

    afterEach(() => {
        GENERATED_IMAGES.forEach((imagePath: string) => {
            try {
                fs.unlinkSync(imagePath);
            } catch (e) {}
        });
    });

    beforeEach(() => {
        promptly.prompt = jest.fn().mockResolvedValue('__tests__/buildtime/img-samples');
        FileHelpers.findFilesInDir = jest.fn().mockReturnValue(IMG_SAMPLES);
    });

    test('it asks user for images path', async () => {
        await prepareProgressiveImages();
        await expect(promptly.prompt).toBeCalledWith('Path to images folder (defaults to public/images): ',
            {default: 'public/images'});
    });

    test('it notifies user that it started preparing images', async () => {
        console.log = jest.fn();
        await prepareProgressiveImages();
        await expect(console.log).toHaveBeenCalledWith(consoleMessage('started preparing progressive images'));
    });

    test('it notifies user that it finished preparing images', async () => {
        console.log = jest.fn();
        await prepareProgressiveImages();
        await expect(console.log).toHaveBeenCalledWith(consoleMessage('finished preparing progressive images'));
    });

    test('it notifies user for each prepared image', async () => {
        console.log = jest.fn();

        await prepareProgressiveImages();
        await expect(console.log)
            .toHaveBeenCalledWith(consoleMessage('prepared image __tests__/buildtime/img-samples/sample-1-OptimusIMG-progressive.jpg'));
        await expect(console.log)
            .toHaveBeenCalledWith(consoleMessage('prepared image __tests__/buildtime/img-samples/sample-2-OptimusIMG-progressive.jpeg'));
        await expect(console.log)
            .toHaveBeenCalledWith(consoleMessage('prepared image __tests__/buildtime/img-samples/sample-4-OptimusIMG-progressive.png'));
        await expect(console.log)
            .toHaveBeenCalledWith(consoleMessage('prepared image __tests__/buildtime/img-samples/sample-5-OptimusIMG-progressive.jpg'));
    });

    test('it notifies user that it finished preparing images', async () => {
        console.log = jest.fn();
        await prepareProgressiveImages();
        await expect(console.log).toHaveBeenCalledWith(consoleMessage('finished preparing progressive images'));
    });

    describe('Jimp transformation', () => {
        test('dimensions', async () => {
            await prepareProgressiveImages();
            let dimensionsMatch: boolean = true;

            await PolyfillHelpers.asyncForEach(GENERATED_IMAGES, async (imagePath: string): Promise<boolean> => {
                const PROGRESSIVE_IMAGE: Jimp = await Jimp.read(imagePath);
                const ORIGINAL_IMAGE: Jimp = await Jimp.read(imagePath.replace('-OptimusIMG-progressive', ''));
                const EXPECTED_HEIGHT: number = ORIGINAL_IMAGE.bitmap.height * 0.2;
                const EXPECTED_WIDTH: number = ORIGINAL_IMAGE.bitmap.width * 0.2;

                if (PROGRESSIVE_IMAGE.bitmap.height === EXPECTED_HEIGHT && PROGRESSIVE_IMAGE.bitmap.width === EXPECTED_WIDTH) {
                    return true;
                } else {
                    dimensionsMatch = false;
                    return false;
                }
            });

            expect(dimensionsMatch).toBe(true);
        });

        test('it notifies user if it encounters error for specific file', async () => {
            console.error = jest.fn();
            FileHelpers.findFilesInDir = jest.fn().mockReturnValue([
                '__tests__/buildtime/img-samples/sample-1.jpg',
                '__tests__/buildtime/img-samples/text-file-sample.txt',
                '__tests__/buildtime/img-samples/sample-5.jpg',
            ]);

            await prepareProgressiveImages();
            await expect(console.error).toHaveBeenCalledTimes(1);
            await expect(fs.existsSync('__tests__/buildtime/img-samples/sample-1-OptimusIMG-progressive.jpg')).toBe(true);
            await expect(fs.existsSync('__tests__/buildtime/img-samples/sample-5-OptimusIMG-progressive.jpg')).toBe(true);
        });
    });
});
