export class InjectCSS {
    public static execute(): void {
        if (!document.getElementById('optimusIMG-css')) {
            this.inject();
        }
    }

    private static inject(): void {
        const CSS: HTMLStyleElement = document.createElement('style');
        CSS.id = 'optimusIMG-css';
        CSS.innerHTML =
            '.optimusIMG:not([src*="/"]){opacity: 0 !important;}' +
            '.optimusIMG-progressive-wrapper {overflow: hidden;position: relative;}' +
            '.optimusIMG-progressive-wrapper .optimusIMG-progressive-image {' +
            '  filter: blur(8px);' +
            '  height: 100%;' +
            '  left: 0;' +
            '  opacity: 0;' +
            '  position: absolute;' +
            '  top: 0;' +
            '  width: 100%;' +
            '}' +
            '.optimusIMG-progressive-wrapper img:not(.optimusIMG-progressive-image) {opacity: 1;}' +
            '.optimusIMG-progressive-wrapper.optimusIMG-progressive-wrapper--loaded img {transition: opacity .5s;}' +
            '.optimusIMG-progressive-wrapper.optimusIMG-progressive-wrapper--loaded img:not(.optimusIMG-progressive-image) {opacity: 0;}' +
            '.optimusIMG-progressive-wrapper.optimusIMG-progressive-wrapper--loaded img.optimusIMG-progressive-image {' +
            '  filter: blur(0);' +
            '  opacity: 1;' +
            '  transition: filter .5s, opacity .5s;' +
            '}';

        (document.querySelector('head') as HTMLHeadElement).appendChild(CSS);
    }
}
