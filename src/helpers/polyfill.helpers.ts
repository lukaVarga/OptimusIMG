export class PolyfillHelpers {
    public static async asyncForEach(array: any[], callback: (value: any, index: number, array: any[]) => void): Promise<void> {
        for (let index: number = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }
}
