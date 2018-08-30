import { HtmlElementsHelpers } from './helpers/html_elements.helpers';
import { IProgressiveImageConfig } from './interfaces/progressive_load.interface';
import { InjectCSS } from './inject_css';

export const PROGRESSIVE_IMAGE_CONFIG: IProgressiveImageConfig = {
    className: 'optimusIMG-progressive-image',
    wrapperClassName: 'optimusIMG-progressive-wrapper',
    wrapperClassLoadedName: 'optimusIMG-progressive-wrapper--loaded',
    srcIdentifier: '-OptimusIMG-progressive',
};

export default class ProgressiveLoad {
    public static execute(): void {
        InjectCSS.execute();
        this.checkProgressiveImages();
    }

    public static loadProgressiveImage(image: HTMLImageElement): void {
        InjectCSS.execute();

        if (image.src.includes(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier)) {
            const WRAPPER: HTMLElement = HtmlElementsHelpers.wrapImage(image, PROGRESSIVE_IMAGE_CONFIG.wrapperClassName);
            const HIGH_RES_IMAGE: HTMLImageElement = image.cloneNode() as HTMLImageElement;
            HIGH_RES_IMAGE.src = HIGH_RES_IMAGE.src.replace(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier, '');
            HIGH_RES_IMAGE.setAttribute('data-optimus-lazy-src', HIGH_RES_IMAGE.src);
            HIGH_RES_IMAGE.className += ' ' +  PROGRESSIVE_IMAGE_CONFIG.className;
            WRAPPER.appendChild(HIGH_RES_IMAGE);

            HIGH_RES_IMAGE.addEventListener('load', this.progressiveImageLoaded);
        }
    }

    private static checkProgressiveImages(): void {
        const IMAGES: NodeListOf<HTMLImageElement> =
            document.querySelectorAll('[src*="' + PROGRESSIVE_IMAGE_CONFIG.srcIdentifier + '"]') as NodeListOf<HTMLImageElement>;

        IMAGES.forEach((image: HTMLImageElement) => {
            if (!HtmlElementsHelpers.getSiblings(image, 'img.' + PROGRESSIVE_IMAGE_CONFIG.className).length) {
                this.loadProgressiveImage(image);
            }
        });
    }

    private static progressiveImageLoaded = (ev: Event): void => {
        const TARGET: HTMLImageElement = ev.target as HTMLImageElement;
        TARGET.removeEventListener('load', ProgressiveLoad.progressiveImageLoaded);

        if (TARGET.parentElement) {
            TARGET.parentElement.className += ' ' + PROGRESSIVE_IMAGE_CONFIG.wrapperClassLoadedName;
        }

        setTimeout(() => {
            HtmlElementsHelpers.unwrapImage(TARGET);
            TARGET.className = TARGET.className.replace(' ' + PROGRESSIVE_IMAGE_CONFIG.className, '');
        }, 500);
    }
}
