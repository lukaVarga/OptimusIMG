export interface IImageSourceResponsiveness {
    valid: boolean;
    faults?: IImageSourceResponsivenessFault[];
}

export interface IImageSourceResponsivenessFault {
    attribute_name: 'srcset' | 'sizes';
    fault: IImageSourceResponsivenessAttributeFault;
}

export type IImageSourceResponsivenessAttributeFault = 'missing' | 'value_format' | 'one_size_only';
