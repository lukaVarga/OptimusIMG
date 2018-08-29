import ProgressiveLoad, { PROGRESSIVE_IMAGE_CONFIG } from '../../src/runtime/progressive_load';
import { HtmlElementsHelpers } from '../../src/runtime/helpers/html_elements.helpers';

describe('ProgressiveLoad', () => {
    beforeEach(() => {
        document.body.innerHTML =
            '<img id="image-0" src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg" />' +
            '<div class="optimusIMG-progressive-wrapper">' +
            '   <img id="image-1" src="https://www.foo.bar/img1-OptimusIMG-progressive.jpeg" />' +
            '   <img id="image-1" class="optimusIMG-progressive-image" src="https://www.foo.bar/img1.jpeg" />' +
            '</div>' +
            '<img id="image-2" src="https://www.foo.bar/img2-OptimusIMG-progressive.jpeg" />' +
            '<img id="image-3" src="https://www.foo.bar/img3.jpeg" />';
    });

    test('each progressive image that has no high res version sibling gets submitted for high res load after calling execute method', () => {
        const SPY: any = jest.spyOn(ProgressiveLoad, 'loadProgressiveImage');
        ProgressiveLoad.loadProgressiveImage = jest.fn();

        const PROGRESSIVE_IMAGES: NodeListOf<HTMLImageElement> =
            document.querySelectorAll('[src*="-OptimusIMG-progressive"]') as NodeListOf<HTMLImageElement>;

        ProgressiveLoad.execute();

        expect(ProgressiveLoad.loadProgressiveImage).toBeCalledWith(document.getElementById('image-0'));
        expect(ProgressiveLoad.loadProgressiveImage).toBeCalledWith(document.getElementById('image-2'));

        expect(PROGRESSIVE_IMAGES.length).toBe(3);
        expect(ProgressiveLoad.loadProgressiveImage).toHaveBeenCalledTimes(2);
        SPY.mockRestore();
    });

    describe('loadProgressiveImage', () => {
        test('it skips images which are not of OptimusIMG-progressive origin', () => {
            const SPY: any = jest.spyOn(HtmlElementsHelpers, 'wrapImage');
            ProgressiveLoad.loadProgressiveImage(document.getElementById('image-3') as HTMLImageElement);

            expect(HtmlElementsHelpers.wrapImage).not.toHaveBeenCalled();
            SPY.mockRestore();
        });

        test('it wraps image of OptimusIMG-progressive origin', () => {
            const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
            const SPY: any = jest.spyOn(HtmlElementsHelpers, 'wrapImage');
            ProgressiveLoad.loadProgressiveImage(IMAGE);

            expect(HtmlElementsHelpers.wrapImage).toBeCalledWith(IMAGE, PROGRESSIVE_IMAGE_CONFIG.wrapperClassName);
            SPY.mockRestore();
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

        test('it swaps images once high res image is available', () => {
            document.body.innerHTML = '<img id="image-0" class="foo" src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg" ' +
                'data-optimus-lazy-src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">';

            const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
            ProgressiveLoad.loadProgressiveImage(IMAGE);

            const NEW_IMAGE: HTMLImageElement = document.querySelector('.optimusIMG-progressive-image') as HTMLImageElement;

            NEW_IMAGE.dispatchEvent(new Event('load'));

            const EXPECTED: string = '<img id="image-0" class="foo" src="https://www.foo.bar/img0.jpeg" ' +
                'data-optimus-lazy-src="https://www.foo.bar/img0.jpeg">';

            expect(document.body.innerHTML).toEqual(EXPECTED);
        });

        test('it removes high image res load event listener once the first load is triggered', () => {
            const SPY: any = jest.spyOn(HtmlElementsHelpers, 'unwrapImage');

            document.body.innerHTML = '<img id="image-0" class="foo" src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg" ' +
                'data-optimus-lazy-src="https://www.foo.bar/img0-OptimusIMG-progressive.jpeg">';

            const IMAGE: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
            ProgressiveLoad.loadProgressiveImage(IMAGE);

            const NEW_IMAGE: HTMLImageElement = document.querySelector('.optimusIMG-progressive-image') as HTMLImageElement;

            NEW_IMAGE.dispatchEvent(new Event('load'));

            expect(HtmlElementsHelpers.unwrapImage).toBeCalledWith(NEW_IMAGE);

            // To ensure we get a clear, new result in the next expect block
            SPY.mockClear();

            NEW_IMAGE.dispatchEvent(new Event('load'));

            expect(HtmlElementsHelpers.unwrapImage).not.toBeCalled();

            SPY.mockRestore();
        });
    });
});
