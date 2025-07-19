import { SupaDupaJettonMaster } from './contracts/SupaDupaJetton';
import { TestsRunner } from './testRunner';

async function registerTokens(testsRunner: TestsRunner) {
  console.debug('Registering tokens');
  await testsRunner.registerToken(SupaDupaJettonMaster);
}

async function runTests(testsRunner: TestsRunner) {
  console.debug('Running tests');
  await testsRunner.run();
}

async function buildReport(testsRunner: TestsRunner) {
  console.debug('Building report');
  // TODO
}

async function main() {
  console.info('Starting');

  const testsRunner = new TestsRunner();
  await registerTokens(testsRunner);

  await runTests(testsRunner);

  await buildReport(testsRunner);
}

main();
