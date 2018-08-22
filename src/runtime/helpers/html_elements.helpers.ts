import {
    IImageSourceResponsiveness,
    IImageSourceResponsivenessAttributeFault,
    IImageSourceResponsivenessFault,
} from './interfaces/html_elements.helpers.interface';

export class HtmlElementsHelpers {
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
