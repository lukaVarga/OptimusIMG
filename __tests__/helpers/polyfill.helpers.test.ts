import { PolyfillHelpers } from '../../src/helpers/polyfill.helpers';

describe('PolyfillHelpers', () => {
    describe('asyncForEach', () => {
        test('it executes async stuff one by one', async () => {
            const NUMBERS: number[] = [];
            const TIMEOUTS: number[] = [100, 200, 50, 10];

            await PolyfillHelpers.asyncForEach(TIMEOUTS, async (timeout: number, index: number): Promise<boolean> => {
                await new Promise((resolve: any): number => window.setTimeout((): void => resolve(NUMBERS.push(index)), timeout));
                return true;
            });

            expect(NUMBERS).toEqual([0, 1, 2, 3]);
        });
    });
});
