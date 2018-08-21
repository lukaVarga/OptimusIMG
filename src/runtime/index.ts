import HtmlElementsCheck from './html_elements_check';
import { IRuntime } from './interfaces/runtime.interface';

export const RUNTIME: IRuntime = {
    ElementsCheck: new HtmlElementsCheck(),
};
