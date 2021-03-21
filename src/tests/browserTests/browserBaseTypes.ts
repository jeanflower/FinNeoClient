import { log, printDebug } from '../../utils';
import webdriver, { ThenableWebDriver, Key } from 'selenium-webdriver';

export function allowExtraSleeps() {
  if (
    process.env.REACT_APP_SERVER_URL_NOT_SECRET ===
    'http://localhost:3001/finneo/'
  ) {
    // log(`don't need extra sleeps`);
    return false;
  }
  // log(`do need extra sleeps to get data`);
  return true;
}

export const serverUri = 'https://localhost:3000/#';

export const dBSleep = 1500; // time to round trip through DB
const shortSleep = 200;

export function getDriver(headless: boolean) {
  // from
  // https://jakebinstein.com/blog/how-to-set-browser-capabilities-in-webdriverjs-example-headless-mode/

  // User-set variables
  const browserName = 'chrome'; // Switch to 'firefox' if desired
  const capabilityName = 'goog:chromeOptions'; // Switch to 'moz:firefoxOptions' if desired

  // Set up the commandline options for launching the driver.
  // In this example, I'm using various headless options.
  const browserOptions = {
    args: ['--disable-gpu', '--no-sandbox'],
  };
  if (headless) {
    browserOptions.args.unshift('--headless');
  }
  // Set up the browser capabilities.
  // Some lines could be condensed into one-liners if that's your preferred style.
  let browserCapabilities =
    browserName === 'chrome'
      ? webdriver.Capabilities.chrome()
      : webdriver.Capabilities.firefox();
  browserCapabilities = browserCapabilities.set(capabilityName, browserOptions);
  const builder = new webdriver.Builder().forBrowser(browserName);
  const driver = builder.withCapabilities(browserCapabilities).build();

  return driver;
}

export function bugSleep(message: string) {
  if (printDebug()) {
    log(`sleep for a long time: ${message}`);
  }
  return new Promise(resolve => setTimeout(resolve, 10000));
}

// Use sleeps to hack page-not-yet-ready issues. TODO : do better.
function sleep(ms: number, message: string) {
  if (printDebug()) {
    log(`sleep for ${ms}ms: ${message}`);
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function gotoHomePage(driver: ThenableWebDriver) {
  const btnHome = await driver.findElements(webdriver.By.id('btn-Home'));
  // log(`btnMms.length = ${btnMms.length}`);
  expect(btnHome.length === 1).toBe(true);
  await btnHome[0].click();
  if (allowExtraSleeps()) {
    await sleep(shortSleep, '--- on home page');
  }
}

export async function clickButton(driver: ThenableWebDriver, id: string) {
  const btn = await driver.findElements(webdriver.By.id(id));
  if (btn.length !== 1) {
    log(`found ${btn.length} elements with id=${id}`);
  }
  expect(btn.length === 1).toBe(true);
  await btn[0].click();
}


export async function scrollIntoViewByID(
  driver: ThenableWebDriver,
  id: string,
) {
  const input = await driver.findElements(webdriver.By.id(id));
  if (input.length !== 1) {
    log(`found ${input.length} elements with id=${id}`);
  }
  expect(input.length === 1).toBe(true);

  await driver.executeScript('arguments[0].scrollIntoView(true);', input[0]);
  await driver.executeScript('window.scrollBy(0, -5000)');
}


export async function beforeAllWork(
  driver: ThenableWebDriver,
) {
  jest.setTimeout(1000000); // allow time for all these tests to run

  await driver.get('about:blank');
  await driver.get(serverUri);
  if (allowExtraSleeps()) {
    await sleep(
      1500, // was calcSleep twice
      '--- after browser loads URI',
    );
  }

  // Handle errors around SSL certificates
  // push through "Advanced" and "Proceed"
  let x = await driver.findElements(webdriver.By.id('details-button'));
  if (x[0] !== undefined) {
    // console.log('found details button!');
    await x[0].click();
    x = await driver.findElements(webdriver.By.id('proceed-link'));
    if (x[0] !== undefined) {
      // console.log('found proceed link!');
      await x[0].click();
    }
  }

  await clickButton(driver, 'buttonTestLogin');
  await clickButton(driver, 'btn-Home');

}

export async function cleanUpWork(
  driver: ThenableWebDriver,
) {
  await gotoHomePage(driver);

  return new Promise<void>(async resolve => {
    // log(`in clean up model`);
    // log(`go seek model_input name`);
    // log(`seek btn-${testDataModelName}`);

    await clickButton(driver, 'btn-Home');

    resolve();
  });
}

// click something to refresh page // hack!
export async function refreshPage(
  driver: ThenableWebDriver,
) {
  // log('in refreshPage');
  await clickButton(driver, 'btn-Home');
}

