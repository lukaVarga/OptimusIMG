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
        '__tests__/buildtime/img-samples/sample-4.png',
        '__tests__/buildtime/img-samples/sample-5.jpg',
        '__tests__/buildtime/img-samples/sample-6.jpg',
        '__tests__/buildtime/img-samples/sample-6-OptimusIMG-progressive.jpg',
    ];

    const GENERATED_IMAGES: string[] = [
        '__tests__/buildtime/img-samples/sample-1-OptimusIMG-progressive.jpg',
        '__tests__/buildtime/img-samples/sample-1-OptimusIMG-progressive.webp',
        '__tests__/buildtime/img-samples/sample-1.webp',
        '__tests__/buildtime/img-samples/sample-2-OptimusIMG-progressive.jpeg',
        '__tests__/buildtime/img-samples/sample-2-OptimusIMG-progressive.webp',
        '__tests__/buildtime/img-samples/sample-2.webp',
        '__tests__/buildtime/img-samples/sample-4-OptimusIMG-progressive.png',
        '__tests__/buildtime/img-samples/sample-4-OptimusIMG-progressive.webp',
        '__tests__/buildtime/img-samples/sample-4.webp',
        '__tests__/buildtime/img-samples/sample-5-OptimusIMG-progressive.jpg',
        '__tests__/buildtime/img-samples/sample-5-OptimusIMG-progressive.webp',
        '__tests__/buildtime/img-samples/sample-5.webp',
        '__tests__/buildtime/img-samples/sample-6.webp',
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
        promptly.prompt = jest.fn()
            .mockResolvedValueOnce('__tests__/buildtime/img-samples')
            // @ts-ignore
            .mockResolvedValueOnce('n')
            // @ts-ignore
            .mockResolvedValueOnce('Y');

        FileHelpers.findFilesInDir = jest.fn().mockReturnValue(IMG_SAMPLES);
    });

    test('it asks user for images path', async () => {
        await prepareProgressiveImages();
        expect(promptly.prompt).toBeCalledWith('Path to images folder (defaults to public/images): ',
            {default: 'public/images'});
    });

    test('it asks user if it should generate webp', async () => {
        await prepareProgressiveImages();
        expect(promptly.prompt).toBeCalledWith('Generate webp (Y/n): ',
            {default: 'Y'});
    });

    test('it asks user if it should generate low resolution variants', async () => {
        await prepareProgressiveImages();
        expect(promptly.prompt).toBeCalledWith('Generate low resolution variants (Y/n): ',
            {default: 'Y'});
    });

    test('it notifies user that it started preparing images', async () => {
        console.log = jest.fn();
        await prepareProgressiveImages();
        expect(console.log).toHaveBeenCalledWith(consoleMessage('started preparing progressive images'));
    });

    test('it skips images which already have a progressive version', async () => {
        console.log = jest.fn();
        await prepareProgressiveImages();
        expect(console.log).not
            .toHaveBeenCalledWith(consoleMessage('prepared low res image __tests__/buildtime/img-samples/sample-6-OptimusIMG-progressive.jpg'));

        expect(console.log)
            .toHaveBeenCalledWith(consoleMessage('skipping image __tests__/buildtime/img-samples/sample-6.jpg ' +
                'as it already has a progressive version'));
    });

    test('it notifies user for each prepared image', async () => {
        console.log = jest.fn();

        await prepareProgressiveImages();
        expect(console.log)
            .toHaveBeenCalledWith(consoleMessage('prepared low res image __tests__/buildtime/img-samples/sample-1-OptimusIMG-progressive.jpg'));
        expect(console.log)
            .toHaveBeenCalledWith(consoleMessage('prepared low res image __tests__/buildtime/img-samples/sample-2-OptimusIMG-progressive.jpeg'));
        expect(console.log)
            .toHaveBeenCalledWith(consoleMessage('prepared low res image __tests__/buildtime/img-samples/sample-4-OptimusIMG-progressive.png'));
        expect(console.log)
            .toHaveBeenCalledWith(consoleMessage('prepared low res image __tests__/buildtime/img-samples/sample-5-OptimusIMG-progressive.jpg'));
    });

    test('it notifies user that it finished preparing images', async () => {
        console.log = jest.fn();
        await prepareProgressiveImages();
        expect(console.log).toHaveBeenCalledWith(consoleMessage('finished preparing progressive images'));
    });

    describe('generate webp is true', () => {
        beforeEach(() => {
            promptly.prompt.mockReset();

            promptly.prompt = jest.fn()
                .mockResolvedValueOnce('__tests__/buildtime/img-samples')
                // @ts-ignore
                .mockResolvedValueOnce('Y')
                // @ts-ignore
                .mockResolvedValueOnce('n');

            FileHelpers.findFilesInDir = jest.fn().mockReturnValue(IMG_SAMPLES);
        });

        test('it notifies user for each prepared webp image', async () => {
            console.log = jest.fn();

            await prepareProgressiveImages();
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-1.webp'));
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-2.webp'));
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-4.webp'));
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-5.webp'));
        });
    });

    describe('generate webp and generate low res is true', () => {
        beforeEach(() => {
            promptly.prompt.mockReset();

            promptly.prompt = jest.fn()
                .mockResolvedValueOnce('__tests__/buildtime/img-samples')
                // @ts-ignore
                .mockResolvedValueOnce('Y')
                // @ts-ignore
                .mockResolvedValueOnce('Y');

            FileHelpers.findFilesInDir = jest.fn().mockReturnValue(IMG_SAMPLES);
        });

        test('it notifies user for each prepared webp image', async () => {
            console.log = jest.fn();

            await prepareProgressiveImages();
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-1.webp'));
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-2.webp'));
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-4.webp'));
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-5.webp'));
        });

        test('it notifies user for each prepared low res webp image', async () => {
            console.log = jest.fn();

            await prepareProgressiveImages();
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-1-OptimusIMG-progressive.webp'));
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-2-OptimusIMG-progressive.webp'));
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-4-OptimusIMG-progressive.webp'));
            expect(console.log)
                .toHaveBeenCalledWith(consoleMessage('generated webp __tests__/buildtime/img-samples/sample-5-OptimusIMG-progressive.webp'));
        });
    });

    describe('Jimp transformation', () => {
        test('dimensions', async () => {
            await prepareProgressiveImages();
            let dimensionsMatch: boolean = true;

            await PolyfillHelpers.asyncForEach(GENERATED_IMAGES, async (imagePath: string): Promise<boolean> => {
                if (imagePath.endsWith('.webp')) {
                    return true;
                }

                const PROGRESSIVE_IMAGE: Jimp = await Jimp.read(imagePath);
                const ORIGINAL_IMAGE: Jimp = await Jimp.read(imagePath.replace('-OptimusIMG-progressive', ''));
                const EXPECTED_HEIGHT: number = Math.floor(ORIGINAL_IMAGE.bitmap.height * 0.2);
                const EXPECTED_WIDTH: number = Math.floor(ORIGINAL_IMAGE.bitmap.width * 0.2);

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
            ]);

            await prepareProgressiveImages();
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(fs.existsSync('__tests__/buildtime/img-samples/sample-1-OptimusIMG-progressive.jpg')).toBe(true);
        });
    });
});
