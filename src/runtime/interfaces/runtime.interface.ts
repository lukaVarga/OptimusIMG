import HtmlElementsCheck from '../html_elements_check';
import { IHtmlElementsCheck } from './html_elements_check.interface';
import { ILazyLoad } from './lazy_load.interface';
import LazyLoad from '../lazy_load';

type IElementsCheckFunc = (configuration?: IHtmlElementsCheck) => HtmlElementsCheck;
type ILazyLoadFunc = (configuration?: ILazyLoad) => LazyLoad;

export interface IRuntime {
    LazyLoad: ILazyLoadFunc;
    HtmlElementsCheck: IElementsCheckFunc;
}
