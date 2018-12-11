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
            '<img id="image-4" src="https://www.foo.bar/img4.jpeg" data-optimus-high-res-src="https://www.foo.bar/img4-highres.jpeg" />' +
            '<img id="image-5" src="https://www.foo.bar/img5.jpeg" data-optimus-high-res-srcset="https://www.foo.bar/img5-highres.jpeg" />' +
            '<img id="image-6" srcset="https://www.foo.bar/img6-OptimusIMG-progressive.jpeg" />' +
            '<picture id="picture-0">' +
            ' <source data-optimus-high-res-srcset="https://www.foo.bar/img7-highres.jpeg">' +
            ' <source srcset="https://www.foo.bar/img7-OptimusIMG-progressive.jpeg">' +
            ' <img id="image-7" class="optimusIMG" data-optimus-high-res-srcset="https://www.foo.bar/img7.jpeg" />' +
            '</picture>';
    });

    test('each progressive image that has no high res version sibling gets submitted for high res load after calling execute method', () => {
        const SPY: any = jest.spyOn(ProgressiveLoad, 'loadProgressiveImage');
        ProgressiveLoad.loadProgressiveImage = jest.fn();

        const PROGRESSIVE_IMAGES: NodeListOf<HTMLImageElement> =
            document.querySelectorAll(
              'img[src*="-OptimusIMG-progressive"]:not([data-optimus-progressive-loaded]), ' +
              'img[srcset*="-OptimusIMG-progressive"]:not([data-optimus-progressive-loaded]), ' +
              'img[data-optimus-high-res-src]:not([data-optimus-progressive-loaded]), ' +
              'img[data-optimus-high-res-srcset]:not([data-optimus-progressive-loaded])') as NodeListOf<HTMLImageElement>;

        ProgressiveLoad.execute();

        expect(ProgressiveLoad.loadProgressiveImage).toBeCalledWith(document.getElementById('image-0'));
        expect(ProgressiveLoad.loadProgressiveImage).toBeCalledWith(document.getElementById('image-2'));
        expect(ProgressiveLoad.loadProgressiveImage).toBeCalledWith(document.getElementById('image-4'));
        expect(ProgressiveLoad.loadProgressiveImage).toBeCalledWith(document.getElementById('image-5'));
        expect(ProgressiveLoad.loadProgressiveImage).toBeCalledWith(document.getElementById('image-6'));
        expect(ProgressiveLoad.loadProgressiveImage).toBeCalledWith(document.getElementById('image-7'));

        expect(PROGRESSIVE_IMAGES.length).toBe(7);
        expect(ProgressiveLoad.loadProgressiveImage).toHaveBeenCalledTimes(6);
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
            test('it wraps image of OptimusIMG-progressive src', () => {
                const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                const SPY: any = jest.spyOn(HtmlElementsHelpers, 'wrapImage');
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                expect(HtmlElementsHelpers.wrapImage).toBeCalledWith(IMAGE, PROGRESSIVE_IMAGE_CONFIG.wrapperClassName);
                SPY.mockRestore();
            });

            test('it wraps image of OptimusIMG-progressive srcset', () => {
                const IMAGE: HTMLImageElement = document.getElementById('image-6') as HTMLImageElement;
                const SPY: any = jest.spyOn(HtmlElementsHelpers, 'wrapImage');
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                expect(HtmlElementsHelpers.wrapImage).toBeCalledWith(IMAGE, PROGRESSIVE_IMAGE_CONFIG.wrapperClassName);
                SPY.mockRestore();
            });

            test('it wraps image with data-optimus-high-res-src property', () => {
                const IMAGE: HTMLImageElement = document.getElementById('image-4') as HTMLImageElement;
                const SPY: any = jest.spyOn(HtmlElementsHelpers, 'wrapImage');
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                expect(HtmlElementsHelpers.wrapImage).toBeCalledWith(IMAGE, PROGRESSIVE_IMAGE_CONFIG.wrapperClassName);
                SPY.mockRestore();
            });

            test('it wraps image with data-optimus-high-res-srcset property', () => {
                const IMAGE: HTMLImageElement = document.getElementById('image-5') as HTMLImageElement;
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

        test('it creates a duplicate of lazily loaded image with srcset and high res version', () => {
            document.body.innerHTML = '<img id="image-0" class="foo" srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg" ' +
              'data-optimus-lazy-srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">';

            const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
            ProgressiveLoad.loadProgressiveImage(IMAGE);

            const EXPECTED: string =
              '<div class="optimusIMG-progressive-wrapper">' +
              '<img id="image-0" class="foo" srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg" ' +
              'data-optimus-lazy-srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">' +
              '<img id="image-0" class="foo optimusIMG-progressive-image" srcset="https://www.foo.bar/img0.jpeg" ' +
              'data-optimus-lazy-srcset="https://www.foo.bar/img0.jpeg">' +
              '</div>';

            expect(document.body.innerHTML).toEqual(EXPECTED);
        });

        test('it doesnt create multiple duplicates for image if progressive load is called multiple times', () => {
            document.body.innerHTML = '<img id="image-0" class="foo" srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg" ' +
              'data-optimus-lazy-srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">';

            const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
            ProgressiveLoad.loadProgressiveImage(IMAGE);
            ProgressiveLoad.loadProgressiveImage(IMAGE);
            ProgressiveLoad.loadProgressiveImage(IMAGE);

            const EXPECTED: string =
              '<div class="optimusIMG-progressive-wrapper">' +
              '<img id="image-0" class="foo" srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg" ' +
              'data-optimus-lazy-srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">' +
              '<img id="image-0" class="foo optimusIMG-progressive-image" srcset="https://www.foo.bar/img0.jpeg" ' +
              'data-optimus-lazy-srcset="https://www.foo.bar/img0.jpeg">' +
              '</div>';

            expect(document.body.innerHTML).toEqual(EXPECTED);
        });

        test('it creates a duplicate of OptimusIMG picture image with high res version', () => {
            document.body.innerHTML =
              '<picture id="picture-0" class="foo">' +
              ' <source srcset="https://www.foo.bar/img0-low.jpeg" data-optimus-high-res-srcset="https://www.foo.bar/img0-highres.jpeg">' +
              ' <source srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">' +
              ' <img id="image-0" srcset="https://www.foo.bar/img0-medium-low.jpeg" ' +
              'data-optimus-high-res-srcset="https://www.foo.bar/img0-medium.jpeg">' +
              '</picture>';

            const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
            ProgressiveLoad.loadProgressiveImage(IMAGE);

            const EXPECTED: string =
              '<div class="optimusIMG-progressive-wrapper">' +
                  '<picture id="picture-0" class="foo">' +
                  ' <source srcset="https://www.foo.bar/img0-low.jpeg" data-optimus-high-res-srcset="https://www.foo.bar/img0-highres.jpeg">' +
                  ' <source srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">' +
                  ' <img id="image-0" srcset="https://www.foo.bar/img0-medium-low.jpeg" ' +
                    'data-optimus-high-res-srcset="https://www.foo.bar/img0-medium.jpeg">' +
                  '</picture>' +
                  '<picture id="picture-0" class="foo optimusIMG-progressive-image">' +
                  '<source srcset="https://www.foo.bar/img0-highres.jpeg" data-optimus-high-res-srcset="https://www.foo.bar/img0-highres.jpeg">' +
                  '<source srcset="https://www.foo.bar/img0.jpeg">' +
                  '<img id="image-0" srcset="https://www.foo.bar/img0-medium.jpeg" ' +
                    'data-optimus-high-res-srcset="https://www.foo.bar/img0-medium.jpeg">' +
                  '</picture>' +
              '</div>';

            expect(document.body.innerHTML).toEqual(EXPECTED);
        });

        test('it doesnt create multiple duplicates for picture if progressive load is called multiple times', () => {
            document.body.innerHTML =
              '<picture id="picture-0" class="foo">' +
              ' <source srcset="https://www.foo.bar/img0-low.jpeg" data-optimus-high-res-srcset="https://www.foo.bar/img0-highres.jpeg">' +
              ' <source srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">' +
              ' <img id="image-0" srcset="https://www.foo.bar/img0-medium-low.jpeg" ' +
              'data-optimus-high-res-srcset="https://www.foo.bar/img0-medium.jpeg">' +
              '</picture>';

            const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
            ProgressiveLoad.loadProgressiveImage(IMAGE);
            ProgressiveLoad.loadProgressiveImage(IMAGE);
            ProgressiveLoad.loadProgressiveImage(IMAGE);

            const EXPECTED: string =
              '<div class="optimusIMG-progressive-wrapper">' +
              '<picture id="picture-0" class="foo">' +
              ' <source srcset="https://www.foo.bar/img0-low.jpeg" data-optimus-high-res-srcset="https://www.foo.bar/img0-highres.jpeg">' +
              ' <source srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">' +
              ' <img id="image-0" srcset="https://www.foo.bar/img0-medium-low.jpeg" ' +
              'data-optimus-high-res-srcset="https://www.foo.bar/img0-medium.jpeg">' +
              '</picture>' +
              '<picture id="picture-0" class="foo optimusIMG-progressive-image">' +
              '<source srcset="https://www.foo.bar/img0-highres.jpeg" data-optimus-high-res-srcset="https://www.foo.bar/img0-highres.jpeg">' +
              '<source srcset="https://www.foo.bar/img0.jpeg">' +
              '<img id="image-0" srcset="https://www.foo.bar/img0-medium.jpeg" ' +
              'data-optimus-high-res-srcset="https://www.foo.bar/img0-medium.jpeg">' +
              '</picture>' +
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

            test('it adds loaded property to image', () => {
                const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                const NEW_IMAGE: HTMLImageElement = document.querySelector('.optimusIMG-progressive-image') as HTMLImageElement;

                NEW_IMAGE.dispatchEvent(new Event('load'));

                expect(NEW_IMAGE.getAttribute('data-optimus-progressive-loaded')).toBe('true');
            });

            test('it doesnt fail if it cannot find parentElement of image', () => {
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
                    'data-optimus-lazy-src="https://www.foo.bar/img0.jpeg" data-optimus-progressive-loaded="true">';

                expect(document.body.innerHTML).toEqual(EXPECTED);
            });

            test('it swaps picture element once picture element with high resolution resources is available', () => {
                document.body.innerHTML =
                  '<picture id="picture-0" class="foo">' +
                  ' <source srcset="https://www.foo.bar/img0-low.jpeg" data-optimus-high-res-srcset="https://www.foo.bar/img0-highres.jpeg">' +
                  ' <source srcset="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">' +
                  ' <img id="image-0" srcset="https://www.foo.bar/img0-medium-low.jpeg" ' +
                  'data-optimus-high-res-srcset="https://www.foo.bar/img0-medium.jpeg">' +
                  '</picture>';

                const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                ProgressiveLoad.loadProgressiveImage(IMAGE);

                const NEW_IMAGE: HTMLImageElement = document.querySelector('.optimusIMG-progressive-image img') as HTMLImageElement;
                NEW_IMAGE.dispatchEvent(new Event('load'));

                jest.runAllTimers();

                const EXPECTED_BODY: string =
                  '<picture id="picture-0" class="foo">' +
                  '<source srcset="https://www.foo.bar/img0-highres.jpeg" data-optimus-high-res-srcset="https://www.foo.bar/img0-highres.jpeg">' +
                  '<source srcset="https://www.foo.bar/img0.jpeg">' +
                  '<img id="image-0" srcset="https://www.foo.bar/img0-medium.jpeg" ' +
                  'data-optimus-high-res-srcset="https://www.foo.bar/img0-medium.jpeg" ' +
                  'data-optimus-progressive-loaded="true" class="">' +
                  '</picture>';

                expect(document.body.innerHTML).toEqual(EXPECTED_BODY);
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
