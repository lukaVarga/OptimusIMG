import {
    IImageSourceResponsiveness,
    IImageSourceResponsivenessAttributeFault,
    IImageSourceResponsivenessFault,
} from './interfaces/html_elements.helpers.interface';
import { PROGRESSIVE_IMAGE_CONFIG } from '../progressive_load';

export class HtmlElementsHelpers {
    public static getSiblings(element: HTMLElement, siblingSelector: string): HTMLElement[] {
        const PARENT: HTMLElement = element.parentElement as HTMLElement;
        let list: HTMLElement[] = [];

        if (PARENT) {
            list = list.concat(Array.from(PARENT.querySelectorAll(siblingSelector)));
            return list.filter((sibling: HTMLElement) => sibling !== element && sibling.parentElement === PARENT);
        }

        return [];
    }

    public static wrapImage(image: HTMLImageElement, className: string): HTMLElement {
        const WRAPPER: HTMLElement = document.createElement('div');
        WRAPPER.className = className;
        const PARENT: Node = image.parentNode as Node;
        PARENT.insertBefore(WRAPPER, image);
        WRAPPER.appendChild(image);

        return WRAPPER;
    }

    public static unwrapImage(image: HTMLImageElement): HTMLImageElement | undefined {
        const WRAPPER: HTMLElement = image.parentElement as HTMLElement;

        if (WRAPPER.classList.contains(PROGRESSIVE_IMAGE_CONFIG.wrapperClassName)) {
            const PARENT: Node = WRAPPER.parentNode as Node;

            PARENT.insertBefore(image, WRAPPER);
            PARENT.removeChild(WRAPPER);

            return image;
        } else {
            return undefined;
        }
    }

    public static imageSourceResponsiveness(image: HTMLImageElement | HTMLSourceElement): IImageSourceResponsiveness {
        const FAULTS: IImageSourceResponsivenessFault[] = [];

        const SRCSET_VALIDITY: IImageSourceResponsivenessFault | 'valid' = this.checkImageSourceSRCSET(image);
        const SIZES_VALIDITY: IImageSourceResponsivenessFault | 'valid' = this.checkImageSourceSIZES(image);

        if (SRCSET_VALIDITY !== 'valid') {
            FAULTS.push(SRCSET_VALIDITY);
        }

        if (SIZES_VALIDITY !== 'valid') {
            FAULTS.push(SIZES_VALIDITY);
        }

        if (FAULTS.length === 0) {
            return {valid: true};
        } else {
            return {valid: false, faults: FAULTS};
        }
    }

    public static checkImageSourceSRCSET(image: HTMLImageElement | HTMLSourceElement): IImageSourceResponsivenessFault | 'valid' {
        let FAULT: IImageSourceResponsivenessAttributeFault | undefined;

        if (image.srcset.length === 0) {
            FAULT = 'missing';
        } else if (image.srcset.split(',').length === 1) {
            FAULT = 'one_size_only';
        }

        const REGEX: RegExp = /.*\s\d*[xw]{1}$/;

        if (FAULT === undefined && image.srcset.split(',').some((srcset: string) => !REGEX.test(srcset))) {
            FAULT = 'value_format';
        }

        if (FAULT) {
            return {attribute_name: 'srcset', fault: FAULT};
        } else {
            return 'valid';
        }
    }

    public static checkImageSourceSIZES(image: HTMLImageElement | HTMLSourceElement): IImageSourceResponsivenessFault | 'valid' {
        let FAULT: IImageSourceResponsivenessAttributeFault | undefined;

        if (image.sizes.length === 0) {
            FAULT = 'missing';
        } else if (image.sizes.split(',').length === 1) {
            FAULT = 'one_size_only';
        }

        const REGEX: RegExp = /.*\s\d+((px)|(em)|(rem)|(vw)){1}$/;

        if (FAULT === undefined && image.sizes.split(',').some((size: string) => !REGEX.test(size))) {
            FAULT = 'value_format';
        }

        if (FAULT) {
            return {attribute_name: 'sizes', fault: FAULT};
        } else {
            return 'valid';
        }
    }
}
