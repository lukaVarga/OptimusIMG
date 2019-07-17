import {loadImageInBackground} from '../../src/runtime/helpers';

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
            loadImageInBackground('src').then((result: boolean) => {
                expect(result).toBe(true);
                done();
            });

            setTimeout(() => {
                imageMock.dispatchEvent(new Event('load'));
            });
        });

        test('it tries to load image in background and rejects promise if an error occurs', (done: any) => {
            loadImageInBackground('src').catch((result: boolean) => {
                expect(result).toBe(false);
                done();
            });

            setTimeout(() => {
                imageMock.dispatchEvent(new Event('error'));
            });
        });
    });
});
