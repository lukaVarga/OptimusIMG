import * as fs from 'fs';
import * as path from 'path';
import { Stats } from 'fs';
import { consoleMessage } from '../../runtime/helpers/console.helpers';

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
}
