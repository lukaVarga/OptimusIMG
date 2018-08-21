import HtmlElementsCheck from './html_elements_check';
import { IHtmlElementsCheck } from './interfaces/html_elements_check.interface';
import { IRuntime } from './interfaces/runtime.interface';

export const RUNTIME: IRuntime = {
    ElementsCheck: (configuration?: IHtmlElementsCheck): HtmlElementsCheck => new HtmlElementsCheck(configuration),
};
