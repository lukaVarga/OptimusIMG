import { default as HtmlElementsCheck } from '../../src/runtime/html_elements_check';
import { consoleMessage } from '../../src/runtime/helpers/console';
import { IHtmlElementsCheck } from '../../src/runtime/interfaces/html_elements_check.interface';

describe('HtmlElementsCheck', () => {
    describe('default configuration', () => {
        describe('checkPictureElementPresence', () => {
            beforeAll(() => {
                Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', { get: () => 50 });
                Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { get: () => 50 });
            });

            beforeEach(() => {
                console.warn = jest.fn();
            });

            describe('picture element not present', () => {
                beforeEach(() => {
                    document.body.innerHTML =
                        '<div>' +
                        '  <image class="optimusIMG" />' +
                        '</div>';
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

                    const EXPECTED_TEXT = consoleMessage('the following image has been expanded by 300%. ' +
                        'We suggest you provide different resolutions of the image for different screen sizes and utilize the HTML picture element.');

                    new HtmlElementsCheck();

                    expect(console.warn).toBeCalledWith(EXPECTED_TEXT, IMAGE)
                });

                test('image much smaller than original size', () => {
                    const IMAGE: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
                    IMAGE.height = 10;
                    IMAGE.width = 10;

                    const EXPECTED_TEXT = consoleMessage('the following image size is 96% smaller than the original. ' +
                        'You could save up to 96% in load time of this image. ' +
                        'We suggest you provide different resolutions of the image for different screen sizes and utilize the HTML picture element.');

                    new HtmlElementsCheck();

                    expect(console.warn).toBeCalledWith(EXPECTED_TEXT, IMAGE)
                });

                test('image size within acceptable limits of original size', () => {
                    const IMAGE: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
                    IMAGE.height = 55;
                    IMAGE.width = 55;

                    new HtmlElementsCheck();

                    expect(console.warn).not.toBeCalled()
                });
            });

            test('picture element present', () => {
                document.body.innerHTML =
                    '<picture>' +
                    '  <image class="optimusIMG" />' +
                    '</picture>';

                new HtmlElementsCheck();

                expect(console.warn).not.toBeCalled()
            });
        });
    });

    describe('custom configuration', () => {
        const CUSTOM_CONFIG: IHtmlElementsCheck = {
            className: 'customClass'
        };

        describe('checkPictureElementPresence', () => {
            beforeEach(() => {
                document.body.innerHTML =
                    '<div>' +
                    '  <image class="customClass" />' +
                    '</div>';
                document.querySelectorAll = jest.fn(_selector => [document.querySelector('img.customClass')]);
                console.warn = jest.fn();
            });

            describe('picture element not present', () => {
                test('console output enabled', () => {
                    document.body.innerHTML =
                        '<div>' +
                        '  <image class="customClass" />' +
                        '</div>';

                    const IMAGE: HTMLImageElement = document.querySelector('img.customClass') as HTMLImageElement;
                    IMAGE.height = 100;
                    IMAGE.width = 100;

                    new HtmlElementsCheck(CUSTOM_CONFIG);

                    expect(document.querySelectorAll).toBeCalledWith('img.customClass');
                    expect(console.warn).toBeCalled()
                });

                test('console output disabled', () => {
                    new HtmlElementsCheck({...CUSTOM_CONFIG, ...{enableConsoleOutput: false}});

                    expect(console.warn).not.toBeCalled()
                });
            });
        });
    })
});
