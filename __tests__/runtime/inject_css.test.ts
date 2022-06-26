import { InjectCSS } from '../../src/runtime/inject_css';

describe('InjectCSS', () => {
    test('Optimus CSS does not get injected if it is already present in DOM', () => {
        const SPY: jest.SpyInstance = jest.spyOn(document, 'createElement');

        document.body.innerHTML = '<style id="optimusIMG-css">';

        InjectCSS.execute();

        expect(SPY).not.toHaveBeenCalledWith('style');
        SPY.mockRestore();
    });

    test('Optimus CSS gets injected if it is not present in DOM', () => {
        document.body.innerHTML = '';

        InjectCSS.execute();

        expect(document.getElementById('optimusIMG-css')).toEqual(expect.any(HTMLStyleElement));
    });
});
