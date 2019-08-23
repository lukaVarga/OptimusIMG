import {consoleMessage} from './helpers/console.helpers';

export interface IOptimusWindowCache {
    optimus__supportsWebp?: boolean;
}

declare const window: IOptimusWindowCache & Window;

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

export async function supportsWebp(): Promise<boolean> {
    // Provide caching mechanism
    if (typeof window.optimus__supportsWebp === 'boolean') {
        return window.optimus__supportsWebp;
    }

    // Base64 representation of a white point image
    const WEBP_BASE64: string = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v3AgAA=';

    return await loadImageInBackground(WEBP_BASE64).then(() => {
        window.optimus__supportsWebp = true;
        return true;
    }, () => {
        window.optimus__supportsWebp = false;
        return false;
    });
}
