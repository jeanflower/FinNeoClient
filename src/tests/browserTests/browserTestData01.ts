import {
  CASH_ASSET_NAME,
  incomeTax,
  roiEnd,
  roiStart,
} from '../../stringConstants';
import { DbModelData } from '../../types/interfaces';
import { setSetting, makeDateFromString } from '../../utils';
import { browserTestSettings } from './browserBaseTypes';
import {
  simpleAsset,
  simpleExpense,
  simpleIncome,
  simpleTransaction,
} from './../../types/simple';

export function getTestModel01() {
  const model: DbModelData = {
    expenses: [
      {
        ...simpleExpense,
        NAME: 'Look after dogs',
        VALUE: '500',
        VALUE_SET: '1 April 2018',
        START: '1 April 2018',
        END: '2 February 2047',
        GROWTH: '2',
        CATEGORY: 'living costs',
      },
      {
        ...simpleExpense,
        NAME: 'Run car',
        VALUE: '700',
        VALUE_SET: '1 April 2018',
        START: '1 April 2018',
        END: 'GetRidOfCar',
        GROWTH: '5',
        CATEGORY: 'living costs',
      },
      {
        ...simpleExpense,
        NAME: 'Run house',
        VALUE: '1300',
        VALUE_SET: '1 April 2018',
        START: '1 April 2018',
        END: '2 February 2099',
        GROWTH: '2',
        CATEGORY: 'living costs',
      },
    ],
    incomes: [
      {
        ...simpleIncome,
        NAME: 'Main income',
        VALUE: '3500',
        VALUE_SET: '1 March 2018',
        START: '1 March 2018',
        END: 'StopMainWork',
        GROWTH: '2',
        LIABILITY: `${incomeTax}Joe`,
      },
    ],
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        START: 'December 2017',
        VALUE: '2000',
      },
      {
        ...simpleAsset,
        NAME: 'Stocks',
        START: 'December 2017',
        VALUE: '4000',
        GROWTH: 'stockMarketGrowth',
        CATEGORY: 'stock',
      },
      {
        ...simpleAsset,
        NAME: 'ISAs',
        START: 'December 2019',
        VALUE: '2000',
        GROWTH: 'stockMarketGrowth',
        CATEGORY: 'stock',
      },
      {
        ...simpleAsset,
        NAME: 'EarlyMortgage',
        START: '1 January 2018',
        VALUE: '-234000', // how much was borrowed
        GROWTH: '2.33', // good rate for early part of deal (excl cpi)
        CATEGORY: 'mortgage',
      },
      {
        ...simpleAsset,
        NAME: 'LateMortgage',
        START: '1 January 2018',
        GROWTH: '4.66', // after rate goes up (excl cpi)
        CATEGORY: 'mortgage',
      },
    ],
    transactions: [
      {
        ...simpleTransaction,
        NAME: 'Each month buy food',
        FROM: CASH_ASSET_NAME,
        FROM_VALUE: '200',
        DATE: 'January 2 2018',
        RECURRENCE: '1m',
        CATEGORY: 'living costs',
      },
      {
        ...simpleTransaction,
        NAME: 'Revalue stocks after loss in 2020 market crash',
        TO: 'Stocks',
        TO_ABSOLUTE: true,
        TO_VALUE: '3000',
        DATE: 'January 2 2020',
      },
      {
        ...simpleTransaction,
        NAME: 'SellCar',
        TO: CASH_ASSET_NAME,
        TO_ABSOLUTE: true,
        TO_VALUE: '1000',
        DATE: 'GetRidOfCar',
      },
      {
        ...simpleTransaction,
        NAME: 'switchMortgage', // at a predetermined time, rate switched
        FROM: 'EarlyMortgage',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '1', // all of debt at old rate
        TO: 'LateMortgage',
        TO_ABSOLUTE: false,
        TO_VALUE: '1', // becomes all of debt at new rate
        DATE: 'TransferMortgage',
      },
      {
        ...simpleTransaction,
        NAME: 'Conditional pay early mortgage',
        FROM: CASH_ASSET_NAME,
        FROM_VALUE: '1500', // a regular monthly payment
        TO: 'EarlyMortgage',
        TO_ABSOLUTE: false,
        TO_VALUE: '1', // all of amount paid goes to mortgage
        DATE: '1 January 2018',
        STOP_DATE: 'TransferMortgage',
        RECURRENCE: '1m',
        CATEGORY: 'pay mortgage',
      },
      {
        ...simpleTransaction,
        NAME: 'Conditional pay late mortgage',
        FROM: CASH_ASSET_NAME,
        FROM_VALUE: '1500',
        TO: 'LateMortgage',
        TO_ABSOLUTE: false,
        TO_VALUE: '1',
        DATE: 'TransferMortgage',
        STOP_DATE: '1 January 2040',
        RECURRENCE: '1m',
        CATEGORY: 'pay mortgage',
      },
    ],
    settings: [...browserTestSettings],
    triggers: [
      {
        NAME: 'TransferMortgage',
        DATE: makeDateFromString('Jan 01 2028'),
      },
      {
        NAME: 'StopMainWork',
        DATE: makeDateFromString('Dec 31 2050'),
      },
      {
        NAME: 'GetRidOfCar',
        DATE: makeDateFromString('Dec 31 2025'),
      },
    ],
  };
  setSetting(model.settings, roiStart, '1 Jan 2019');
  setSetting(model.settings, roiEnd, '1 Feb 2019');
  return { model, roi: { start: '1 Jan 2018', end: '1 Fed 2018' } };
}