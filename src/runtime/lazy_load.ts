import { ILazyLoad, ILazyLoadCarouselInterval } from './interfaces/lazy_load.interface';
import { consoleMessage } from './helpers/console.helpers';

export default class LazyLoad {
    constructor(configuration?: ILazyLoad) {
        if (configuration) {
            this._configuration = {...this._configuration, ...configuration};
        }

        this.execute();
    }

    private readonly _configuration: ILazyLoad = {
        enable: true,
        className: 'optimusIMG',
        carouselClassName: 'optimusIMG-carousel',
    };

    private _carouselIntervals: ILazyLoadCarouselInterval[] = [];

    public execute(): void {
        this._carouselIntervals.forEach((interval: ILazyLoadCarouselInterval) => window.clearInterval(interval.uuid));
        this._carouselIntervals = [];
        this.images();
        this.carousels();
    }

    private images(): void {
        const SELECTOR: string = 'img.' + this._configuration.className;
        const IMAGES: NodeListOf<HTMLImageElement> = document.querySelectorAll(SELECTOR) as NodeListOf<HTMLImageElement>;

        this.loadImagesNearOrInView(IMAGES, true);

        const LOAD_IMAGES: any = (): void => this.loadImagesBeingScrolledInView();

        // Prevent multiple scroll event listeners being attached in case lazy load is enabled in an SPA environment
        document.removeEventListener('scroll', LOAD_IMAGES);
        document.addEventListener('scroll', LOAD_IMAGES, {passive: true});
    }

    private carousels(): void {
        const SELECTOR: string = '.' + this._configuration.carouselClassName;
        const CAROUSEL: NodeListOf<HTMLElement> = document.querySelectorAll(SELECTOR);

        CAROUSEL.forEach((carousel: HTMLElement, index: number) => {
            const IMAGES: NodeListOf<HTMLImageElement> = carousel.querySelectorAll('img') as NodeListOf<HTMLImageElement>;

            if (carousel.getAttribute('data-optimus-interval') !== null) {
                const INTERVAL_TIME: number = parseInt(carousel.getAttribute('data-optimus-interval') as string, 10);
                this.addLoadedPropertiesToImage(IMAGES[0]);

                const INTERVAL: number = window.setInterval(() => {
                    const IMG: HTMLImageElement | null = carousel.querySelector('img:not([data-optimus-loaded="true"])');

                    if (IMG) {
                        this.addLoadedPropertiesToImage(IMG);
                    } else {
                        const IVAL: ILazyLoadCarouselInterval = this._carouselIntervals
                            .find((interval: ILazyLoadCarouselInterval) => interval.key === index) as ILazyLoadCarouselInterval;

                        window.clearInterval(IVAL.uuid);

                        // Remove interval from the list of existing intervals.
                        this._carouselIntervals = this._carouselIntervals.filter((interval: ILazyLoadCarouselInterval) => interval.key !== index);
                    }

                }, INTERVAL_TIME - 1000);

                this._carouselIntervals.push({key: index, uuid: INTERVAL});
            } else {
                console.warn(consoleMessage('carousel is missing data-optimus-interval property'), carousel);

                IMAGES.forEach((image: HTMLImageElement) => {
                    this.addLoadedPropertiesToImage(image);
                });
            }
        });
    }

    private loadImagesBeingScrolledInView(): void {
        const SELECTOR: string = 'img.' + this._configuration.className + ':not([data-optimus-loaded="true"])';
        const IMAGES: NodeListOf<HTMLImageElement> = document.querySelectorAll(SELECTOR) as NodeListOf<HTMLImageElement>;

        if (IMAGES.length > 0) {
            this.loadImagesNearOrInView(IMAGES, false);
        }
    }

    private loadImagesNearOrInView(images: NodeListOf<HTMLImageElement>, initialLoad: boolean): void {
        const MARGIN: number = initialLoad ? 300 : 100;

        const VISIBLE_AREA: {[position: string]: number} = {
            topEdge: window.scrollY - MARGIN,
            bottomEdge: window.innerHeight + window.scrollY + MARGIN,
        };

        images.forEach((image: HTMLImageElement) => {
            const IMAGE_POS_Y_TOP: number = image.getBoundingClientRect().top + window.scrollY;
            const IMAGE_POS_Y_BOTTOM: number = image.getBoundingClientRect().bottom + window.scrollY;

            // Load all images that are already on the screen or near the screen edge immediately
            if (VISIBLE_AREA.topEdge < IMAGE_POS_Y_BOTTOM && IMAGE_POS_Y_TOP < VISIBLE_AREA.bottomEdge) {
                this.addLoadedPropertiesToImage(image);
            }
        });
    }

    private addLoadedPropertiesToImage(image: HTMLImageElement): void {
        image.src = image.getAttribute('data-optimus-lazy-url') as string;
        image.setAttribute('data-optimus-loaded', 'true');
    }
}
