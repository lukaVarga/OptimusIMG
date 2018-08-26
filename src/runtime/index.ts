import HtmlElementsCheck from './html_elements_check';
import { IHtmlElementsCheck } from './interfaces/html_elements_check.interface';
import { IRuntime } from './interfaces/runtime.interface';
import { ILazyLoad } from './interfaces/lazy_load.interface';
import LazyLoad from './lazy_load';

export const RUNTIME: IRuntime = {
    LazyLoad: (configuration?: ILazyLoad): LazyLoad => new LazyLoad(configuration),
    HtmlElementsCheck: (configuration?: IHtmlElementsCheck): HtmlElementsCheck => new HtmlElementsCheck(configuration),
};
