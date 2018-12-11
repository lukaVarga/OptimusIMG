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
        const PROGRESSIVE_SRC: string | null = image.getAttribute('data-optimus-high-res-src');
        const PROGRESSIVE_SRCSET: string | null = image.getAttribute('data-optimus-high-res-srcset');

        if (!(image.src.includes(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier) ||
              image.srcset.includes(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier) ||
              !!PROGRESSIVE_SRC ||
              !!PROGRESSIVE_SRCSET) ||
            !!image.closest('.' + PROGRESSIVE_IMAGE_CONFIG.wrapperClassName + ', .' + PROGRESSIVE_IMAGE_CONFIG.wrapperClassLoadedName)) {
            return;
        }

        const IS_PICTURE: boolean = !!(image.parentElement && image.parentElement.tagName === 'PICTURE');

        const WRAPPABLE_ELEMENT: HTMLElement = IS_PICTURE ? image.parentElement as HTMLElement : image;
        const WRAPPER: HTMLElement = HtmlElementsHelpers.wrapImage(WRAPPABLE_ELEMENT, PROGRESSIVE_IMAGE_CONFIG.wrapperClassName);

        const HIGH_RES_IMAGE: HTMLImageElement = image.cloneNode() as HTMLImageElement;

        if (IS_PICTURE) {
            const PICTURE_DUP: HTMLPictureElement = (image.parentElement as HTMLPictureElement).cloneNode(false) as HTMLPictureElement;
            PICTURE_DUP.className += ' ' + PROGRESSIVE_IMAGE_CONFIG.className;

            const SOURCE_SIBLINGS: string =
              'source[srcset*="' + PROGRESSIVE_IMAGE_CONFIG.srcIdentifier + '"], source[data-optimus-high-res-srcset]';

            (HtmlElementsHelpers.getSiblings(image, SOURCE_SIBLINGS) as HTMLSourceElement[])
              .forEach((imageSource: HTMLSourceElement) => {
                  const HIGH_RES_SOURCE: HTMLSourceElement = imageSource.cloneNode() as HTMLSourceElement;

                  if (imageSource.getAttribute('data-optimus-high-res-srcset')) {
                      HIGH_RES_SOURCE.srcset = imageSource.getAttribute('data-optimus-high-res-srcset') as string;
                  } else {
                      HIGH_RES_SOURCE.srcset = imageSource.srcset.replace(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier, '');
                  }

                  PICTURE_DUP.appendChild(HIGH_RES_SOURCE);
              });

            WRAPPER.appendChild(PICTURE_DUP);
        } else {
            HIGH_RES_IMAGE.className += ' ' +  PROGRESSIVE_IMAGE_CONFIG.className;
        }

        if (image.src.includes(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier)) {
            HIGH_RES_IMAGE.src = HIGH_RES_IMAGE.src.replace(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier, '');
        } else if (PROGRESSIVE_SRC) {
            HIGH_RES_IMAGE.src = PROGRESSIVE_SRC;
        }

        if (image.srcset.includes(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier)) {
            HIGH_RES_IMAGE.srcset = HIGH_RES_IMAGE.srcset.replace(PROGRESSIVE_IMAGE_CONFIG.srcIdentifier, '');
        } else if (PROGRESSIVE_SRCSET) {
            HIGH_RES_IMAGE.srcset = PROGRESSIVE_SRCSET;
        }

        if (HIGH_RES_IMAGE.getAttribute('src') && HIGH_RES_IMAGE.getAttribute('data-optimus-lazy-src')) {
            HIGH_RES_IMAGE.setAttribute('data-optimus-lazy-src', HIGH_RES_IMAGE.src);
        }

        if (HIGH_RES_IMAGE.getAttribute('srcset') && HIGH_RES_IMAGE.getAttribute('data-optimus-lazy-srcset')) {
            HIGH_RES_IMAGE.setAttribute('data-optimus-lazy-srcset', HIGH_RES_IMAGE.srcset);
        }

        if (IS_PICTURE) {
            (WRAPPER.querySelector('picture.' + PROGRESSIVE_IMAGE_CONFIG.className) as HTMLPictureElement).appendChild(HIGH_RES_IMAGE);
        } else {
            WRAPPER.appendChild(HIGH_RES_IMAGE);
        }

        HIGH_RES_IMAGE.addEventListener('load', this.progressiveImageLoaded);
    }

    private static checkProgressiveImages(): void {
        const QUERY: string =
            'img[src*="' + PROGRESSIVE_IMAGE_CONFIG.srcIdentifier + '"]:not([data-optimus-progressive-loaded]), '
          + 'img[srcset*="' + PROGRESSIVE_IMAGE_CONFIG.srcIdentifier + '"]:not([data-optimus-progressive-loaded]), '
          + 'img[data-optimus-high-res-src]:not([data-optimus-progressive-loaded]), '
          + 'img[data-optimus-high-res-srcset]:not([data-optimus-progressive-loaded])';

        const IMAGES: NodeListOf<HTMLImageElement> = document.querySelectorAll(QUERY) as NodeListOf<HTMLImageElement>;

        IMAGES.forEach((image: HTMLImageElement) => {
            if (!HtmlElementsHelpers.getSiblings(image, 'img.' + PROGRESSIVE_IMAGE_CONFIG.className).length) {
                this.loadProgressiveImage(image);
            }
        });
    }

    private static progressiveImageLoaded = (ev: Event): void => {
        const TARGET: HTMLImageElement = ev.target as HTMLImageElement;
        TARGET.removeEventListener('load', ProgressiveLoad.progressiveImageLoaded);
        TARGET.setAttribute('data-optimus-progressive-loaded', 'true');

        if (TARGET.parentElement) {
            TARGET.parentElement.className += ' ' + PROGRESSIVE_IMAGE_CONFIG.wrapperClassLoadedName;
        }

        const IS_PICTURE: boolean = !!(TARGET.parentElement && TARGET.parentElement.tagName === 'PICTURE');

        setTimeout(() => {
            HtmlElementsHelpers.unwrapImage(IS_PICTURE ? TARGET.parentElement as HTMLPictureElement : TARGET);

            if (IS_PICTURE) {
                (TARGET.parentElement as HTMLPictureElement).className =
                  (TARGET.parentElement as HTMLPictureElement).className
                    .replace(' ' + PROGRESSIVE_IMAGE_CONFIG.className, '')
                    .replace(' ' + PROGRESSIVE_IMAGE_CONFIG.wrapperClassLoadedName, '');
            }

            TARGET.className = TARGET.className.replace(' ' + PROGRESSIVE_IMAGE_CONFIG.className, '');
        }, 500);
    }
}
