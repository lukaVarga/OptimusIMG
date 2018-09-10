import { analyseImages } from '../../src/buildtime/analyse_images';
import { FileHelpers } from '../../src/buildtime/helpers/file.helpers';
import promptly from 'promptly';
import { consoleMessage } from '../../src/runtime/helpers/console.helpers';
import { ColorHelpers } from '../../src/buildtime/helpers/color.helpers';

describe('analyseImages', () => {
    const IMG_SAMPLES: string[] = [
        '__tests__/buildtime/img-samples/sample-1.jpg',
        '__tests__/buildtime/img-samples/sample-6-OptimusIMG-progressive.jpg',
        '__tests__/buildtime/img-samples/icon-sample-7.png',
    ];

    beforeAll(() => {
        console.log = jest.fn();
        console.warn = jest.fn();
    });

    beforeEach(() => {
        promptly.prompt = jest.fn().mockResolvedValue('__tests__/buildtime/img-samples');
        FileHelpers.findFilesInDir = jest.fn().mockReturnValue([]);
    });

    test('it asks user for images path', async () => {
        await analyseImages();
        await expect(promptly.prompt).toBeCalledWith('Path to images folder (defaults to public/images): ',
            {default: 'public/images'});
    });

    test('it notifies user that it started analysing images', async () => {
        console.log = jest.fn();
        FileHelpers.findFilesInDir = jest.fn().mockReturnValue([]);

        await analyseImages();
        await expect(console.log).toHaveBeenCalledWith(
            consoleMessage('started analysing images, depending on the number of images and image sizes, this might take a while'));
    });

    test('it skips images with a progressive version', async () => {
        console.log = jest.fn();
        FileHelpers.findFilesInDir = jest.fn().mockReturnValue(IMG_SAMPLES);
        await analyseImages();
        await expect(console.log).not
            .toHaveBeenCalledWith(consoleMessage('analysing image __tests__/buildtime/img-samples/sample-6-OptimusIMG-progressive.jpg ...'));
    });

    test('it notifies user that it finished analysing images', async () => {
        console.log = jest.fn();
        await analyseImages();
        await expect(console.log).toHaveBeenCalledWith(consoleMessage('finished analysing images'));
    });

    test('it notifies user to consider converting icons', async () => {
        console.warn = jest.fn();
        FileHelpers.findFilesInDir = jest.fn().mockReturnValue(IMG_SAMPLES);
        await analyseImages();
        await expect(console.warn).toHaveBeenCalledWith(
            consoleMessage('consider converting __tests__/buildtime/img-samples/icon-sample-7.png icon' +
                ' in SVG format for optimised load and display on different screens'));
    });

    test('it notifies user to consider compressing image which hasnt been compressed', async () => {
        console.warn = jest.fn();
        FileHelpers.findFilesInDir = jest.fn().mockReturnValue(['__tests__/buildtime/img-samples/sample-8-uncompressed.jpg']);

        await analyseImages();
        await expect(console.warn).toHaveBeenCalledWith(
            consoleMessage('consider compressing __tests__/buildtime/img-samples/sample-8-uncompressed.jpg' +
                ' to achieve a quicker webpage load time (BIG LOAD TIME EFFECT)'));
    });

    test('it notifies user to consider compressing image with medium compression level', async () => {
        console.log = jest.fn();
        FileHelpers.findFilesInDir = jest.fn().mockReturnValue(['__tests__/buildtime/img-samples/sample-5.jpg']);

        await analyseImages();
        await expect(console.log).toHaveBeenCalledWith(
            consoleMessage('consider further compression of __tests__/buildtime/img-samples/sample-5.jpg' +
                ' to achieve a quicker webpage load time (MEDIUM LOAD TIME EFFECT)'));
    });

    test('it notifies user if it encounters error for specific file', async () => {
        console.error = jest.fn();
        FileHelpers.findFilesInDir = jest.fn().mockReturnValue(IMG_SAMPLES);
        ColorHelpers.colorDiffCategory = jest.fn().mockImplementationOnce(() => { throw new Error('error'); });

        await analyseImages();
        await expect(console.error).toHaveBeenCalledTimes(1);
    });
});
