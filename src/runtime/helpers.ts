export function loadImageInBackground(url: string): Promise<boolean> {
    return new Promise((resolve: (bool: true) => void, reject: (bool: false) => void): void => {
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
            reject(false);
            removeListeners();
        }

        IMAGE.addEventListener('load', handleOnload);
        IMAGE.addEventListener('error', handleOnError);

        IMAGE.src = url;
    });
}
