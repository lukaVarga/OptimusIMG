import { consoleMessage } from '../../../src/runtime/helpers/console.helpers';

test('consoleMessage', () => {
    expect(consoleMessage('test')).toEqual('OptimusIMG: test')
});
