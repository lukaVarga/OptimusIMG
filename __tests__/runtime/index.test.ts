import { RUNTIME } from '../../src/runtime';
import { IRuntime } from '../../src/runtime/interfaces/runtime.interface';
import HtmlElementsCheck from '../../src/runtime/html_elements_check';

describe('RUNTIME', () => {
    test('inclusion of all runtime codebase', () => {
        const EXPECTED_RUNTIME: IRuntime = {
            ElementsCheck: new HtmlElementsCheck()
        };

        expect(RUNTIME).toEqual(EXPECTED_RUNTIME)
    });
});
