import { optimusIMG } from '../src';
import { RUNTIME } from '../src/runtime';

describe('optimusIMG test', () => {
    test('inclusion of runtime code', () => {
        expect(optimusIMG.runtime).toEqual(RUNTIME);
    });
});
