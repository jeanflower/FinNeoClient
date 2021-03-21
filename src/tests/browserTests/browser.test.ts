import {
  headless,
  quitAfterAll,
} from './browserTestUtils';
import {
  getDriver,
  beforeAllWork,
  cleanUpWork,
} from './browserBaseTypes';

const debug = false;
const testDataModelName = 'BrowserTestSimple';

let alreadyRunning = false;

describe(testDataModelName, () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver(headless);
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;

  it('should load the home page and get title', () =>
    new Promise<void>(async resolve => {
      await beforeAllWork(
        driver,
      );

      const title = await driver.getTitle();
      expect(title).toEqual(`FinNeo`);
      await cleanUpWork(driver);

      resolve();
    })
  );

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
