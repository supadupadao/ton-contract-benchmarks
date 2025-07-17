import { TestCase } from './base';

export class JettonTransferTest extends TestCase {
  public name: string = 'Jetton Transfer Test';

  protected async setup() {
    console.debug('Preparing for test', this.name);
  }

  protected async test() {
    console.debug('Running test', this.name);
  }
}
