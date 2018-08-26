import { RUNTIME } from '../../src/runtime';
import { IRuntime } from '../../src/runtime/interfaces/runtime.interface';
import HtmlElementsCheck from '../../src/runtime/html_elements_check';
import LazyLoad from '../../src/runtime/lazy_load';

describe('RUNTIME', () => {
    test('inclusion of all runtime codebase', () => {
        const EXPECTED_RUNTIME: IRuntime = {
            LazyLoad: expect.any(Function),
            HtmlElementsCheck: expect.any(Function),
        };

        expect(RUNTIME).toMatchObject(EXPECTED_RUNTIME);
        expect(RUNTIME.HtmlElementsCheck()).toEqual(expect.any(HtmlElementsCheck));
        expect(RUNTIME.LazyLoad()).toEqual(expect.any(LazyLoad));
    });
});
