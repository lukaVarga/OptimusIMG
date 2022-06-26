import { IColorRGB, IColorRGBA } from '../../../src/buildtime/helpers/interfaces/color.helpers.interface';
import { ColorHelpers } from '../../../src/buildtime/helpers/color.helpers';

describe('ColorHelpers', () => {
    describe('rgba2rgb', () => {
        test('fully opaque foreground colour remains unchanged', () => {
            const FOREGROUND: IColorRGBA = {
                r: 100,
                g: 200,
                b: 50,
                a: 1,
            };

            const BACKGROUND: IColorRGB = {
                r: 200,
                g: 0,
                b: 255,
            };

            expect(ColorHelpers.rgba2rgb(BACKGROUND, FOREGROUND)).toEqual({...FOREGROUND, a: undefined});
        });

        test('fully transparent foreground colour gets background color property', () => {
            const FOREGROUND: IColorRGBA = {
                r: 100,
                g: 200,
                b: 50,
                a: 0,
            };

            const BACKGROUND: IColorRGB = {
                r: 200,
                g: 0,
                b: 255,
            };

            expect(ColorHelpers.rgba2rgb(BACKGROUND, FOREGROUND)).toEqual({...BACKGROUND, a: undefined});
        });

        describe('partially transparent foreground color', () => {
            test('partially transparent foreground color gets lightened when background color is lighter', () => {
                const FOREGROUND: IColorRGBA = {
                    r: 100,
                    g: 100,
                    b: 100,
                    a: 0.5,
                };

                const BACKGROUND: IColorRGB = {
                    r: 255,
                    g: 255,
                    b: 255,
                };

                expect(ColorHelpers.rgba2rgb(BACKGROUND, FOREGROUND)).toEqual({
                    r: 177,
                    g: 177,
                    b: 177,
                });
            });

            test('partially transparent foreground color gets darkened when background color is darker', () => {
                const FOREGROUND: IColorRGBA = {
                    r: 100,
                    g: 100,
                    b: 100,
                    a: 0.5,
                };

                const BACKGROUND: IColorRGB = {
                    r: 0,
                    g: 0,
                    b: 0,
                };

                expect(ColorHelpers.rgba2rgb(BACKGROUND, FOREGROUND)).toEqual({
                    r: 50,
                    g: 50,
                    b: 50,
                });
            });

            describe('separate channels get darkened accordingly', () => {
                test('r channel gets darkened', () => {
                    const FOREGROUND: IColorRGBA = {
                        r: 100,
                        g: 100,
                        b: 100,
                        a: 0.5,
                    };

                    const BACKGROUND: IColorRGB = {
                        r: 0,
                        g: 100,
                        b: 100,
                    };

                    expect(ColorHelpers.rgba2rgb(BACKGROUND, FOREGROUND)).toEqual({
                        r: 50,
                        g: 100,
                        b: 100,
                    });
                });

                test('g channel gets darkened', () => {
                    const FOREGROUND: IColorRGBA = {
                        r: 100,
                        g: 100,
                        b: 100,
                        a: 0.5,
                    };

                    const BACKGROUND: IColorRGB = {
                        r: 100,
                        g: 0,
                        b: 100,
                    };

                    expect(ColorHelpers.rgba2rgb(BACKGROUND, FOREGROUND)).toEqual({
                        r: 100,
                        g: 50,
                        b: 100,
                    });
                });

                test('b channel gets darkened', () => {
                    const FOREGROUND: IColorRGBA = {
                        r: 100,
                        g: 100,
                        b: 100,
                        a: 0.5,
                    };

                    const BACKGROUND: IColorRGB = {
                        r: 100,
                        g: 100,
                        b: 50,
                    };

                    expect(ColorHelpers.rgba2rgb(BACKGROUND, FOREGROUND)).toEqual({
                        r: 100,
                        g: 100,
                        b: 75,
                    });
                });
            });

            describe('separate channels get lightened accordingly', () => {
                test('r channel gets darkened', () => {
                    const FOREGROUND: IColorRGBA = {
                        r: 100,
                        g: 100,
                        b: 100,
                        a: 0.5,
                    };

                    const BACKGROUND: IColorRGB = {
                        r: 200,
                        g: 100,
                        b: 100,
                    };

                    expect(ColorHelpers.rgba2rgb(BACKGROUND, FOREGROUND)).toEqual({
                        r: 150,
                        g: 100,
                        b: 100,
                    });
                });

                test('g channel gets darkened', () => {
                    const FOREGROUND: IColorRGBA = {
                        r: 100,
                        g: 100,
                        b: 100,
                        a: 0.5,
                    };

                    const BACKGROUND: IColorRGB = {
                        r: 100,
                        g: 240,
                        b: 100,
                    };

                    expect(ColorHelpers.rgba2rgb(BACKGROUND, FOREGROUND)).toEqual({
                        r: 100,
                        g: 170,
                        b: 100,
                    });
                });

                test('b channel gets darkened', () => {
                    const FOREGROUND: IColorRGBA = {
                        r: 100,
                        g: 100,
                        b: 100,
                        a: 0.5,
                    };

                    const BACKGROUND: IColorRGB = {
                        r: 100,
                        g: 100,
                        b: 150,
                    };

                    expect(ColorHelpers.rgba2rgb(BACKGROUND, FOREGROUND)).toEqual({
                        r: 100,
                        g: 100,
                        b: 125,
                    });
                });
            });
        });
    });

    describe('rgb2xyz', () => {
        test('it converts full white rgb color to xyz color space correctly', () => {
            expect(ColorHelpers.rgb2xyz({r: 255, g: 255, b: 255})).toEqual({
                x: 0.95047,
                y: 1.0000001,
                z: 1.08883,
            });
        });

        test('it converts full black rgb color to xyz color space correctly', () => {
            expect(ColorHelpers.rgb2xyz({r: 0, g: 0, b: 0})).toEqual({
                x: 0,
                y: 0,
                z: 0,
            });
        });

        test('it converts rgb color to xyz color space correctly', () => {
            expect(ColorHelpers.rgb2xyz({r: 255, g: 100, b: 255})).toEqual({
                x: 0.6384625687632252,
                y: 0.3759852375264502,
                z: 0.9848275520064856,
            });
        });

        test('it converts rgb color #2 to xyz color space correctly', () => {
            expect(ColorHelpers.rgb2xyz({r: 10, g: 29, b: 70})).toEqual({
                x: 0.016696355969153018,
                y: 0.013852662781085608,
                z: 0.059725511168838424,
            });
        });

        test('it converts rgb color #3 to xyz color space correctly', () => {
            expect(ColorHelpers.rgb2xyz({r: 20, g: 178, b: 103})).toEqual({
                x: 0.18655194747247814,
                y: 0.3296636834399881,
                z: 0.1820925786057913,
            });
        });

        test('it converts rgb color #4 to xyz color space correctly', () => {
            expect(ColorHelpers.rgb2xyz({r: 200, g: 98, b: 0})).toEqual({
                x: 0.28190065500267747,
                y: 0.21018351891474973,
                z: 0.025724847016813532,
            });
        });
    });

    describe('xyz2lab', () => {
        test('it converts full white xyz color to lab color space correctly', () => {
            expect(ColorHelpers.xyz2lab({x: 0.95047, y: 1.0000001, z: 1.08883})).toEqual({
                L: 100,
                a: 0,
                b: 0,
            });
        });

        test('it converts full black xyz color to lab color space correctly', () => {
            expect(ColorHelpers.xyz2lab({x: 0, y: 0, z: 0})).toEqual({
                L: 0,
                a: 0,
                b: 0,
            });
        });

        test('it converts xyz color to lab color space correctly', () => {
            expect(ColorHelpers.xyz2lab({x: 0.78, y: 0.23, z: 0.7888})).toEqual({
                L: 55.072335463571875,
                a: 161.77179092393652,
                b: -57.08600352797888,
            });
        });

        test('it converts xyz color #2 to lab color space correctly', () => {
            expect(ColorHelpers.xyz2lab({x: 0.25, y: 0.40, z: 0.10})).toEqual({
                L: 69.46952791947281,
                a: -48.04393595555479,
                b: 57.12591977488201,
            });
        });

        test('it converts xyz color #3 to lab color space correctly', () => {
            expect(ColorHelpers.xyz2lab({x: 0.5497, y: 0.2676, z: 0.7421})).toEqual({
                L: 58.75151708604609,
                a: 94.37585303808727,
                b: -47.125414238971274,
            });
        });

        test('it converts xyz color #4 to lab color space correctly', () => {
            expect(ColorHelpers.xyz2lab({x: 0.4156, y: 0.2179, z: 0.0237})).toEqual({
                L: 53.80347628902372,
                a: 78.62638340419097,
                b: 64.50901998024291,
            });
        });
    });

    describe('rgba2lab', () => {
        test('it converts full white rgb color to xyz color space correctly', () => {
            expect(ColorHelpers.rgba2lab({r: 255, g: 255, b: 255, a: 1}, {r: 0, g: 0, b: 0})).toEqual({
                L: 100,
                a: 0,
                b: 0,
            });
        });

        test('it converts full black rgb color to xyz color space correctly', () => {
            expect(ColorHelpers.rgba2lab({r: 0, g: 0, b: 0, a: 1}, {r: 0, g: 0, b: 0})).toEqual({
                L: 0,
                a: 0,
                b: 0,
            });
        });

        test('it converts rgb color to xyz color space correctly', () => {
            expect(ColorHelpers.rgba2lab({r: 20, g: 150, b: 172, a: 1}, {r: 0, g: 0, b: 0})).toEqual({
                L: 57.01450522003452,
                a: -24.232935785517274,
                b: -20.680006803549112,
            });
        });

        test('it converts rgb color #2 to xyz color space correctly', () => {
            expect(ColorHelpers.rgba2lab({r: 133, g: 0, b: 22, a: 1}, {r: 0, g: 0, b: 0})).toEqual({
                L: 26.865877930910926,
                a: 49.84281929749124,
                b: 29.202769536552825,
            });
        });

        test('it converts rgb color #3 to xyz color space correctly', () => {
            expect(ColorHelpers.rgba2lab({r: 0, g: 77, b: 221, a: 1}, {r: 0, g: 0, b: 0})).toEqual({
                L: 38.7704679927031,
                a: 38.263104775884486,
                b: -77.85008118138123,
            });
        });

        test('it converts rgb color #4 to xyz color space correctly', () => {
            expect(ColorHelpers.rgba2lab({r: 81, g: 190, b: 20, a: 1}, {r: 0, g: 0, b: 0})).toEqual({
                L: 68.47865365064217,
                a: -57.45249237364081,
                b: 65.68058200854304,
            });
        });
    });

    describe('colorDiff', () => {
        describe('non perceptible differences', () => {
           test('example 1', () => {
               const COLOR_1: IColorRGBA = {r: 0, g: 0, b: 0, a: 0};
               const COLOR_2: IColorRGBA = {r: 100, g: 100, b: 100, a: 0};
               const BACKGROUND: IColorRGB = {r: 50, g: 50, b: 50};

               expect(ColorHelpers.colorDiff(COLOR_1, COLOR_2, BACKGROUND)).toEqual(0);
           });

           test('example 2', () => {
                const COLOR_1: IColorRGBA = {r: 100, g: 80, b: 120, a: 1};
                const COLOR_2: IColorRGBA = {r: 102, g: 82, b: 122, a: 1};
                const BACKGROUND: IColorRGB = {r: 50, g: 50, b: 50};

                expect(ColorHelpers.colorDiff(COLOR_1, COLOR_2, BACKGROUND) < 1).toEqual(true);
            });
        });

        describe('perceptible differences', () => {
            test('example 1', () => {
                const COLOR_1: IColorRGBA = {r: 0, g: 0, b: 0, a: 0};
                const COLOR_2: IColorRGBA = {r: 100, g: 100, b: 0, a: 1};
                const BACKGROUND: IColorRGB = {r: 50, g: 50, b: 50};

                expect(ColorHelpers.colorDiff(COLOR_1, COLOR_2, BACKGROUND) > 30).toEqual(true);
            });

            test('example 2', () => {
                const COLOR_1: IColorRGBA = {r: 0, g: 0, b: 0, a: 1};
                const COLOR_2: IColorRGBA = {r: 9, g: 2, b: 15, a: 1};
                const BACKGROUND: IColorRGB = {r: 50, g: 50, b: 50};

                expect(ColorHelpers.colorDiff(COLOR_1, COLOR_2, BACKGROUND) > 5).toEqual(true);
            });
        });

        describe('big perceptible differences', () => {
            test('example 1', () => {
                const COLOR_1: IColorRGBA = {r: 0, g: 0, b: 0, a: 0};
                const COLOR_2: IColorRGBA = {r: 220, g: 0, b: 190, a: 1};
                const BACKGROUND: IColorRGB = {r: 50, g: 50, b: 50};

                expect(ColorHelpers.colorDiff(COLOR_1, COLOR_2, BACKGROUND) > 50).toEqual(true);
            });

            test('opposite colors', () => {
                const COLOR_1: IColorRGBA = {r: 0, g: 0, b: 0, a: 1};
                const COLOR_2: IColorRGBA = {r: 255, g: 255, b: 255, a: 1};
                const BACKGROUND: IColorRGB = {r: 50, g: 50, b: 50};

                expect(ColorHelpers.colorDiff(COLOR_1, COLOR_2, BACKGROUND)).toEqual(100);
            });
        });
    });

    describe('colorDiffCategory', () => {
        test('it detects non-perceptible-difference', () => {
            expect(ColorHelpers.colorDiffCategory(0)).toEqual('difference-not-perceptible');
        });

        test('it detects hardly perceptible difference', () => {
            expect(ColorHelpers.colorDiffCategory(1.5)).toEqual('difference-hardly-perceptible');
        });

        test('it detects perceptible difference', () => {
            expect(ColorHelpers.colorDiffCategory(5)).toEqual('difference-perceptible');
        });

        test('it detects difference when colors are more similar than opposite', () => {
            expect(ColorHelpers.colorDiffCategory(25)).toEqual('colors-more-similar-than-opposite');
        });

        test('it detects difference when colors are more opposite than similar', () => {
            expect(ColorHelpers.colorDiffCategory(50)).toEqual('colors-more-opposite-than-similar');
        });

        test('it detects difference when colors are exact opposite', () => {
            expect(ColorHelpers.colorDiffCategory(100)).toEqual('colors-exact-opposite');
        });

        test('it detects difference when color difference is out of bounds', () => {
            expect(ColorHelpers.colorDiffCategory(101)).toEqual('difference-out-of-bounds');
        });
    });
});
