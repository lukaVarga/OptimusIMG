import {IOptimusWindowCache, loadImageInBackground, supportsWebp} from '../../src/runtime/helpers';

declare const window: IOptimusWindowCache & Window;

describe('Helpers', () => {
    describe('loadImageInBackground', () => {
        let imageMock: any;
        let spy: any;

        beforeEach(() => {
            imageMock = new Image();

            // @ts-ignore
            spy = jest.spyOn(global, 'Image').mockImplementationOnce(() => imageMock);
        });

        afterEach(() => {
            spy.mockRestore();
        });

        test('it loads image in background and resolves promise', (done: any) => {
            loadImageInBackground('src').then((result: boolean | string) => {
                expect(result).toBe(true);
                done();
            });

            setTimeout(() => {
                imageMock.dispatchEvent(new Event('load'));
            });
        });

        test('it tries to load image in background and rejects promise if an error occurs', (done: any) => {
            loadImageInBackground('src').catch((result: boolean) => {
                expect(result).toBe('OptimusIMG: could not load image src in background');
                done();
            });

            setTimeout(() => {
                imageMock.dispatchEvent(new Event('error'));
            });
        });
    });

    describe('supportsWebp', () => {
        let imageMock: any;
        let imageSpy: any;

        beforeEach(() => {
            delete window.optimus__supportsWebp;

            imageMock = new Image();

            // @ts-ignore
            imageSpy = jest.spyOn(global, 'Image').mockImplementationOnce(() => imageMock);
        });

        afterEach(() => {
            imageSpy.mockRestore();
        });

        test('it returns the cached result stored on window, if present', async () => {
            window.optimus__supportsWebp = true;
            expect(await supportsWebp()).toBe(true);

            window.optimus__supportsWebp = false;
            expect(await supportsWebp()).toBe(false);
        });

        test('browser supports webp if image can be loaded in background', async (done: any) => {
            supportsWebp().then((isSupported: boolean) => {
                expect(isSupported).toBe(true);
                expect(window.optimus__supportsWebp).toBe(true);

                done();
            });

            setTimeout(() => {
                imageMock.dispatchEvent(new Event('load'));
            });
        });

        test('browser does not support webp if the image cannot be loaded in background', async (done: any) => {
            supportsWebp().then((isSupported: boolean) => {
                expect(isSupported).toBe(false);
                expect(window.optimus__supportsWebp).toBe(false);

                done();
            });

            setTimeout(() => {
                imageMock.dispatchEvent(new Event('error'));
            });
        });
    });
});
