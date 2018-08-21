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
        const IMAGES: NodeListOf<Element> = document.querySelectorAll('img.' + this._configuration.className);

        if (this._configuration.enableConsoleOutput) {
            IMAGES.forEach((image: Element) => {
                if (image.parentElement && image.parentElement.tagName.toLowerCase() !== 'picture') {
                    console.warn(consoleMessage('the following image should be wrapped in a picture element'), image);
                }
            });
        }
    }
}
