import { RUNTIME } from '../../src/runtime';
import { IRuntime } from '../../src/runtime/interfaces/runtime.interface';
import HtmlElementsCheck from '../../src/runtime/html_elements_check';

describe('RUNTIME', () => {
    test('inclusion of all runtime codebase', () => {
        const EXPECTED_RUNTIME: IRuntime = {
            ElementsCheck: expect.any(Function)
        };

        expect(RUNTIME).toMatchObject(EXPECTED_RUNTIME);
        expect(RUNTIME.ElementsCheck()).toEqual(expect.any(HtmlElementsCheck));
    });
});
