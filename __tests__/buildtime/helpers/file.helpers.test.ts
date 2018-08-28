// @ts-ignore
import fs from 'jest-plugin-fs';
// @ts-ignore
import fsExtra from 'fs-extra';

import { consoleMessage } from '../../../src/runtime/helpers/console.helpers';
import { FileHelpers } from '../../../src/buildtime/helpers/file.helpers';

jest.mock('fs', () => require('jest-plugin-fs/mock'));

describe('FileHelpers', () => {
    beforeEach(() => {
        fs.mock();
        console.warn = jest.fn();
    });

    afterEach(() => fs.restore());

    describe('FileHelpers.findFilesInDir', () => {
        test('it recursively finds all files within a folder that match regex', () => {
           fsExtra.outputFileSync('root/directory/image.png');
           fsExtra.outputFileSync('root/directory/subdirectory/image.jpeg');
           fsExtra.outputFileSync('root/directory/subdirectory/image.png');
           fsExtra.outputFileSync('root/directory/subdirectory/subsubdirectory/image.gif');

           fsExtra.outputFileSync('other-dir/subsubdirectory/image.gif');
           fsExtra.outputFileSync('root/subsubdirectory/text.txt');

           const RESULT: string[] = FileHelpers.findFilesInDir('root', FileHelpers.IMAGE_REGEX);
           const EXPECTED: string[] = ['root/directory/image.png', 'root/directory/subdirectory/image.jpeg',
               'root/directory/subdirectory/image.png'];

           expect(RESULT).toEqual(EXPECTED);
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

    describe('FileHelpers.IMAGE_REGEX', () => {
        test('jpeg image', () => {
            expect(FileHelpers.IMAGE_REGEX.test('foo.jpeg')).toBe(true);
        });

        test('jpg image', () => {
            expect(FileHelpers.IMAGE_REGEX.test('foo.jpg')).toBe(true);
        });

        test('png image', () => {
            expect(FileHelpers.IMAGE_REGEX.test('foo.png')).toBe(true);
        });
    });
});
