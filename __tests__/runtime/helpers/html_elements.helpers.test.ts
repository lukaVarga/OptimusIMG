import { HtmlElementsHelpers } from '../../../src/runtime/helpers/html_elements.helpers';
import { IImageSourceResponsivenessFault } from '../../../src/runtime/helpers/interfaces/html_elements.helpers.interface';

describe('HtmlElementsHelpers', () => {
    describe('getSibling', () => {
        test('it returns an array of siblings when element has siblings within same parent', () => {
            document.body.innerHTML =
                '<div class="outer-container">' +
                '   <img class="optimusIMG">' +
                '   <img>' +
                '   <img>' +
                '   <img>' +
                '</div>' +
                '<img>';
            const ELEMENT: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
            const RESULT: HTMLElement[] = HtmlElementsHelpers.getSiblings(ELEMENT, 'img');

            expect(RESULT).toEqual(Array.from(document.querySelectorAll('.outer-container img:not(.optimusIMG)')));
            expect(RESULT.length).toBe(3);
        });

        test('it returns an array of siblings when element is the root of document', () => {
            document.documentElement.innerHTML =
                '<img class="optimusIMG">' +
                '<img>' +
                '<img>' +
                '<img>' +
                '<img>';

            const ELEMENT: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
            const RESULT: HTMLElement[] = HtmlElementsHelpers.getSiblings(ELEMENT, 'img');

            expect(RESULT).toEqual(Array.from(document.querySelectorAll('img:not(.optimusIMG)')));
            expect(RESULT.length).toBe(4);
        });

        test('it returns an empty array when element has no parentElement and no siblings', () => {
            document.documentElement.innerHTML =
                '<img class="optimusIMG">';

            const ELEMENT: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
            Object.defineProperty(ELEMENT, 'parentElement', {get: (): null => null});
            const RESULT: HTMLElement[] = HtmlElementsHelpers.getSiblings(ELEMENT, 'img');

            expect(RESULT).toEqual([]);
        });

        test('it returns an empty array when element has no siblings matching selector', () => {
            document.body.innerHTML =
                '<div class="outer-container">' +
                '   <img class="optimusIMG">' +
                '   <img>' +
                '   <img>' +
                '   <img>' +
                '</div>' +
                '<img>';

            const ELEMENT: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
            const RESULT: HTMLElement[] = HtmlElementsHelpers.getSiblings(ELEMENT, 'p');

            expect(RESULT).toEqual([]);
        });

        test('it returns only siblings on the same level', () => {
            document.body.innerHTML =
                '<div class="outer-container">' +
                '   <img class="optimusIMG">' +
                '   <div>' +
                '       <img>' +
                '   </div>' +
                '   <img>' +
                '   <img>' +
                '</div>' +
                '<img>';

            const ELEMENT: HTMLImageElement = document.querySelector('img.optimusIMG') as HTMLImageElement;
            const RESULT: HTMLElement[] = HtmlElementsHelpers.getSiblings(ELEMENT, 'img');

            expect(RESULT.length).toEqual(2);
        });
    });

    describe('wrapImage', () => {
        beforeEach(() => {
            document.body.innerHTML =
                '<div class="outer-container">' +
                '<img class="optimusIMG">' +
                '</div>';
        });

        test('it wraps image in correct parent element', () => {
            const IMG: HTMLImageElement = document.querySelector('img') as HTMLImageElement;
            HtmlElementsHelpers.wrapImage(IMG, 'optimusIMG-progressive-wrapper');

            const EXPECTED: string =
                '<div class="outer-container">' +
                '<div class="optimusIMG-progressive-wrapper">' +
                '<img class="optimusIMG">' +
                '</div>' +
                '</div>';

            expect(document.body.innerHTML).toEqual(EXPECTED);
        });

        test('it returns wrapper', () => {
            const IMG: HTMLImageElement = document.querySelector('img') as HTMLImageElement;
            const RESULT: HTMLElement = HtmlElementsHelpers.wrapImage(IMG, 'optimusIMG-progressive-wrapper');

            expect(RESULT).toEqual(document.querySelector('.optimusIMG-progressive-wrapper'));
        });
    });

    describe('unwrapImage', () => {
        beforeEach(() => {
            document.body.innerHTML =
                '<div class="outer-container">' +
                '<div class="optimusIMG-progressive-wrapper">' +
                '<img class="optimusIMG">' +
                '</div>' +
                '</div>';

        });

        test('it unwraps the image', () => {
            const IMG: HTMLImageElement = document.querySelector('img') as HTMLImageElement;
            HtmlElementsHelpers.unwrapImage(IMG);

            const EXPECTED: string = '<div class="outer-container"><img class="optimusIMG"></div>';

            expect(document.body.innerHTML).toEqual(EXPECTED);
        });

        test('it returns image', () => {
            const IMG: HTMLImageElement = document.querySelector('img') as HTMLImageElement;
            expect(HtmlElementsHelpers.unwrapImage(IMG)).toEqual(IMG);
        });

        test('it returns undefined if image does not have the proper wrapper', () => {
            document.body.innerHTML =
                '<div class="outer-container">' +
                '   <img class="optimusIMG">' +
                '</div>';
            const IMG: HTMLImageElement = document.querySelector('img') as HTMLImageElement;
            expect(HtmlElementsHelpers.unwrapImage(IMG)).toEqual(undefined);
        });
    });

    describe('imageSourceResponsiveness', () => {
        const CHECK_IMAGE_SOURCES_SIZES: any = HtmlElementsHelpers.checkImageSourceSIZES;
        const CHECK_IMAGE_SOURCES_SRCSET: any = HtmlElementsHelpers.checkImageSourceSRCSET;

        let IMAGE: HTMLImageElement;

        beforeEach(() => {
            IMAGE = new Image();
        });

        afterEach(() => {
            HtmlElementsHelpers.checkImageSourceSIZES = CHECK_IMAGE_SOURCES_SIZES;
            HtmlElementsHelpers.checkImageSourceSRCSET = CHECK_IMAGE_SOURCES_SRCSET;
        });

        test('returns valid result if there are no faults', () => {
            HtmlElementsHelpers.checkImageSourceSIZES = jest.fn().mockReturnValueOnce('valid');
            HtmlElementsHelpers.checkImageSourceSRCSET = jest.fn().mockReturnValueOnce('valid');

            expect(HtmlElementsHelpers.imageSourceResponsiveness(IMAGE)).toEqual({valid: true});
        });

        test('returns invalid result with fault', () => {
            const SRCSET_FAULT: IImageSourceResponsivenessFault = {attribute_name: 'srcset', fault: 'missing'};
            const SIZES_FAULT: IImageSourceResponsivenessFault = {attribute_name: 'sizes', fault: 'one_size_only'};

            HtmlElementsHelpers.checkImageSourceSRCSET = jest.fn().mockReturnValueOnce(SRCSET_FAULT);
            HtmlElementsHelpers.checkImageSourceSIZES = jest.fn().mockReturnValueOnce(SIZES_FAULT);

            expect(HtmlElementsHelpers.imageSourceResponsiveness(IMAGE)).toEqual({valid: false, faults: [SRCSET_FAULT, SIZES_FAULT]});
        });
    });

    describe('checkImageSourceSRCSET', () => {
        let IMAGE: HTMLImageElement;

        beforeEach(() => {
            IMAGE = new Image();
        });

        test('detect valid responsive srcset using x multiplier', () => {
            IMAGE.srcset = '1.jpeg 1x, 2.jpeg 2x';

            expect(HtmlElementsHelpers.checkImageSourceSRCSET(IMAGE)).toBe('valid');
        });

        test('detect valid responsive srcset using width', () => {
            IMAGE.srcset = '1.jpeg 100w, 2.jpeg 200w';

            expect(HtmlElementsHelpers.checkImageSourceSRCSET(IMAGE)).toBe('valid');
        });

        test('detect missing srcset', () => {
            // Simulates the result of image.srcset for an image with no srcset property
            IMAGE.srcset = '';
            expect(HtmlElementsHelpers.checkImageSourceSRCSET(IMAGE)).toEqual({attribute_name: 'srcset', fault: 'missing'});
        });

        test('detect srcset for only one image size', () => {
            IMAGE.srcset = '1.jpeg 1x';
            expect(HtmlElementsHelpers.checkImageSourceSRCSET(IMAGE)).toEqual({attribute_name: 'srcset', fault: 'one_size_only'});
        });

        test('detect unoptimized srcset value', () => {
            IMAGE.srcset = '1.jpeg, 2.jpeg';
            expect(HtmlElementsHelpers.checkImageSourceSRCSET(IMAGE)).toEqual({attribute_name: 'srcset', fault: 'value_format'});
        });
    });

    describe('checkImageSourceSIZES', () => {
        let IMAGE: HTMLImageElement;

        beforeEach(() => {
            IMAGE = new Image();
        });

        test('detect valid responsive sizes using px dimensions', () => {
            IMAGE.sizes = '(min-width: 100px) 300px, (min-width: 300px) and (max-width: 800px) 800px, 1000px';

            expect(HtmlElementsHelpers.checkImageSourceSIZES(IMAGE)).toBe('valid');
        });

        test('detect valid responsive sizes using em dimensions', () => {
            IMAGE.sizes = '(min-width: 100px) 300em, (min-width: 300px) and (max-width: 800px) 800em, 1000em';

            expect(HtmlElementsHelpers.checkImageSourceSIZES(IMAGE)).toBe('valid');
        });

        test('detect valid responsive sizes using rem dimensions', () => {
            IMAGE.sizes = '(min-width: 100px) 300rem, (min-width: 300px) and (max-width: 800px) 800rem, 1000rem';

            expect(HtmlElementsHelpers.checkImageSourceSIZES(IMAGE)).toBe('valid');
        });

        test('detect valid responsive sizes using vw dimensions', () => {
            IMAGE.sizes = '(min-width: 100px) 300vw, (min-width: 300px) and (max-width: 800px) 800vw, 1000vw';

            expect(HtmlElementsHelpers.checkImageSourceSIZES(IMAGE)).toBe('valid');
        });

        test('detect valid responsive sizes using combinated dimensions', () => {
            IMAGE.sizes = '(min-width: 100px) 100vw, (min-width: 300px) and (max-width: 800px) 800px, 1000rem';

            expect(HtmlElementsHelpers.checkImageSourceSIZES(IMAGE)).toBe('valid');
        });

        test('detect missing sizes', () => {
            // Simulates the result of image.sizes for an image with no sizes property
            IMAGE.sizes = '';
            expect(HtmlElementsHelpers.checkImageSourceSIZES(IMAGE)).toEqual({attribute_name: 'sizes', fault: 'missing'});
        });

        test('detect sizes for only one image size', () => {
            IMAGE.sizes = '(min-width: 100px) 100vw';
            expect(HtmlElementsHelpers.checkImageSourceSIZES(IMAGE)).toEqual({attribute_name: 'sizes', fault: 'one_size_only'});
        });

        test('detect invalid sizes value', () => {
            IMAGE.sizes = '(min-width: 100px) 100%, (min-width: 300px) and (max-width: 800px) 800px, 1000rem';
            expect(HtmlElementsHelpers.checkImageSourceSIZES(IMAGE)).toEqual({attribute_name: 'sizes', fault: 'value_format'});
        });
    });
});
