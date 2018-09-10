import * as fs from 'fs';
import * as path from 'path';
import { Stats } from 'fs';
import { consoleMessage } from '../../runtime/helpers/console.helpers';
import { IImageCompressionLevel } from './interfaces/file.helpers.interface';
// @ts-ignore
import * as Jimp from 'jimp';

export class FileHelpers {
    public static IMAGE_REGEX: RegExp = /(\.jpeg)|(\.jpg)|(\.png)$/;

    public static findFilesInDir(startPath: string, filter: RegExp): string[] {
        let results: string[] = [];
        let files: string[] = [];

        try {
            files = fs.readdirSync(startPath);
        } catch (err) {
            console.warn(consoleMessage('folder not found: ' + startPath));
            return [];
        }

        files.forEach((file: string) => {
            const FILENAME: string = path.join(startPath, file);
            const STAT: Stats = fs.lstatSync(FILENAME);

            if (STAT.isDirectory()) {
                results = results.concat(FileHelpers.findFilesInDir(FILENAME, filter));
            } else if (filter.test(FILENAME)) {
                results.push(FILENAME);
            }
        });

        return results;
    }

    public static async imageCompressionLevel(imagePath: string): Promise<IImageCompressionLevel> {
        try {
            const FILE: Stats = fs.statSync(imagePath);
            // Image files should never be over 1.5MB
            if (FILE.size > 1500000) {
                return 'low-compression';
            }

            const IMAGE_FILE: Jimp = await Jimp.read(imagePath);
            const BYTES_PER_PIXEL: number = FILE.size / (IMAGE_FILE.bitmap.width * IMAGE_FILE.bitmap.height);

            if (BYTES_PER_PIXEL < .5) {
                return 'high-compression';
            } else if (BYTES_PER_PIXEL < 1.7) {
                return 'medium-compression';
            } else if (FILE.size > 50000) {
                return 'low-compression';
            } else {
                return undefined;
            }

        } catch (err) {
            console.warn(consoleMessage('image not found: ' + imagePath));
            return undefined;
        }
    }
}
