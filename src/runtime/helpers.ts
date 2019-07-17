import {consoleMessage} from './helpers/console.helpers';

export function loadImageInBackground(url: string): Promise<boolean | string> {
    return new Promise((resolve: (bool: true) => void, reject: (error: string) => void): void => {
        const IMAGE: HTMLImageElement = new Image();

        function removeListeners(): void {
            IMAGE.removeEventListener('load', handleOnload);
            IMAGE.removeEventListener('error', handleOnError);
        }

        function handleOnload(): void {
            resolve(true);
            removeListeners();
        }

        function handleOnError(): void {
            reject(consoleMessage(`could not load image ${url} in background`));
            removeListeners();
        }

        IMAGE.addEventListener('load', handleOnload);
        IMAGE.addEventListener('error', handleOnError);

        IMAGE.src = url;
    });
}
