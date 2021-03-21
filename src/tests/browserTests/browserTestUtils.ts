import { ThenableWebDriver } from 'selenium-webdriver';
import {
  clickButton,
  scrollIntoViewByID,
} from './browserBaseTypes';

import webdriver from 'selenium-webdriver';
import { printDebug } from '../../utils';

// switch these values if you want to debug
// one of these tests and see the Chrome window
// alive
// export const headless = true;
export const quitAfterAll = true;
export const headless = false;
// export const quitAfterAll = false;

export async function alertIsShowing(
  driver: webdriver.ThenableWebDriver,
): Promise<boolean> {
  try {
    await driver.switchTo().alert();
    return true;
  } catch (err) {
    // try
    return false;
  } // catch
} // isAlertPresent()

export async function acceptAnyAlert(
  driver: webdriver.ThenableWebDriver,
): Promise<boolean> {
  try {
    await driver
      .switchTo()
      .alert()
      .accept();
    return true;
  } catch (err) {
    // try
    return false;
  } // catch
} // isAlertPresent()

export async function dismissAnyAlert(
  driver: webdriver.ThenableWebDriver,
): Promise<boolean> {
  try {
    await driver
      .switchTo()
      .alert()
      .dismiss();
    return true;
  } catch (err) {
    // try
    return false;
  } // catch
} // isAlertPresent()

export async function consumeAlert(
  message: string,
  accept: boolean,
  driver: webdriver.ThenableWebDriver,
) {
  expect(
    await driver
      .switchTo()
      .alert()
      .getText(),
  ).toBe(message);
  if (accept) {
    await driver
      .switchTo()
      .alert()
      .accept();
  } else {
    await driver
      .switchTo()
      .alert()
      .dismiss();
  }
}
export async function checkMessage(driver: ThenableWebDriver, message: string) {
  const label = await driver.findElements(webdriver.By.id('pageTitle'));
  expect(label.length === 1).toBe(true);
  const labelText = await label[0].getText();
  expect(labelText).toBe(message);

  const btn = await driver.findElements(webdriver.By.id('btn-clear-alert'));
  if (btn.length !== 0) {
    await btn[0].click();
  }
}
