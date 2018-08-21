import HtmlElementsCheck from '../html_elements_check';
import { IHtmlElementsCheck } from './html_elements_check.interface';

type IElementsCheckFunc = (configuration?: IHtmlElementsCheck) => HtmlElementsCheck;

export interface IRuntime {
    ElementsCheck: IElementsCheckFunc;
}
