import { consoleMessage } from '../../../src/runtime/helpers/console';

test('consoleMessage', () => {
    expect(consoleMessage('test')).toEqual('OptimusIMG: test')
});
