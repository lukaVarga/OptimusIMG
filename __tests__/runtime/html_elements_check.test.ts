import { default as HtmlElementsCheck } from '../../src/runtime/html_elements_check';
import { consoleMessage } from '../../src/runtime/helpers/console';
import { IHtmlElementsCheck } from '../../src/runtime/interfaces/html_elements_check.interface';

describe('HtmlElementsCheck', () => {
    describe('default configuration', () => {
        describe('checkPictureElementPresence', () => {
            beforeEach(() => {
                console.warn = jest.fn();
            });

            test('picture element not present', () => {
                document.body.innerHTML =
                    '<div>' +
                    '  <image class="optimusIMG" />' +
                    '</div>';

                const IMAGE = document.querySelector('.optimusIMG');
                const EXPECTED_TEXT = consoleMessage('the following image should be wrapped in a picture element');

                new HtmlElementsCheck();

                expect(console.warn).toBeCalledWith(EXPECTED_TEXT, IMAGE)
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
                console.warn = jest.fn();
            });

            describe('picture element not present', () => {
                test('console output enabled', () => {
                    document.body.innerHTML =
                        '<div>' +
                        '  <image class="customClass" />' +
                        '</div>';

                    const IMAGE = document.querySelector('.customClass');
                    const EXPECTED_TEXT = consoleMessage('the following image should be wrapped in a picture element');

                    new HtmlElementsCheck(CUSTOM_CONFIG);

                    expect(console.warn).toBeCalledWith(EXPECTED_TEXT, IMAGE)
                });

                test('console output disabled', () => {
                    document.body.innerHTML =
                        '<div>' +
                        '  <image class="customClass" />' +
                        '</div>';

                    new HtmlElementsCheck({...CUSTOM_CONFIG, ...{enableConsoleOutput: false}});

                    expect(console.warn).not.toBeCalled()
                });
            });
        });
    })
});
