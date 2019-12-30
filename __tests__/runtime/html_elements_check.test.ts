import { default as HtmlElementsCheck } from '../../src/runtime/html_elements_check';
import { consoleMessage } from '../../src/runtime/helpers/console.helpers';
import { IHtmlElementsCheck } from '../../src/runtime/interfaces/html_elements_check.interface';
import { HtmlElementsHelpers } from '../../src/runtime/helpers/html_elements.helpers';
import { IImageSourceResponsivenessFault } from '../../src/runtime/helpers/interfaces/html_elements.helpers.interface';
/* tslint:disable no-unused-expression */
describe('HtmlElementsCheck', () => {
    describe('default configuration', () => {
        describe('checkPictureElementPresence', () => {
            beforeAll(() => {
                Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {get: (): number => 50});
                Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {get: (): number => 50});
            });

            beforeEach(() => {
                console.warn = jest.fn();
            });

            describe('picture element not present', () => {
                beforeEach(() => {
                    document.body.innerHTML =
                        '<div>' +
                        '  <img class="optimusIMG" />' +
                        '</div>';
                });

                describe('image does not have valid responsiveness properties', () => {
                    beforeEach(() => {
                        HtmlElementsHelpers.imageSourceResponsiveness = jest.fn().mockReturnValue({valid: false});
                    });

                    test('invalid srcset format', () => {
                        const IMAGE: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
                        const FAULTS: IImageSourceResponsivenessFault = {attribute_name: 'srcset', fault: 'value_format'};
                        HtmlElementsHelpers.imageSourceResponsiveness = jest.fn().mockReturnValue({valid: false, faults: [FAULTS]});

                        const EXPECTED_TEXT: string = consoleMessage('image srcset attribute has an unexpected value. ' +
                            'Expected value format is image-name.format image-size - where image size is eg. 150w, 500w or eg. 1x, 2x, 5x. ' +
                            'For example: srcset="beautiful-image-150.jpeg 150w, beautiful-image@2x.jpeg 2x"');

                        new HtmlElementsCheck();

                        expect(console.warn).toBeCalledWith(EXPECTED_TEXT, IMAGE);
                    });

                    test('invalid sizes format', () => {
                        const IMAGE: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
                        const FAULTS: IImageSourceResponsivenessFault = {attribute_name: 'sizes', fault: 'value_format'};
                        HtmlElementsHelpers.imageSourceResponsiveness = jest.fn().mockReturnValue({valid: false, faults: [FAULTS]});

                        const EXPECTED_TEXT: string = consoleMessage('image sizes attribute has an unexpected value. ' +
                            'Expected value format is (optional css-media-query) image-size - where image size is eg. 150px, 20em, 20rem, 80vw. ' +
                            'For example: sizes="(min-width: 300px) 80vw, (min-width: 300px) and (max-width: 800px) 20em, 1000px"');

                        new HtmlElementsCheck();

                        expect(console.warn).toBeCalledWith(EXPECTED_TEXT, IMAGE);
                    });

                    test('sizes attribute configured for one image version only', () => {
                        const IMAGE: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
                        const FAULTS: IImageSourceResponsivenessFault = {attribute_name: 'sizes', fault: 'one_size_only'};
                        HtmlElementsHelpers.imageSourceResponsiveness = jest.fn().mockReturnValue({valid: false, faults: [FAULTS]});

                        const EXPECTED_TEXT: string = consoleMessage('image sizes attribute should target multiple image dimensions ' +
                            'for different screens. ');

                        new HtmlElementsCheck();

                        expect(console.warn).toBeCalledWith(EXPECTED_TEXT, IMAGE);
                    });

                    test('image dimensions 0', () => {
                        const IMAGE: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
                        IMAGE.height = 0;
                        IMAGE.width = 0;

                        new HtmlElementsCheck();

                        expect(console.warn).not.toBeCalled();
                    });

                    test('image much larger than original size', () => {
                        const IMAGE: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
                        IMAGE.height = 100;
                        IMAGE.width = 100;

                        const EXPECTED_TEXT: string = consoleMessage('the following image has been expanded by 300%. ' +
                            'We suggest you provide different resolutions of the image for different screen sizes and ' +
                            'utilize the HTML picture element.');

                        new HtmlElementsCheck();

                        expect(console.warn).toBeCalledWith(EXPECTED_TEXT, IMAGE);
                    });

                    test('image much smaller than original size', () => {
                        const IMAGE: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
                        IMAGE.height = 10;
                        IMAGE.width = 10;

                        const EXPECTED_TEXT: string = consoleMessage('the following image size is 96% smaller than the original. ' +
                            'You could save up to 96% in load time of this image. ' +
                            'We suggest you provide different resolutions of the image for different screen sizes and ' +
                            'utilize the HTML picture element.');

                        new HtmlElementsCheck();

                        expect(console.warn).toBeCalledWith(EXPECTED_TEXT, IMAGE);
                    });

                    test('image size within acceptable limits of original size', () => {
                        const IMAGE: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
                        IMAGE.height = 55;
                        IMAGE.width = 55;

                        new HtmlElementsCheck();

                        expect(console.warn).not.toBeCalled();
                    });
                });

                describe('image has valid responsive properties', () => {
                    test('image much smaller than original size', () => {
                        HtmlElementsHelpers.imageSourceResponsiveness = jest.fn().mockReturnValue({valid: true});
                        const IMAGE: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
                        IMAGE.height = 10;
                        IMAGE.width = 10;

                        new HtmlElementsCheck();

                        expect(console.warn).not.toBeCalled();
                    });
                });
            });

            test('picture element present', () => {
                document.body.innerHTML =
                    '<picture>' +
                    '  <img class="optimusIMG" />' +
                    '</picture>';

                new HtmlElementsCheck();

                expect(console.warn).not.toBeCalled();
            });
        });
    });

    describe('custom configuration', () => {
        const CUSTOM_CONFIG: IHtmlElementsCheck = {
            className: 'customClass',
        };

        describe('checkPictureElementPresence', () => {
            const cachedQuerySelector: (selectors: any) => NodeListOf<any> = document.querySelectorAll;

            beforeEach(() => {
                document.body.innerHTML =
                    '<div>' +
                    '  <img class="customClass" />' +
                    '</div>';
                document.querySelectorAll = jest.fn((_selector: string) => [document.querySelector('img.customClass')]) as any;
                console.warn = jest.fn();
            });

            afterEach(() => {
                document.querySelectorAll = cachedQuerySelector;
            });

            describe('picture element not present', () => {
                test('console output enabled', () => {
                    HtmlElementsHelpers.imageSourceResponsiveness = jest.fn().mockReturnValue({valid: false});

                    document.body.innerHTML =
                        '<div>' +
                        '  <img class="customClass" />' +
                        '</div>';

                    const IMAGE: HTMLImageElement = document.querySelector('img.customClass') as HTMLImageElement;
                    IMAGE.height = 100;
                    IMAGE.width = 100;

                    new HtmlElementsCheck(CUSTOM_CONFIG);

                    expect(document.querySelectorAll).toBeCalledWith('img.customClass');
                    expect(console.warn).toBeCalled();
                });

                test('console output disabled', () => {
                    new HtmlElementsCheck({...CUSTOM_CONFIG, ...{enableConsoleOutput: false}});

                    expect(console.warn).not.toBeCalled();
                });
            });
        });
    });
});
/* tslint:enable no-unused-expression */
