import ProgressiveLoad, { PROGRESSIVE_IMAGE_CONFIG } from '../../src/runtime/progressive_load';
import { HtmlElementsHelpers } from '../../src/runtime/helpers/html_elements.helpers';
import { InjectCSS } from '../../src/runtime/inject_css';

describe('ProgressiveLoad', () => {
    beforeEach(() => {
        document.body.innerHTML =
            '<img id="image-0" src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg" />' +
            '<div class="optimusIMG-progressive-wrapper">' +
            '   <img id="image-1" src="https://www.foo.bar/img1-OptimusIMG-progressive.jpeg" />' +
            '   <img id="image-1" class="optimusIMG-progressive-image" src="https://www.foo.bar/img1.jpeg" />' +
            '</div>' +
            '<img id="image-2" src="https://www.foo.bar/img2-OptimusIMG-progressive.jpeg" />' +
            '<img id="image-3" src="https://www.foo.bar/img3.jpeg" />' +
            '<img id="image-4" src="https://www.foo.bar/img4.jpeg" data-optimus-high-res-src="https://www.foo.bar/img4-highres.jpeg" />';
    });

    test('each progressive image that has no high res version sibling gets submitted for high res load after calling execute method', () => {
        const SPY: any = jest.spyOn(ProgressiveLoad, 'loadProgressiveImage');
        ProgressiveLoad.loadProgressiveImage = jest.fn();

        const PROGRESSIVE_IMAGES: NodeListOf<HTMLImageElement> =
            document.querySelectorAll('[src*="-OptimusIMG-progressive"], [data-optimus-high-res-src]') as NodeListOf<HTMLImageElement>;

        ProgressiveLoad.execute();

        expect(ProgressiveLoad.loadProgressiveImage).toBeCalledWith(document.getElementById('image-0'));
        expect(ProgressiveLoad.loadProgressiveImage).toBeCalledWith(document.getElementById('image-2'));

        expect(PROGRESSIVE_IMAGES.length).toBe(4);
        expect(ProgressiveLoad.loadProgressiveImage).toHaveBeenCalledTimes(3);
        SPY.mockRestore();
    });

    test('execute requests CSS injection', () => {
        InjectCSS.execute = jest.fn();

        ProgressiveLoad.execute();

        expect(InjectCSS.execute).toHaveBeenCalled();
    });

    describe('loadProgressiveImage', () => {
        test('requests CSS injection', () => {
            InjectCSS.execute = jest.fn();

            ProgressiveLoad.loadProgressiveImage(document.getElementById('image-3') as HTMLImageElement);

            expect(InjectCSS.execute).toHaveBeenCalled();
        });

        test('it skips images which are not of OptimusIMG-progressive origin', () => {
            const SPY: any = jest.spyOn(HtmlElementsHelpers, 'wrapImage');
            ProgressiveLoad.loadProgressiveImage(document.getElementById('image-3') as HTMLImageElement);

            expect(HtmlElementsHelpers.wrapImage).not.toHaveBeenCalled();
            SPY.mockRestore();
        });

        describe('progressive images', () => {
            test('it wraps image of OptimusIMG-progressive origin', () => {
                const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                const SPY: any = jest.spyOn(HtmlElementsHelpers, 'wrapImage');
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                expect(HtmlElementsHelpers.wrapImage).toBeCalledWith(IMAGE, PROGRESSIVE_IMAGE_CONFIG.wrapperClassName);
                SPY.mockRestore();
            });

            test('it wraps image of OptimusIMG-progressive origin', () => {
                const IMAGE: HTMLImageElement = document.getElementById('image-4') as HTMLImageElement;
                const SPY: any = jest.spyOn(HtmlElementsHelpers, 'wrapImage');
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                expect(HtmlElementsHelpers.wrapImage).toBeCalledWith(IMAGE, PROGRESSIVE_IMAGE_CONFIG.wrapperClassName);
                SPY.mockRestore();
            });
        });

        test('it creates a duplicate of OptimusIMG-progressive origin image with high res version', () => {
            document.body.innerHTML = '<img id="image-0" class="foo" src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg" ' +
                'data-optimus-lazy-src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">';

            const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
            ProgressiveLoad.loadProgressiveImage(IMAGE);

            const EXPECTED: string =
                '<div class="optimusIMG-progressive-wrapper">' +
                '<img id="image-0" class="foo" src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg" ' +
                'data-optimus-lazy-src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">' +
                '<img id="image-0" class="foo optimusIMG-progressive-image" src="https://www.foo.bar/img0.jpeg" ' +
                'data-optimus-lazy-src="https://www.foo.bar/img0.jpeg">' +
                '</div>';

            expect(document.body.innerHTML).toEqual(EXPECTED);
        });

        describe('load timeout', () => {
            beforeEach(() => {
                jest.useFakeTimers();
                document.body.innerHTML = '<img id="image-0" class="foo" src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg" ' +
                    'data-optimus-lazy-src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">';
            });

            afterEach(() => {
                jest.useRealTimers();
            });

            test('it adds loaded class to wrapper', () => {
                const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                const NEW_IMAGE: HTMLImageElement = document.querySelector('.optimusIMG-progressive-image') as HTMLImageElement;

                NEW_IMAGE.dispatchEvent(new Event('load'));

                expect((IMAGE.parentElement as HTMLElement).className.includes(PROGRESSIVE_IMAGE_CONFIG.wrapperClassLoadedName)).toBe(true);
            });

            test('it doesnt fail if it cannot find parentElement of IMAGE', () => {
                const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                const NEW_IMAGE: HTMLImageElement = document.querySelector('.optimusIMG-progressive-image') as HTMLImageElement;
                Object.defineProperty(NEW_IMAGE, 'parentElement', {get: (): null => null});

                NEW_IMAGE.dispatchEvent(new Event('load'));
            });

            test('it calls setTimeout', () => {
                const SPY: any = jest.spyOn(window, 'setTimeout');
                const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                const NEW_IMAGE: HTMLImageElement = document.querySelector('.optimusIMG-progressive-image') as HTMLImageElement;

                NEW_IMAGE.dispatchEvent(new Event('load'));

                expect(SPY).toBeCalledWith(expect.any(Function), 500);

                SPY.mockRestore();
                jest.clearAllTimers();
            });

            test('it swaps images once high res image is available', () => {
                const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                const NEW_IMAGE: HTMLImageElement = document.querySelector('.optimusIMG-progressive-image') as HTMLImageElement;

                NEW_IMAGE.dispatchEvent(new Event('load'));
                jest.runAllTimers();

                const EXPECTED: string = '<img id="image-0" class="foo" src="https://www.foo.bar/img0.jpeg" ' +
                    'data-optimus-lazy-src="https://www.foo.bar/img0.jpeg">';

                expect(document.body.innerHTML).toEqual(EXPECTED);
            });

            test('it removes high image res load event listener once the first load is triggered', () => {
                const SPY: any = jest.spyOn(HtmlElementsHelpers, 'unwrapImage');

                const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                const NEW_IMAGE: HTMLImageElement = document.querySelector('.optimusIMG-progressive-image') as HTMLImageElement;

                NEW_IMAGE.dispatchEvent(new Event('load'));
                jest.runAllTimers();

                expect(HtmlElementsHelpers.unwrapImage).toBeCalledWith(NEW_IMAGE);

                // To ensure we get a clear, new result in the next expect block
                SPY.mockClear();

                NEW_IMAGE.dispatchEvent(new Event('load'));
                jest.runAllTimers();

                expect(HtmlElementsHelpers.unwrapImage).not.toBeCalled();

                SPY.mockRestore();
            });
        });
    });
});
