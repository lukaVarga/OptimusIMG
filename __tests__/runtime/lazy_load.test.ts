import LazyLoad from '../../src/runtime/lazy_load';
import { ILazyLoad } from '../../src/runtime/interfaces/lazy_load.interface';
import { consoleMessage } from '../../src/runtime/helpers/console.helpers';
import { InjectCSS } from '../../src/runtime/inject_css';
/* tslint:disable no-unused-expression */
describe('LazyLoad', () => {
    const QUERY_SELECTOR_ALL: any = document.querySelectorAll;
    const REMOVE_EVENT_LISTENER: any = document.removeEventListener;
    const ADD_EVENT_LISTENER: any = document.addEventListener;

    afterEach(() => {
        document.removeEventListener = REMOVE_EVENT_LISTENER;
        document.addEventListener = ADD_EVENT_LISTENER;
    });

    describe('execute', () => {
        test('it clears all existing intervals', () => {
            window.clearInterval = jest.fn();

            document.body.innerHTML =
                '<div id="carousel-0" class="optimusIMG-carousel" data-optimus-interval="5000">' +
                '  <img id="image-0" data-optimus-lazy-src="https://www.foo.bar/img0.jpeg" />' +
                '  <img id="image-1" data-optimus-lazy-src="https://www.foo.bar/img1.jpeg" />' +
                '  <img id="image-2" data-optimus-lazy-src="https://www.foo.bar/img2.jpeg" />' +
                '  <img id="image-3" data-optimus-lazy-src="https://www.foo.bar/img3.jpeg" />' +
                '</div>';

            const LAZY_LOAD: LazyLoad = new LazyLoad();

            LAZY_LOAD.execute();

            expect(window.clearInterval).toHaveBeenCalledTimes(1);
        });

        test('requests CSS injection', () => {
            InjectCSS.execute = jest.fn();

            new LazyLoad();

            expect(InjectCSS.execute).toHaveBeenCalled();
        });
    });

    describe('default configuration', () => {
        describe('images', () => {
            beforeEach(() => {
                document.body.innerHTML =
                    '<img id="image-0" class="optimusIMG" data-optimus-lazy-src="https://www.foo.bar/img0.jpeg" />' +
                    '<img id="image-1" class="optimusIMG" data-optimus-lazy-src="https://www.foo.bar/img1.jpeg" />' +
                    '<img id="image-2" class="optimusIMG" data-optimus-lazy-src="https://www.foo.bar/img2.jpeg" />' +
                    '<img id="image-3" class="optimusIMG" data-optimus-lazy-src="https://www.foo.bar/img3.jpeg" />';
            });

            afterEach(() => {
                document.removeEventListener = REMOVE_EVENT_LISTENER;
                document.addEventListener = ADD_EVENT_LISTENER;
            });

            test('images near or in view get loaded immediately', () => {
                const IMG_0: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                const IMG_1: HTMLImageElement = document.getElementById('image-1') as HTMLImageElement;
                const IMG_2: HTMLImageElement = document.getElementById('image-2') as HTMLImageElement;
                const IMG_3: HTMLImageElement = document.getElementById('image-3') as HTMLImageElement;

                IMG_0.getBoundingClientRect = jest.fn().mockReturnValue({top: -500, bottom: 350});
                IMG_1.getBoundingClientRect = jest.fn().mockReturnValue({top: 350, bottom: 500});
                IMG_2.getBoundingClientRect = jest.fn().mockReturnValue({top: 800, bottom: 1000});
                IMG_3.getBoundingClientRect = jest.fn().mockReturnValue({top: 2000, bottom: 2500});

                new LazyLoad();

                expect(IMG_0.src).toEqual('https://www.foo.bar/img0.jpeg');
                expect(IMG_1.src).toEqual('https://www.foo.bar/img1.jpeg');
                expect(IMG_2.src).toEqual('https://www.foo.bar/img2.jpeg');
                expect(IMG_3.src).toEqual('');
            });

            test('scroll event listener gets added', () => {
                document.addEventListener = jest.fn();

                new LazyLoad();

                expect(document.addEventListener).toBeCalledWith('scroll', expect.any(Function), {passive: true});
            });

            test('scroll event listener does not get duplicated', () => {
                const IMAGES: NodeListOf<HTMLImageElement> = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
                const LAZY_LOAD: LazyLoad = new LazyLoad();
                LAZY_LOAD.execute();
                LAZY_LOAD.execute();
                LAZY_LOAD.execute();
                new LazyLoad();
                new LazyLoad();

                IMAGES.forEach((img: HTMLImageElement) => {
                    img.removeAttribute('data-optimus-loaded');
                    img.getBoundingClientRect = jest.fn().mockReturnValue({top: 0, bottom: 0});
                });

                document.dispatchEvent(new Event('scroll'));

                IMAGES.forEach((img: HTMLImageElement) => {
                    // The function gets called once per image for top and once per image for bottom position
                    expect(img.getBoundingClientRect).toHaveBeenCalledTimes(2);
                });
            });

            test('images which werent loaded yet get analysed for loading on scrolling', () => {
                new LazyLoad();

                document.querySelectorAll = jest.fn().mockReturnValue(document.querySelectorAll('img'));

                document.dispatchEvent(new Event('scroll'));

                expect(document.querySelectorAll).toBeCalledWith('img.optimusIMG:not([data-optimus-loaded="true"])');

                // Clear mock
                document.querySelectorAll = QUERY_SELECTOR_ALL;
            });

            test('it works if it does not find any images on scrolling', () => {
                new LazyLoad();

                document.querySelectorAll = jest.fn().mockReturnValue(document.querySelectorAll('not-loaded-img'));

                document.dispatchEvent(new Event('scroll'));

                expect(document.querySelectorAll).toBeCalledWith('img.optimusIMG:not([data-optimus-loaded="true"])');

                // Clear mock
                document.querySelectorAll = QUERY_SELECTOR_ALL;
            });
        });

        describe('carousels', () => {
            describe('optimus interval is defined', () => {
                beforeEach(() => {
                    document.body.innerHTML =
                        '<div id="carousel-0" class="optimusIMG-carousel" data-optimus-interval="5000">' +
                        '  <img id="image-0" data-optimus-lazy-src="https://www.foo.bar/img0.jpeg" />' +
                        '  <img id="image-1" data-optimus-lazy-src="https://www.foo.bar/img1.jpeg" />' +
                        '  <img id="image-2" data-optimus-lazy-src="https://www.foo.bar/img2.jpeg" />' +
                        '  <img id="image-3" data-optimus-lazy-src="https://www.foo.bar/img3.jpeg" />' +
                        '</div>';
                });

                test('first image in each carousel gets loaded immediately', () => {
                    document.body.innerHTML =
                        '<div id="carousel-0" class="optimusIMG-carousel" data-optimus-interval="5000">' +
                        '  <img id="image-0" data-optimus-lazy-src="https://www.foo.bar/img0.jpeg" />' +
                        '  <img id="image-1" data-optimus-lazy-src="https://www.foo.bar/img1.jpeg" />' +
                        '  <img id="image-2" data-optimus-lazy-src="https://www.foo.bar/img2.jpeg" />' +
                        '  <img id="image-3" data-optimus-lazy-src="https://www.foo.bar/img3.jpeg" />' +
                        '</div>' +
                        '<div id="carousel-1" class="optimusIMG-carousel" data-optimus-interval="5000">' +
                        '  <img id="image-4" data-optimus-lazy-src="https://www.foo.bar/img4.jpeg" />' +
                        '  <img id="image-5" data-optimus-lazy-src="https://www.foo.bar/img5.jpeg" />' +
                        '  <img id="image-6" data-optimus-lazy-src="https://www.foo.bar/img6.jpeg" />' +
                        '  <img id="image-7" data-optimus-lazy-src="https://www.foo.bar/img7.jpeg" />' +
                        '</div>';

                    const IMG_0: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                    const IMG_1: HTMLImageElement = document.getElementById('image-1') as HTMLImageElement;
                    const IMG_2: HTMLImageElement = document.getElementById('image-2') as HTMLImageElement;
                    const IMG_3: HTMLImageElement = document.getElementById('image-3') as HTMLImageElement;

                    const IMG_4: HTMLImageElement = document.getElementById('image-4') as HTMLImageElement;
                    const IMG_5: HTMLImageElement = document.getElementById('image-5') as HTMLImageElement;
                    const IMG_6: HTMLImageElement = document.getElementById('image-6') as HTMLImageElement;
                    const IMG_7: HTMLImageElement = document.getElementById('image-7') as HTMLImageElement;

                    new LazyLoad();

                    expect(IMG_0.src).toEqual('https://www.foo.bar/img0.jpeg');
                    expect(IMG_1.src).toEqual('');
                    expect(IMG_2.src).toEqual('');
                    expect(IMG_3.src).toEqual('');

                    expect(IMG_4.src).toEqual('https://www.foo.bar/img4.jpeg');
                    expect(IMG_5.src).toEqual('');
                    expect(IMG_6.src).toEqual('');
                    expect(IMG_7.src).toEqual('');
                });

                test('interval gets added', () => {
                    window.setInterval = jest.fn();

                    new LazyLoad();

                    expect(window.setInterval).toBeCalledWith(expect.any(Function), 4000);
                    expect(window.setInterval).toHaveBeenCalledTimes(1);
                });

                test('interval gets cleared once all images are loaded', () => {
                    window.clearInterval = jest.fn();

                    jest.useFakeTimers();

                    new LazyLoad();

                    expect(document.querySelectorAll('img:not([data-optimus-loaded="true"])').length).not.toBe(0);

                    jest.runAllTimers();

                    expect(document.querySelectorAll('img:not([data-optimus-loaded="true"])').length).toBe(0);
                    expect(window.clearInterval).toHaveBeenCalledTimes(1);

                    jest.useRealTimers();
                });

                describe('carousel toggle button events', () => {
                    beforeEach(() => {
                        document.body.innerHTML =
                            '<div id="carousel-0" class="optimusIMG-carousel" data-optimus-interval="5000">' +
                            '  <div class="optimusIMG-carousel--toggle-btn" data-optimus-img-index="next">Next</div>' +
                            '  <div class="optimusIMG-carousel--toggle-btn" data-optimus-img-index="previous">Previous</div>' +
                            '  <img id="image-0" data-optimus-lazy-src="https://www.foo.bar/img0.jpeg" />' +
                            '  <img id="image-1" data-optimus-lazy-src="https://www.foo.bar/img1.jpeg" />' +
                            '  <img id="image-2" data-optimus-lazy-src="https://www.foo.bar/img2.jpeg" />' +
                            '  <img id="image-3" data-optimus-lazy-src="https://www.foo.bar/img3.jpeg" />' +
                            '  <div class="indicators">' +
                            '   <div class="optimusIMG-carousel--toggle-btn" data-optimus-img-index="0">0</div>' +
                            '   <div class="optimusIMG-carousel--toggle-btn" data-optimus-img-index="1">1</div>' +
                            '   <div class="optimusIMG-carousel--toggle-btn" data-optimus-img-index="2">2</div>' +
                            '   <div class="optimusIMG-carousel--toggle-btn" data-optimus-img-index="3">3</div>' +
                            '  </div>' +
                            '</div>';
                    });

                    test('new mouseover and touchstart listeners are added to each button', () => {
                        const BTNS: NodeListOf<HTMLElement> =
                            document.querySelectorAll('.optimusIMG-carousel--toggle-btn') as NodeListOf<HTMLElement>;

                        BTNS.forEach((btn: Element) => {
                               btn.removeEventListener = jest.fn();
                               btn.addEventListener = jest.fn();
                        });

                        new LazyLoad();

                        BTNS.forEach((btn: Element) => {
                            expect(btn.addEventListener).toHaveBeenCalledTimes(3);
                            expect(btn.removeEventListener).toHaveBeenCalledTimes(3);

                            expect(btn.addEventListener).toBeCalledWith('mouseover', expect.any(Function));
                            expect(btn.removeEventListener).toBeCalledWith('mouseover', expect.any(Function));
                            expect(btn.addEventListener).toBeCalledWith('mousedown', expect.any(Function));
                            expect(btn.removeEventListener).toBeCalledWith('mousedown', expect.any(Function));
                            expect(btn.addEventListener).toBeCalledWith('touchstart', expect.any(Function));
                            expect(btn.removeEventListener).toBeCalledWith('touchstart', expect.any(Function));
                        });
                    });

                    test('event listeners do not get duplicated when executing lazy load multiple times', () => {
                        console.warn = jest.fn();
                        const BTN: HTMLElement =
                            document.querySelector('.optimusIMG-carousel--toggle-btn') as HTMLElement;
                        BTN.removeAttribute('data-optimus-img-index');

                        const LAZY_LOAD: LazyLoad = new LazyLoad();
                        Object.defineProperty(LAZY_LOAD, '_cachedLazyLoadRef', {value: undefined});
                        LAZY_LOAD.execute();
                        LAZY_LOAD.execute();
                        LAZY_LOAD.execute();
                        new LazyLoad();
                        new LazyLoad();

                        BTN.dispatchEvent(new Event('mouseover'));

                        expect(console.warn).toHaveBeenCalledTimes(1);
                    });

                    test('console warning is triggered if image index is undefined', () => {
                        const BTN: HTMLElement = document.querySelector('.optimusIMG-carousel--toggle-btn') as HTMLElement;
                        BTN.removeAttribute('data-optimus-img-index');
                        console.warn = jest.fn();

                        new LazyLoad();

                        BTN.dispatchEvent(new Event('mouseover'));

                        expect(console.warn).toBeCalledWith(consoleMessage('toggle button is missing data-optimus-img-index property'), BTN);
                    });

                    test('image with correct index gets loaded in case index is a number', () => {
                        const BTN: HTMLElement = document.querySelector('.optimusIMG-carousel--toggle-btn') as HTMLElement;
                        BTN.setAttribute('data-optimus-img-index', '3');
                        const IMAGES: NodeListOf<HTMLImageElement> = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>;

                        new LazyLoad();

                        expect(IMAGES[3].getAttribute('data-optimus-loaded')).toEqual(null);

                        BTN.dispatchEvent(new Event('mouseover'));

                        expect(IMAGES[3].getAttribute('data-optimus-loaded')).toEqual('true');
                    });

                    describe('next index', () => {
                        test('next image gets loaded if currently visible image is not last', () => {
                            const BTN: HTMLElement = document.querySelector('.optimusIMG-carousel--toggle-btn') as HTMLElement;
                            BTN.setAttribute('data-optimus-img-index', 'next');
                            const IMAGES: NodeListOf<HTMLImageElement> = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
                            IMAGES[2].getBoundingClientRect = jest.fn().mockReturnValue({height: 350});

                            new LazyLoad();

                            expect(IMAGES[3].getAttribute('data-optimus-loaded')).toEqual(null);

                            BTN.dispatchEvent(new Event('mouseover'));

                            expect(IMAGES[3].getAttribute('data-optimus-loaded')).toEqual('true');
                        });

                        test('no exceptions if currently visible image is last', () => {
                            const BTN: HTMLElement = document.querySelector('.optimusIMG-carousel--toggle-btn') as HTMLElement;
                            BTN.setAttribute('data-optimus-img-index', 'next');
                            const IMAGES: NodeListOf<HTMLImageElement> = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
                            IMAGES[3].getBoundingClientRect = jest.fn().mockReturnValue({height: 350});

                            new LazyLoad();

                            BTN.dispatchEvent(new Event('mouseover'));

                            expect(IMAGES[0].getAttribute('data-optimus-loaded')).toEqual('true');
                        });
                    });

                    describe('previous index', () => {
                        test('previous image gets loaded if currently visible image is not first', () => {
                            const BTN: HTMLElement = document.querySelector('.optimusIMG-carousel--toggle-btn') as HTMLElement;
                            BTN.setAttribute('data-optimus-img-index', 'previous');
                            const IMAGES: NodeListOf<HTMLImageElement> = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
                            IMAGES[2].getBoundingClientRect = jest.fn().mockReturnValue({height: 350});

                            new LazyLoad();

                            expect(IMAGES[1].getAttribute('data-optimus-loaded')).toEqual(null);

                            BTN.dispatchEvent(new Event('touchstart'));

                            expect(IMAGES[1].getAttribute('data-optimus-loaded')).toEqual('true');
                        });

                        test('last image gets loaded if currently visible image is first', () => {
                            const BTN: HTMLElement = document.querySelector('.optimusIMG-carousel--toggle-btn') as HTMLElement;
                            BTN.setAttribute('data-optimus-img-index', 'previous');
                            const IMAGES: NodeListOf<HTMLImageElement> = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
                            IMAGES[0].getBoundingClientRect = jest.fn().mockReturnValue({height: 350});

                            new LazyLoad();

                            expect(IMAGES[3].getAttribute('data-optimus-loaded')).toEqual(null);

                            BTN.dispatchEvent(new Event('touchstart'));

                            expect(IMAGES[3].getAttribute('data-optimus-loaded')).toEqual('true');
                        });
                    });
                });
            });

            describe('optimus interval not defined', () => {
                beforeEach(() => {
                    console.warn = jest.fn();

                    document.body.innerHTML =
                        '<div id="carousel-0" class="optimusIMG-carousel">' +
                        '  <img id="image-0" data-optimus-lazy-src="https://www.foo.bar/img0.jpeg" />' +
                        '  <img id="image-1" data-optimus-lazy-src="https://www.foo.bar/img1.jpeg" />' +
                        '  <img id="image-2" data-optimus-lazy-src="https://www.foo.bar/img2.jpeg" />' +
                        '</div>';
                });

                test('all images get added immediately if optimus interval is not defined', () => {
                    const IMG_0: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                    const IMG_1: HTMLImageElement = document.getElementById('image-1') as HTMLImageElement;
                    const IMG_2: HTMLImageElement = document.getElementById('image-2') as HTMLImageElement;

                    new LazyLoad();

                    expect(IMG_0.src).toEqual('https://www.foo.bar/img0.jpeg');
                    expect(IMG_1.src).toEqual('https://www.foo.bar/img1.jpeg');
                    expect(IMG_2.src).toEqual('https://www.foo.bar/img2.jpeg');
                });

                test('console warning is triggered', () => {
                    const CAROUSEL: HTMLElement = document.getElementById('carousel-0') as HTMLElement;

                    new LazyLoad();

                    expect(console.warn).toBeCalledWith(consoleMessage('carousel is missing data-optimus-interval property'), CAROUSEL);
                });

            });
        });
    });

    describe('custom configuration', () => {
        describe('images', () => {
            afterEach(() => {
                document.querySelectorAll = QUERY_SELECTOR_ALL;
            });

            const CUSTOM_CONFIG: ILazyLoad = {
                className: 'customClass',
            };

            const LAZY_LOAD: LazyLoad = new LazyLoad(CUSTOM_CONFIG);

            beforeEach(() => {
                document.body.innerHTML =
                    '<img id="image-0" class="customClass" data-optimus-lazy-src="https://www.foo.bar/img0.jpeg" />' +
                    '<img id="image-1" class="customClass" data-optimus-lazy-src="https://www.foo.bar/img1.jpeg" />' +
                    '<img id="image-2" class="customClass" data-optimus-lazy-src="https://www.foo.bar/img2.jpeg" />' +
                    '<img id="image-3" class="customClass" data-optimus-lazy-src="https://www.foo.bar/img3.jpeg" />';
            });

            test('images near or in view get loaded immediately', () => {
                document.querySelectorAll = jest.fn().mockReturnValue(document.querySelectorAll('img'));
                LAZY_LOAD.execute();

                expect(document.querySelectorAll).toBeCalledWith('img.customClass');
            });

            test('images which werent loaded yet get analysed for loading on scrolling', () => {
                document.querySelectorAll = QUERY_SELECTOR_ALL;
                document.querySelectorAll = jest.fn().mockReturnValue(document.querySelectorAll('img'));
                LAZY_LOAD.execute();

                document.dispatchEvent(new Event('scroll'));

                expect(document.querySelectorAll).toBeCalledWith('img.customClass:not([data-optimus-loaded="true"])');
            });
        });

        describe('carousels', () => {
            afterEach(() => {
                document.querySelectorAll = QUERY_SELECTOR_ALL;
            });

            const CUSTOM_CONFIG: ILazyLoad = {
                carouselClassName: 'customClass',
            };

            beforeEach(() => {
                document.body.innerHTML =
                    '<div id="carousel-0" class="customClass" data-optimus-interval="5000">' +
                    '  <img id="image-0" data-optimus-lazy-src="https://www.foo.bar/img0.jpeg" />' +
                    '  <img id="image-1" data-optimus-lazy-src="https://www.foo.bar/img1.jpeg" />' +
                    '  <img id="image-2" data-optimus-lazy-src="https://www.foo.bar/img2.jpeg" />' +
                    '  <img id="image-3" data-optimus-lazy-src="https://www.foo.bar/img3.jpeg" />' +
                    '</div>';
            });

            test('the first image in each carousel gets loaded immediately', () => {
                document.body.innerHTML =
                    '<div id="carousel-0" class="customClass" data-optimus-interval="5000">' +
                    '  <img id="image-0" data-optimus-lazy-src="https://www.foo.bar/img0.jpeg" />' +
                    '  <img id="image-1" data-optimus-lazy-src="https://www.foo.bar/img1.jpeg" />' +
                    '  <img id="image-2" data-optimus-lazy-src="https://www.foo.bar/img2.jpeg" />' +
                    '  <img id="image-3" data-optimus-lazy-src="https://www.foo.bar/img3.jpeg" />' +
                    '</div>' +
                    '<div id="carousel-1" class="customClass" data-optimus-interval="5000">' +
                    '  <img id="image-4" data-optimus-lazy-src="https://www.foo.bar/img4.jpeg" />' +
                    '  <img id="image-5" data-optimus-lazy-src="https://www.foo.bar/img5.jpeg" />' +
                    '  <img id="image-6" data-optimus-lazy-src="https://www.foo.bar/img6.jpeg" />' +
                    '  <img id="image-7" data-optimus-lazy-src="https://www.foo.bar/img7.jpeg" />' +
                    '</div>';

                const IMG_0: HTMLImageElement = document.getElementById('image-0') as HTMLImageElement;
                const IMG_1: HTMLImageElement = document.getElementById('image-1') as HTMLImageElement;
                const IMG_2: HTMLImageElement = document.getElementById('image-2') as HTMLImageElement;
                const IMG_3: HTMLImageElement = document.getElementById('image-3') as HTMLImageElement;

                const IMG_4: HTMLImageElement = document.getElementById('image-4') as HTMLImageElement;
                const IMG_5: HTMLImageElement = document.getElementById('image-5') as HTMLImageElement;
                const IMG_6: HTMLImageElement = document.getElementById('image-6') as HTMLImageElement;
                const IMG_7: HTMLImageElement = document.getElementById('image-7') as HTMLImageElement;

                new LazyLoad(CUSTOM_CONFIG);

                expect(IMG_0.src).toEqual('https://www.foo.bar/img0.jpeg');
                expect(IMG_1.src).toEqual('');
                expect(IMG_2.src).toEqual('');
                expect(IMG_3.src).toEqual('');

                expect(IMG_4.src).toEqual('https://www.foo.bar/img4.jpeg');
                expect(IMG_5.src).toEqual('');
                expect(IMG_6.src).toEqual('');
                expect(IMG_7.src).toEqual('');
            });

        });
    });
});
/* tslint:enable no-unused-expression */
