import { consoleMessage } from './helpers/console.helpers';
import { HtmlElementsHelpers } from './helpers/html_elements.helpers';
import { IHtmlElementsCheck } from './interfaces/html_elements_check.interface';
import {
    IImageSourceResponsivenessFault,
    IImageSourceResponsiveness,
} from './helpers/interfaces/html_elements.helpers.interface';

export default class HtmlElementsCheck {
    constructor(configuration?: IHtmlElementsCheck) {
        if (configuration) {
            this._configuration = {...this._configuration, ...configuration};
        }

        this.execute();
    }

    private readonly _configuration: IHtmlElementsCheck = {
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
        const RESPONSIVENESS_PROPERTIES: IImageSourceResponsiveness = HtmlElementsHelpers.imageSourceResponsiveness(image);

        if (RESPONSIVENESS_PROPERTIES.valid) {
            return;
        } else if (RESPONSIVENESS_PROPERTIES.faults && RESPONSIVENESS_PROPERTIES.faults
                    .some((attribute: IImageSourceResponsivenessFault) => attribute.fault !== 'missing')) {
            RESPONSIVENESS_PROPERTIES.faults
                .filter((attribute: IImageSourceResponsivenessFault) => attribute.fault !== 'missing')
                .forEach((attribute: IImageSourceResponsivenessFault) => {
                    let text: string = '';

                    switch (attribute.fault) {
                        case 'value_format':
                            let expectedFormat: string;

                            if (attribute.attribute_name === 'srcset') {
                                expectedFormat = 'image-name.format image-size - where image size is eg. 150w, 500w or eg. 1x, 2x, 5x. ';
                                expectedFormat += 'For example: srcset="beautiful-image-150.jpeg 150w, beautiful-image@2x.jpeg 2x"';
                            } else {
                                expectedFormat = '(optional css-media-query) image-size - where image size is eg. 150px, 20em, 20rem, 80vw. ';
                                expectedFormat += 'For example: sizes="(min-width: 300px) 80vw, (min-width: 300px) ' +
                                    'and (max-width: 800px) 20em, 1000px"';
                            }

                            text = 'image ' + attribute.attribute_name + ' attribute has an unexpected value. ' +
                                'Expected value format is ' + expectedFormat;
                            break;
                        case 'one_size_only':
                            text = 'image ' + attribute.attribute_name + ' attribute should target multiple image dimensions ' +
                                'for different screens. ';
                            break;
                    }

                    console.warn(consoleMessage(text), image);
                    return;
                });
        }

        const NATURAL_HEIGHT: number = image.naturalHeight;
        const NATURAL_WIDTH: number = image.naturalWidth;

        const HEIGHT: number = image.height;
        const WIDTH: number = image.width;

        const NATURAL_SIZE: number = NATURAL_HEIGHT * NATURAL_WIDTH;
        const SIZE: number = HEIGHT * WIDTH;

        // It is possible the image is hidden with CSS and thus we cannot determine the proper size
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
