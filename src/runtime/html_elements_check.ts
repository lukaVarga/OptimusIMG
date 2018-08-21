import { consoleMessage } from './helpers/console';
import { IHtmlElementsCheck } from './interfaces/html_elements_check.interface';

export default class HtmlElementsCheck {
    constructor(configuration?: IHtmlElementsCheck) {
        if (configuration) {
            this._configuration = {...this._configuration, ...configuration};
        }

        this.execute();
    }

    private _configuration: IHtmlElementsCheck = {
        enableConsoleOutput: true,
        className: 'optimusIMG',
    };

    public execute(): void {
        this.checkPictureElementPresence();
    }

    private checkPictureElementPresence(): void {
        const SELECTOR: string = 'img.' + this._configuration.className;
        const IMAGES: NodeListOf<HTMLImageElement> = document.querySelectorAll(SELECTOR) as NodeListOf<HTMLImageElement>;

        if (this._configuration.enableConsoleOutput) {
            IMAGES.forEach((image: HTMLImageElement) => {
                if (image.parentElement && image.parentElement.tagName.toLowerCase() !== 'picture') {
                    this.checkImageSize(image);
                }
            });
        }
    }

    private checkImageSize(image: HTMLImageElement): void {
        const NATURAL_HEIGHT: number = image.naturalHeight;
        const NATURAL_WIDTH: number = image.naturalWidth;

        const HEIGHT: number = image.height;
        const WIDTH: number = image.width;

        const NATURAL_SIZE: number = NATURAL_HEIGHT * NATURAL_WIDTH;
        const SIZE: number = HEIGHT * WIDTH;

        if (SIZE === 0 || NATURAL_SIZE === 0) {
            return;
        }

        const SIZE_PCT: number = (SIZE / NATURAL_SIZE - 1) * 100;

        let warningText: string | null = null;

        if (SIZE_PCT > 30) {
            // Warn user if the image has been expanded much beyond its original size
            warningText = 'the following image has been expanded by ' + SIZE_PCT.toFixed(0) + '%. ';
        } else if (SIZE_PCT < -20) {
            // Warn user if the image is much smaller than its original size
            const PCT: string = Math.abs(SIZE_PCT).toFixed(0) + '%';
            warningText = 'the following image size is ' + PCT  + ' smaller than the original. ';
            warningText += 'You could save up to ' + PCT + ' in load time of this image. ';
        }

        if (warningText) {
            warningText += 'We suggest you provide different resolutions of the image for different screen sizes ' +
                'and utilize the HTML picture element.';
            console.warn(consoleMessage(warningText), image);
        }
    }
}
