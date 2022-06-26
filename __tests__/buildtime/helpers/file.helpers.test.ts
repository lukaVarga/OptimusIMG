// @ts-ignore
import fs from 'jest-plugin-fs';
// @ts-ignore
import fsExtra from 'fs-extra';

import { consoleMessage } from '../../../src/runtime/helpers/console.helpers';
import { FileHelpers } from '../../../src/buildtime/helpers/file.helpers';
import { IImageCompressionLevel } from '../../../src/buildtime/helpers/interfaces/file.helpers.interface';

describe('FileHelpers', () => {
    describe('findFilesInDir', () => {
        jest.mock('fs', () => require('jest-plugin-fs/mock'));

        beforeEach(() => {
            fs.mock();
            console.warn = jest.fn();
        });

        afterEach(() => fs.restore());

        test('it recursively finds all files within a folder that match regex', () => {
           fsExtra.outputFileSync('test-root/directory/image.png', '');
           fsExtra.outputFileSync('test-root/directory/subdirectory/image.jpeg', '');
           fsExtra.outputFileSync('test-root/directory/subdirectory/image.png', '');
           fsExtra.outputFileSync('test-root/directory/subdirectory/subsubdirectory/image.gif', '');

           fsExtra.outputFileSync('other-dir/subsubdirectory/image.gif', '');
           fsExtra.outputFileSync('test-root/subsubdirectory/text.txt', '');

           const RESULT: string[] = FileHelpers.findFilesInDir('test-root', FileHelpers.IMAGE_REGEX);
           const EXPECTED: string[] = ['test-root/directory/image.png', 'test-root/directory/subdirectory/image.jpeg',
               'test-root/directory/subdirectory/image.png'];

           expect(RESULT).toEqual(EXPECTED);

           ['test-root', 'other-dir'].forEach((path: string) => {
                try {
                    fsExtra.removeSync(path);
                } catch (e) { console.error(e); }
           });
        });

        test('it doesnt fail if directory does not exist', () => {
            const RESULT: string[] = FileHelpers.findFilesInDir('fake', FileHelpers.IMAGE_REGEX);

            expect(RESULT).toEqual([]);
        });

        test('it warns user if directory does not exist', () => {
            FileHelpers.findFilesInDir('fake', FileHelpers.IMAGE_REGEX);

            expect(console.warn).toBeCalledWith(consoleMessage('folder not found: fake'));
        });
    });

    describe('IMAGE_REGEX', () => {
        test('jpeg image', () => {
            expect(FileHelpers.IMAGE_REGEX.test('foo.jpeg')).toBe(true);
        });

        test('jpg image', () => {
            expect(FileHelpers.IMAGE_REGEX.test('foo.jpg')).toBe(true);
        });

        test('png image', () => {
            expect(FileHelpers.IMAGE_REGEX.test('foo.png')).toBe(true);
        });

        test('gif image', () => {
            expect(FileHelpers.IMAGE_REGEX.test('foo.gif')).toBe(false);
        });
    });

    describe('imageCompressionLevel', () => {
        test('highly-compressed image', async () => {
            const RESULT: IImageCompressionLevel =
                await FileHelpers.imageCompressionLevel('__tests__/buildtime/img-samples/sample-2.jpeg');

            await expect(RESULT).toBe('high-compression');
        });

        test('image with medium compression', async () => {
            const RESULT: IImageCompressionLevel =
                await FileHelpers.imageCompressionLevel('__tests__/buildtime/img-samples/sample-5.jpg');

            await expect(RESULT).toBe('medium-compression');
        });

        test('image with low compression', async () => {
            const RESULT: IImageCompressionLevel =
                await FileHelpers.imageCompressionLevel('__tests__/buildtime/img-samples/sample-9-uncompressed.png');

            await expect(RESULT).toBe('low-compression');
        });

        test('tiny image with low compression', async () => {
            const RESULT: IImageCompressionLevel =
                await FileHelpers.imageCompressionLevel('__tests__/buildtime/img-samples/sample-1.jpg');

            await expect(RESULT).toBe(undefined);
        });

        test('image with too big a size', async () => {
            const RESULT: IImageCompressionLevel =
                await FileHelpers.imageCompressionLevel('__tests__/buildtime/img-samples/sample-8-uncompressed.jpg');

            await expect(RESULT).toBe('low-compression');
        });

        test('user is warned if image cannot be found', async () => {
            console.warn = jest.fn();

            const RESULT: IImageCompressionLevel = await FileHelpers.imageCompressionLevel('fake');

            await expect(console.warn).toHaveBeenCalledWith(consoleMessage('image not found: fake'));
            await expect(RESULT).toBe(undefined);
        });
    });
});
