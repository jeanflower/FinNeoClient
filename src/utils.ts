import {
  Setting,
  Trigger,
  ModelData,
  Asset,
  Expense,
  Income,
  Transaction,
} from './types/interfaces';
import {
  chartViewType,
  assetChartFocus,
  allItems,
  birthDate,
  birthDateHint,
  CASH_ASSET_NAME,
  cgt,
  conditional,
  cpi,
  cpiHint,
  crystallizedPension,
  custom,
  constType,
  debtChartFocus,
  expenseChartFocus,
  gain,
  income,
  incomeChartFocus,
  incomeTax,
  monthly,
  moveTaxFreePart,
  nationalInsurance,
  net,
  pension,
  pensionDB,
  pensionSS,
  pensionTransfer,
  revalue,
  roiStart,
  roiStartHint,
  roiEnd,
  roiEndHint,
  separator,
  taxPot,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  transferCrystallizedPension,
  valueFocusDate,
  valueFocusDateHint,
  viewDetail,
  viewFrequency,
  viewType,
} from './localization/stringConstants';

import moment from 'moment';
import { getTestModel } from './models/exampleModels';
import { checkData } from './models/checks';
import { migrateViewSetting } from './App';

let doLog = true;
export function log(obj: string) {
  if (doLog) {
    /* eslint-disable no-console */ // all console calls routed through here
    // tslint:disable-next-line:no-console
    console.log(obj);
    /* eslint-enable no-console */
  }
}
export function suppressLogs() {
  doLog = false;
}
export function unSuppressLogs() {
  doLog = true;
}

export function getCurrentVersion() {
  // return 0; // may not include assets or settings in minimalModel
  // return 1; // may not include expense recurrence, asset/debt,
  //           // asset quantity, transaction and settings types
  // return 2; // could use taxPot as an asset
  // return 3; // doesn't include tax view focus settings
  // return 4; // still includes many view settings
  return 5;
}

// note JSON stringify and back for serialisation is OK but
// breaks dates (and functions too but we don't have these)
function cleanUpDates(modelFromJSON: ModelData): void {
  for (const t of modelFromJSON.triggers) {
    //log(`type of ${t.DATE} = ${typeof t.DATE}`);
    t.DATE = new Date(t.DATE);
    //log(`type of ${t.DATE} = ${typeof t.DATE}`);
  }
  if (modelFromJSON.undoModel) {
    cleanUpDates(modelFromJSON.undoModel);
  }
  if (modelFromJSON.redoModel) {
    cleanUpDates(modelFromJSON.redoModel);
  }
  // log(`cleaned up model assets ${showObj(result.assets)}`);
}

export function makeModelFromJSONString(input: string): ModelData {
  const matches = input.match(/PensionDBC/g);
  if (matches !== null && matches.length > 0) {
    log(`Old string 'PensionDBC' in loaded data!!`);
  }

  let result = JSON.parse(input);
  // log(`parsed JSON and found ${showObj(result)}`);
  if (result.testName !== undefined) {
    // log("this isn't JSON but refers to test data we can look up");
    result = getTestModel(result.testName);
  }

  // log(`loaded model, version =${result.version}`);

  if (result.version === undefined) {
    // log(`missing version, setting as 0`);
    result.version = 0;
  }

  cleanUpDates(result);

  // log(`result from makeModelFromJSON = ${showObj(result)}`);
  return result;
}

export const minimalModel: ModelData = {
  assets: [
    {
      NAME: CASH_ASSET_NAME,
      CATEGORY: '',
      START: '1 Jan 1990',
      VALUE: '0.0',
      QUANTITY: '',
      GROWTH: '0.0',
      CPI_IMMUNE: true,
      CAN_BE_NEGATIVE: true,
      IS_A_DEBT: false,
      LIABILITY: '',
      PURCHASE_PRICE: '0.0',
    },
  ],
  incomes: [],
  expenses: [],
  triggers: [],
  settings: [
    {
      NAME: cpi,
      VALUE: '2.5',
      HINT: cpiHint,
      TYPE: constType,
    },
    {
      NAME: roiStart,
      VALUE: '1 Jan 2017',
      HINT: roiStartHint,
      TYPE: viewType,
    },
    {
      NAME: roiEnd,
      VALUE: '1 Jan 2023',
      HINT: roiEndHint,
      TYPE: viewType,
    },
    {
      NAME: birthDate,
      VALUE: '',
      HINT: birthDateHint,
      TYPE: viewType,
    },
    {
      NAME: valueFocusDate,
      VALUE: '',
      HINT: valueFocusDateHint,
      TYPE: viewType,
    },
  ],
  transactions: [],
  version: getCurrentVersion(),
  undoModel: undefined,
  redoModel: undefined,
};

export function getMinimalModelCopy(): ModelData {
  // log('in getMinimalModelCopy');
  return makeModelFromJSONString(JSON.stringify(minimalModel));
}

const mapForGuessSettingTypeForv2 = new Map([
  [roiEnd, viewType],
  [roiStart, viewType],
  [birthDate, viewType],
  [viewFrequency, viewType],
  [monthly, viewType],
  [viewDetail, viewType],
  [assetChartFocus, viewType],
  [debtChartFocus, viewType],
  [expenseChartFocus, viewType],
  [incomeChartFocus, viewType],
  [chartViewType, viewType],
  [cpi, constType],
]);

function getGuessSettingTypeForv2(name: string) {
  const mapResult = mapForGuessSettingTypeForv2.get(name);
  if (mapResult !== undefined) {
    return mapResult;
  }
  return constType;
}

export const simpleSetting: Setting = {
  NAME: 'NoName',
  VALUE: 'NoValue',
  HINT: 'NoHint',
  TYPE: constType,
};

export const viewSetting: Setting = {
  ...simpleSetting,
  HINT: '',
  TYPE: viewType,
};

const showMigrationLogs = false;

function migrateOldVersions(model: ModelData) {
  if (showMigrationLogs) {
    log(`in migrateOldVersions, model has ${model.settings.length} settings`);
    // log(`in migrateOldVersions, model has ${model.settings.map(showObj)}`);
  }
  if (model.version === 0) {
    // log(`in migrateOldVersions at v0, model has ${model.settings.length} settings`);
    // use getMinimalModelCopy and scan over all settings and assets
    const minimalModel = getMinimalModelCopy();
    minimalModel.settings.forEach(x => {
      if (
        model.settings.filter(existing => {
          return existing.NAME === x.NAME;
        }).length === 0
      ) {
        // log(`model needs insertion of missing data ${showObj(x)}`);
        model.settings.push(x);
        // throw new Error(`inserting missing data ${showObj(x)}`);
      }
    });
    minimalModel.assets.forEach(x => {
      if (
        model.assets.filter(existing => {
          return existing.NAME === x.NAME;
        }).length === 0
      ) {
        //log(`inserting missing data ${showObj(x)}`);
        model.assets.push(x);
        // throw new Error(`inserting missing data ${showObj(x)}`);
      }
    });
    model.version = 1;
  }
  if (model.version === 1) {
    if (showMigrationLogs) {
      log(
        `in migrateOldVersions at v1, model has ${model.settings.length} settings`,
      );
    }
    for (const e of model.expenses) {
      if (e.RECURRENCE === undefined) {
        e.RECURRENCE = '1m';
      }
    }
    for (const a of model.assets) {
      if (a.IS_A_DEBT === undefined) {
        a.IS_A_DEBT = false;
      }
      if (a.QUANTITY === undefined) {
        a.QUANTITY = '';
      }
    }
    for (const t of model.transactions) {
      if (t.TYPE === undefined) {
        t.TYPE = custom;
      }
    }
    for (const s of model.settings) {
      if (s.TYPE === undefined) {
        s.TYPE = getGuessSettingTypeForv2(s.NAME);
      }
    }
    model.version = 2;
  }
  if (model.version === 2) {
    if (showMigrationLogs) {
      log(
        `in migrateOldVersions at v2, model has ${model.assets.length} assets`,
      );
      log(
        `${model.assets.map(x => {
          return x.NAME;
        })}`,
      );
    }
    // remove any asset called taxPot
    let index = model.assets.findIndex(a => {
      return a.NAME === taxPot;
    });
    if (index >= 0) {
      // log(`found taxPot at index = ${index}!`);
      model.assets.splice(index, 1);
      // log(
      //  `${model.assets.map(x => {
      //    return x.NAME;
      //  })}`,
      // );
      // log(
      //  `in migrateOldVersions at v2, model now has ${model.assets.length} assets`,
      // );
    }
    index = model.assets.findIndex(a => {
      return a.NAME === taxPot;
    });
    if (index >= 0) {
      log(`still found taxPot!`);
      model.assets.splice(index, 1);
    }
    model.version = 3;
  }
  if (model.version === 3) {
    if (showMigrationLogs) {
      log(
        `in migrateOldVersions at v3, model has ${model.settings.length} settings`,
      );
    }
    if (
      model.settings.findIndex(x => {
        return x.NAME === taxChartFocusPerson;
      }) === -1
    ) {
      model.settings.push({
        ...viewSetting,
        NAME: taxChartFocusPerson,
        VALUE: allItems,
      });
    }
    if (
      model.settings.findIndex(x => {
        return x.NAME === taxChartFocusType;
      }) === -1
    ) {
      model.settings.push({
        ...viewSetting,
        NAME: taxChartFocusType,
        VALUE: allItems,
      });
    }
    if (
      model.settings.findIndex(x => {
        return x.NAME === taxChartShowNet;
      }) === -1
    ) {
      model.settings.push({
        ...viewSetting,
        NAME: taxChartShowNet,
        VALUE: 'Y',
      });
    }
    model.version = 4;
  }
  if (model.version === 4) {
    if (showMigrationLogs) {
      log(
        `in migrateOldVersions at v4, model has ${model.settings.length} settings`,
      );
    }
    // strip away any settings values which are no longer
    // stored persistently
    const debtChartView = 'Type of view for debt chart';
    const namesForRemoval = [
      viewFrequency,
      chartViewType,
      debtChartView,
      viewDetail,
      assetChartFocus,
      debtChartFocus,
      expenseChartFocus,
      incomeChartFocus,
      taxChartFocusPerson,
      taxChartFocusType,
      taxChartShowNet,
    ];
    namesForRemoval.forEach(name => {
      const idx = model.settings.findIndex(s => {
        return s.NAME === name;
      });
      if (idx >= 0) {
        // log(`setting setting ${name} to value ${model.settings[idx].VALUE}`);
        // When loading in an old model, set the view from the
        // old-style settings data.
        // This only matters for keeping tests passing.
        migrateViewSetting(model.settings[idx]);
        model.settings.splice(idx, 1);
      }
    });
    model.version = 5;
  }
  // log(`model after migration is ${showObj(model)}`);

  // should throw immediately to alert of problems
  if (model.version !== getCurrentVersion()) {
    throw new Error('code not properly handling versions');
  }
}

export function lessThan(a: string, b: string) {
  if (a.toLowerCase() < b.toLowerCase()) {
    return -1;
  }
  if (a.toLowerCase() > b.toLowerCase()) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

export function makeDateFromString(input: string) {
  // special-case parsing for DD/MM/YYYY
  let dateMomentObject = moment(input, 'DD/MM/YYYY');
  let dateObject = dateMomentObject.toDate(); // convert moment.js object to Date object
  if (!Number.isNaN(dateObject.getTime())) {
    // log(`converted ${input} into ${dateObject.toDateString()}`);
    return dateObject;
  }
  dateMomentObject = moment(input, 'DD/MM/YY');
  dateObject = dateMomentObject.toDate(); // convert moment.js object to Date object
  if (!Number.isNaN(dateObject.getTime())) {
    // log(`converted ${input} into ${dateObject.toDateString()}`);
    return dateObject;
  }

  const result = new Date(input);
  // log(`converted ${input} into ${result.toDateString()}`);
  return result;
}

export function printDebug(): boolean {
  return false;
}

export function showObj(obj: number | string | Record<string, any>) {
  return JSON.stringify(obj, null, 4);
}

export function endOfTime() {
  return makeDateFromString('2100');
}

export function getNumberAndWordParts(
  input: string,
): { numberPart: number | undefined; wordPart: string } {
  // strip away any number part from the front of the
  // string
  const re = new RegExp('^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)');
  const numberParts = input.match(re);
  // log(`number parts of ${input} are ${numberParts}`);

  let numberPart = undefined;
  let wordPart = input;
  if (numberParts === null || numberParts.length === 0) {
    // log(`no number part`);
  } else {
    numberPart = parseFloat(numberParts[0]);
    wordPart = input.substring(numberParts[0].length);
    // log(`numberPart = ${numberPart}, wordPart = ${wordPart}`);
  }
  // log(`from ${input}, numberPart = ${numberPart}, wordPart = ${wordPart}`);
  return {
    numberPart: numberPart,
    wordPart: wordPart,
  };
}

export function removeNumberPart(input: string) {
  const parts = getNumberAndWordParts(input);
  if (parts.numberPart === undefined) {
    return undefined;
  } else {
    return parts.wordPart;
  }
}

export function makeIncomeLiabilityFromNameAndNI(name: string, NI: boolean) {
  if (name === '') {
    return '';
  }
  if (name.includes(separator)) {
    console.log(`Error: name ${name} can't contain ${separator}`);
    return '';
  }
  if (NI) {
    return name + incomeTax + separator + name + nationalInsurance;
  } else {
    return name + incomeTax;
  }
}

export function makeIncomeTaxTag(person: string) {
  return person + ' ' + income + ' ' + incomeTax;
}
export function makeNationalInsuranceTag(person: string) {
  return person + ' ' + income + ' ' + nationalInsurance;
}
export function makeNetIncomeTag(person: string) {
  return person + ' ' + income + ' ' + net;
}
export function makeCGTTag(person: string) {
  return person + ' ' + gain + ' ' + cgt;
}
export function makeNetGainTag(person: string) {
  return person + ' ' + gain + ' ' + net;
}
export function deconstructTaxTag(
  tag: string,
): {
  isIncome: boolean;
  isGain: boolean;
  isIncomeTax: boolean;
  isNationalInsurance: boolean;
  isNet: boolean;
  isCGT: boolean;
  person: string;
} {
  const result = {
    isIncome: false,
    isGain: false,
    isIncomeTax: false,
    isNationalInsurance: false,
    isNet: false,
    isCGT: false,
    person: '',
  };
  let s = tag;
  if (s.includes(income)) {
    result.isIncome = true;
    if (s.includes(incomeTax)) {
      result.isIncomeTax = true;
      s = s.substring(0, s.length - incomeTax.length - 1);
    } else if (s.includes(nationalInsurance)) {
      result.isNationalInsurance = true;
      s = s.substring(0, s.length - nationalInsurance.length - 1);
    } else {
      result.isNet = true;
      s = s.substring(0, s.length - net.length - 1);
    }
    s = s.substring(0, s.length - income.length - 1);
  } else {
    result.isGain = true;
    if (s.includes(cgt)) {
      result.isCGT = true;
      s = s.substring(0, s.length - cgt.length - 1);
    } else {
      result.isNet = true;
      s = s.substring(0, s.length - net.length - 1);
    }
    s = s.substring(0, s.length - gain.length - 1);
  }
  result.person = s;
  return result;
}
export function makeBooleanFromString(s: string) {
  const result = s === 'T' || s === 't' || s === 'True' || s === 'true';
  // log(`convert ${s} to boolean and get ${result}`);
  return result;
}

export function makeStringFromBoolean(b: boolean) {
  if (b) {
    return 'T';
  }
  return 'F';
}

export function makeBooleanFromYesNo(input: string) {
  const result = {
    value: true,
    checksOK: true,
  };
  const lcInput = input.toLowerCase();
  if (lcInput === 'y' || lcInput === 'yes') {
    result.value = true;
  } else if (lcInput === 'n' || lcInput === 'no') {
    result.value = false;
  } else {
    result.checksOK = false;
  }
  return result;
}

export function makeYesNoFromBoolean(b: boolean) {
  if (b) {
    return 'Yes';
  }
  return 'No';
}

function isNumber(input: string) {
  const result = {
    value: 0.0,
    checksOK: true,
  };
  const wordAndNumber = getNumberAndWordParts(input);
  if (wordAndNumber.wordPart !== '') {
    // log(`isNumber = false for ${input}; returning ${result}`);
    result.checksOK = false;
    return result;
  }
  const num = parseFloat(input);
  if (num === undefined || Number.isNaN(num)) {
    result.checksOK = false;
    return result;
  }

  result.value = num;
  return result;
}

function isSetting(input: string, settings: Setting[]) {
  const result = {
    value: '',
    numFound: 1,
  };
  const x = settings.filter(pr => pr.NAME === input);
  if (x.length === 1) {
    // log(`got setting ${showObj(result)}`);
    result.value = x[0].VALUE;
  } else {
    result.numFound = x.length;
    if (result.numFound > 1) {
      log(`multiple settings: ${showObj(x)}`);
    }
  }
  return result;
}

export function makeGrowthFromString(input: string, settings: Setting[]) {
  // log(`make growth value from string ${input}`);
  const result = {
    value: '',
    checksOK: true,
  };
  if (input === '') {
    result.checksOK = false;
    return result;
  }
  const parseSetting = isSetting(input, settings);
  if (parseSetting.numFound === 1) {
    result.value = input;
    return result;
  }
  const x = input.replace('%', '');
  const num = isNumber(x);
  if (!num.checksOK) {
    result.checksOK = false;
    return result;
  }
  result.value = `${num.value}`;
  return result;
}

export function makeStringFromGrowth(input: string, settings: Setting[]) {
  // log(`format growth as string; input is ${input}`);
  const parseGrowth = isSetting(input, settings);
  if (parseGrowth.numFound === 1) {
    return input;
  }
  const parseNum = isNumber(input);
  if (parseNum.checksOK) {
    return `${parseFloat(input)}%`;
  }
  return input;
}

export function makeCashValueFromString(input: string) {
  const result = {
    value: 0.0,
    checksOK: true,
  };
  let x = input.replace('£', '');
  x = x.replace(',', '');
  const parseDirectly = isNumber(x);
  if (parseDirectly.checksOK) {
    result.value = parseDirectly.value;
  } else {
    result.checksOK = false;
  }
  // log(`parsing ${input} as cash yields ${showObj(result)}`);
  return result;
}

export function makeQuantityFromString(input: string) {
  const result = {
    value: '',
    checksOK: true,
  };
  if (input.length === 0) {
    return result;
  }
  const parseDirectly = isNumber(input);
  if (parseDirectly.checksOK) {
    if (parseDirectly.value === Math.floor(parseDirectly.value)) {
      result.value = `${parseDirectly.value}`;
    } else {
      result.checksOK = false;
    }
  } else {
    result.checksOK = false;
  }
  // log(`parsing ${input} as quantity yields ${showObj(result)}`);
  return result;
}

export function makeValueAbsPropFromString(input: string) {
  const result = {
    absolute: true,
    value: input,
    checksOK: true,
  };
  if (input === '') {
    result.value = '0.0';
    return result;
  }
  const lastPartForUnits = input.substring(input.length - 6, input.length);
  const numWordSplit = getNumberAndWordParts(input);
  // log(`from ${input}, lastPartForUnits = ${lastPartForUnits}`);
  // log(`from ${input}, numWordSplit = ${showObj(numWordSplit)}`);
  if (lastPartForUnits === ' units') {
    const numberPart = input.substring(0, input.length - 6);
    const num = parseFloat(numberPart);
    if (num !== undefined && !Number.isNaN(num)) {
      result.value = numberPart;
    } else {
      result.checksOK = false;
    }
  } else if (
    numWordSplit.numberPart !== undefined &&
    numWordSplit.wordPart !== '%' &&
    numWordSplit.wordPart !== ''
  ) {
    result.value = input;
    result.checksOK = true;
  } else if (input[input.length - 1] === '%') {
    const numberPart = input.substring(0, input.length - 1);
    const num = parseFloat(numberPart);
    if (num !== undefined && !Number.isNaN(num)) {
      result.absolute = false;
      result.value = `${num / 100.0}`;
    } else {
      result.checksOK = false;
    }
  } else {
    const noCommas = input.replace(',', '');
    const parseNum = isNumber(noCommas);
    if (!parseNum.checksOK) {
      const parseCashValue = makeCashValueFromString(noCommas);
      if (!parseCashValue.checksOK) {
        result.checksOK = false;
      } else {
        result.value = `${parseCashValue.value}`;
      }
    } else {
      result.value = `${parseNum.value}`;
      // parses OK as a number
    }
  }
  // log(`parsing ${input} makes result ${showObj(result)}`);
  return result;
}

export function getStartQuantity(w: string, model: ModelData) {
  // log(`try to get a quantity for ${w}`);
  const a = model.assets.filter(a => {
    return a.NAME === w;
  })[0];
  if (a === undefined) {
    // log(`no matched asset found`);
    return undefined;
  }
  if (a.QUANTITY === '') {
    return undefined;
  }
  const result = parseFloat(a.QUANTITY);
  // log(`getStartQuantity for ${w} is ${result}`);
  return result;
}

export function makeTwoDP(x: number) {
  const result = x.toFixed(2);
  // log(`2dp input = ${x} result = ${result}`);
  return result;
}

export function makeStringFromValueAbsProp(
  value: string,
  absolute: boolean,
  assetName: string,
  model: ModelData,
  tname: string,
) {
  let result = '';
  // log(`value = ${value}`);
  if (value.length === 0) {
    return '0.0';
  } else if (
    !tname.startsWith(revalue) &&
    getStartQuantity(assetName, model) !== undefined
  ) {
    // value should be an integer
    result = value + ' units'; // TODO const string 'units'
  } else if (!absolute) {
    const pcVal = parseFloat(value) * 100;
    let strVal = `${pcVal}`;
    //log(`${strVal.substring(0, strVal.length - 1)}`);
    if (
      strVal.substring(0, strVal.length - 1).endsWith('0000000') ||
      strVal.substring(0, strVal.length - 1).endsWith('9999999')
    ) {
      strVal = makeTwoDP(pcVal);
      if (strVal.endsWith('.00')) {
        strVal = strVal.substring(0, strVal.length - 3);
      } else if (strVal.endsWith('0')) {
        strVal = strVal.substring(0, strVal.length - 1);
      }
    } else {
      strVal = `${pcVal}`;
    }
    result = `${strVal}%`;
  } else {
    result = value;
  }
  // log(`string for ${value} is ${result}`);
  return result;
}
export function makeStringFromCashValue(input: string) {
  // formatting from 34567.23 as £34,567.23
  // log(`formatting ${input} as a cash value`);
  if (input === '') {
    return '';
  }
  let n = parseFloat(input);
  const negative = n < 0;
  if (negative) {
    n *= -1;
  }
  let s = n.toFixed(2);
  if (s.length > 6) {
    s =
      s.substring(0, s.length - 6) + ',' + s.substring(s.length - 6, s.length);
  }
  if (s.length > 10) {
    s =
      s.substring(0, s.length - 10) +
      ',' +
      s.substring(s.length - 10, s.length);
  }
  if (negative) {
    return `-£${s}`;
  } else {
    return `£${s}`;
  }
}
export function makeStringFromFromToValue(input: string) {
  if (input === '') {
    return '';
  }
  if (input.substring(input.length - 6, input.length) === ' units') {
    // TODO
    return input;
  } else if (input[input.length - 1] === '%') {
    return input;
  } else {
    return makeStringFromCashValue(input);
  }
}

export function getMonthlyGrowth(annualPercentage: number) {
  // log(`annual_percentage = ${annualPercentage}`);
  const annualProportion = annualPercentage / 100.0;
  const annualScale = annualProportion + 1.0;
  const logAnnualScale = Math.log(annualScale);
  const monthlyGrowth = Math.exp(logAnnualScale / 12.0) - 1.0;
  // log(`calculated monthly growth = ${monthlyGrowth}`);
  return monthlyGrowth;
}

// returns a date for a trigger, or undefined
function findMatchedTriggerDate(triggerName: string, triggers: Trigger[]) {
  // log('look for '+triggerName+'in '+triggers.map(showObj))
  const matched = triggers.filter(trigger => trigger.NAME === triggerName);
  // log('matched = '+showObj(matched));
  let result = undefined;
  if (matched.length !== 0) {
    result = new Date(matched[0].DATE); // copy
  }
  return result;
}

// returns a date for a trigger or for a date string, or undefined for junk
export function checkTriggerDate(input: string, triggers: Trigger[]) {
  // log('first look for '+input+'in '+showObj(triggers));
  const matched = findMatchedTriggerDate(input, triggers);
  // log('matched = '+showObj(matched));
  let result;
  if (matched !== undefined) {
    result = matched; // copy
  } else {
    const dateTry = makeDateFromString(input);
    if (dateTry.getTime()) {
      result = dateTry;
    } else {
      //log(`BUG : unrecognised date!!! ${input}, `
      // `${showObj(triggers.length)}`);
      result = undefined;
    }
  }
  // log(`date for ${triggerName} is ${result.toDateString()}`);
  return result;
}

// Suppresses any not-understood values and returns new Date()
export function getTriggerDate(triggerName: string, triggers: Trigger[]) {
  // log(`triggers length is ${triggers.length}`);
  const checkResult = checkTriggerDate(triggerName, triggers);
  if (checkResult !== undefined) {
    return checkResult;
  }
  return new Date();
}
export function makeStringFromPurchasePrice(input: string, liability: string) {
  if (!liability.includes(cgt)) {
    return ''; // don't display irrelevant purchae price
  } else {
    return input;
  }
}
export function makePurchasePriceFromString(input: string) {
  if (input === '') {
    return '0';
  } else {
    return input;
  }
}

export const dateFormatOptions = {
  weekday: undefined,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

// returns a date string for a trigger, or '' for date or junk
export function makeDateTooltip(input: string, triggers: Trigger[]) {
  // log(`triggers.length = ${triggers.length}`);
  let result = '';
  if (input !== '') {
    const date = checkTriggerDate(input, triggers);
    if (date !== undefined) {
      result = date.toLocaleDateString(undefined, dateFormatOptions);
    }
  }
  // log(`make date tooltip for ${input}: ${result}`);
  return result;
}

export function getSettings(
  settings: Setting[],
  key: string,
  fallbackVal: string,
  expectValue = true,
) {
  const searchResult = isSetting(key, settings);
  if (searchResult.numFound === 1) {
    return searchResult.value;
  }
  if (searchResult.numFound === 0) {
    if (expectValue) {
      log(`BUG!!! '${key}' value not found in settings list`);
      // throw new Error(`BUG!!! '${key}' value not found in settings list`);
    }
    // log(`couldn't find ${key} in ${showObj(settings)}`);
    return fallbackVal;
  }
  if (searchResult.numFound > 1) {
    log(`BUG!!! multiple '${key}' values found in settings list`);
    // log(`couldn't find ${key} in ${showObj(settings)}`);
    throw new Error(); // serious!! shows failure in browser!!
    //return fallbackVal;
  }
  return fallbackVal;
}

export function setSetting(
  settings: Setting[],
  key: string,
  val: string,
  type: string,
  hint = '',
) {
  const idx = settings.findIndex(x => x.NAME === key);
  if (idx === -1) {
    // add new object
    settings.push({
      NAME: key,
      VALUE: val,
      HINT: hint,
      TYPE: type,
    });
  } else {
    // replace with a new object
    settings.splice(idx, 1, {
      NAME: key,
      VALUE: val,
      HINT: hint,
      TYPE: type,
    });
  }
}

// might be today or might be set using a setting
export function getTodaysDate(model: ModelData) {
  let today = new Date();
  if (model.settings.length === 0) {
    return today;
  }
  const todaysDate = getSettings(model.settings, valueFocusDate, '');
  if (todaysDate !== '') {
    today = new Date(todaysDate);
  }
  return today;
}

export const simpleAsset: Asset = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  VALUE: '0',
  QUANTITY: '',
  GROWTH: '0',
  CPI_IMMUNE: false,
  CAN_BE_NEGATIVE: false,
  IS_A_DEBT: false,
  LIABILITY: '',
  PURCHASE_PRICE: '0',
};
export const simpleExpense: Expense = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  END: '1 Jan 2017',
  VALUE: '0.0',
  VALUE_SET: '1 Jan 2017',
  CPI_IMMUNE: false,
  GROWTH: '0.0',
  RECURRENCE: '1m',
};
export const simpleIncome: Income = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  END: '1 Jan 2017',
  VALUE: '0',
  VALUE_SET: '1 Jan 2017',
  CPI_IMMUNE: false,
  GROWTH: '0',
  LIABILITY: '',
};
export const simpleTransaction: Transaction = {
  NAME: 'NoName',
  FROM: '',
  FROM_ABSOLUTE: true,
  FROM_VALUE: '0.0',
  TO: '',
  TO_ABSOLUTE: true,
  TO_VALUE: '0.0',
  DATE: '1 Jan 2017',
  STOP_DATE: '', // for regular transactions
  RECURRENCE: '',
  CATEGORY: '',
  TYPE: custom,
};

export const emptyModel: ModelData = {
  triggers: [],
  incomes: [],
  expenses: [],
  transactions: [],
  assets: [],
  settings: [],
  version: 0,
  undoModel: undefined,
  redoModel: undefined,
};

export function defaultModelSettings(roi: { start: string; end: string }) {
  return [
    {
      ...simpleSetting,
      NAME: cpi,
      VALUE: '0.0',
      HINT: cpiHint,
    },
    {
      ...viewSetting,
      NAME: birthDate,
      VALUE: '',
      HINT: birthDateHint,
    },
    {
      ...viewSetting,
      NAME: valueFocusDate,
      VALUE: '',
      HINT: valueFocusDateHint,
    },
    {
      ...viewSetting,
      NAME: roiStart,
      VALUE: roi.start,
      HINT: roiStartHint,
    },
    {
      ...viewSetting,
      NAME: roiEnd,
      VALUE: roi.end,
      HINT: roiEndHint,
    },
  ];
}

export function setROI(model: ModelData, roi: { start: string; end: string }) {
  setSetting(model.settings, roiStart, roi.start, viewType);
  setSetting(model.settings, roiEnd, roi.end, viewType);
}

export function makeModelFromJSON(input: string): ModelData {
  // log('in makeModelFromJSON');
  const model: ModelData = makeModelFromJSONString(input);
  migrateOldVersions(model);
  return model;
}

export function isADebt(name: string, model: ModelData) {
  const matchingAsset = model.assets.find(a => {
    return a.NAME === name;
  });
  if (matchingAsset === undefined) {
    return false;
  }
  return matchingAsset.IS_A_DEBT;
}
export function isAnIncome(name: string, model: ModelData) {
  return model.incomes.filter(a => a.NAME === name).length > 0;
}
export function isAnExpense(name: string, model: ModelData) {
  return model.expenses.filter(a => a.NAME === name).length > 0;
}
function isAnAsset(name: string, model: ModelData) {
  return (
    model.assets.filter(a => a.NAME === name || a.CATEGORY === name).length > 0
  );
}
export function isAnAssetOrAssets(name: string, model: ModelData) {
  const words = name.split(separator);
  let ok = true;
  words.forEach(word => {
    if (!isAnAsset(word, model)) {
      ok = false;
    }
  });
  return ok;
}
export function isATransaction(name: string, model: ModelData) {
  return model.transactions.filter(t => t.NAME === name).length > 0;
}

export function replaceCategoryWithAssetNames(
  words: string[],
  model: ModelData,
) {
  // log(`start replaceCategoryWithAssetNames with words = ${showObj(words)}`);
  let wordsNew: string[] = [];
  words.forEach(w => {
    // log(`look at word "${w}" - is it a category?`);
    // if w is a category of one or more assets
    // then remove w from the list and
    // if the assets are not already on the list
    // then add the asset Names.
    const assetsWithCategory = model.assets.filter(a => {
      return a.CATEGORY === w;
    });
    if (assetsWithCategory.length === 0) {
      wordsNew.push(w);
    } else {
      wordsNew = wordsNew.concat(
        assetsWithCategory.map(a => {
          return a.NAME;
        }),
      );
    }
  });
  // log(`return from replaceCategoryWithAssetNames with wordsNew = ${showObj(wordsNew)}`);
  return wordsNew;
}

export function getLiabilityPeople(model: ModelData): string[] {
  const liabilityPeople: string[] = [];
  if (model.assets === undefined) {
    return [];
  }
  // console.log(`model for tax buttons is ${showObj(model)}`);
  model.assets.forEach(obj => {
    const words = obj.LIABILITY.split(separator);
    for (const word of words) {
      // console.log(`liability word = ${word}`);
      let person: string | undefined = undefined;
      if (word.endsWith(cgt)) {
        person = word.substring(0, word.length - cgt.length);
      } else if (word.endsWith(incomeTax)) {
        person = word.substring(0, word.length - incomeTax.length);
      }
      if (person !== undefined) {
        if (
          liabilityPeople.findIndex(name => {
            return person === name;
          }) === -1
        ) {
          // console.log(`person = ${person}`);
          liabilityPeople.push(person);
        }
      }
    }
  });
  model.incomes.forEach(obj => {
    const words = obj.LIABILITY.split(separator);
    // log(`words = ${words}`);
    for (const word of words) {
      // log(`liability word = ${word}`);
      let person: string | undefined = undefined;
      if (word.endsWith(nationalInsurance)) {
        person = word.substring(0, word.length - nationalInsurance.length);
      } else if (word.endsWith(incomeTax)) {
        person = word.substring(0, word.length - incomeTax.length);
      }
      if (person !== undefined) {
        if (
          liabilityPeople.findIndex(name => {
            return person === name;
          }) === -1
        ) {
          // console.log(`person = ${person}`);
          liabilityPeople.push(person);
        }
      }
    }
  });
  return liabilityPeople;
}

export function markForUndo(model: ModelData) {
  const modelClone = makeModelFromJSONString(JSON.stringify(model));
  model.undoModel = modelClone;
  model.redoModel = undefined;
}
export function revertToUndoModel(model: ModelData): boolean {
  if (model.undoModel !== undefined) {
    // log(`before undo, model has model.undoModel = ${model.undoModel}`);
    // log(`before undo, model has model.redoModel = ${model.redoModel}`);
    // log(`before undo, model has ${model.settings.length} settings`);
    const targetModel = model.undoModel;
    model.undoModel = undefined;
    targetModel.redoModel = {
      assets: model.assets,
      expenses: model.expenses,
      incomes: model.incomes,
      settings: model.settings,
      transactions: model.transactions,
      triggers: model.triggers,
      version: model.version,
      undoModel: model.undoModel,
      redoModel: model.redoModel,
    };
    Object.assign(model, targetModel);
    // log(`after undo, model has model.undoModel = ${model.undoModel}`);
    // log(`after undo, model has model.redoModel = ${model.redoModel}`);
    // log(`after undo, model has ${model.settings.length} settings`);
    return true;
  }
  return false;
}
export function applyRedoToModel(model: ModelData): boolean {
  if (model.redoModel !== undefined) {
    // log(`before redo, model has model.undoModel = ${model.undoModel}`);
    // log(`before redo, model has model.redoModel = ${model.redoModel}`);
    // log(`before redo, model has ${model.settings.length} settings`);
    const targetModel = model.redoModel;
    model.redoModel = undefined;
    targetModel.undoModel = {
      assets: model.assets,
      expenses: model.expenses,
      incomes: model.incomes,
      settings: model.settings,
      transactions: model.transactions,
      triggers: model.triggers,
      version: model.version,
      undoModel: model.undoModel,
      redoModel: model.redoModel,
    };
    Object.assign(model, targetModel);
    // log(`after redo, model has model.undoModel = ${model.undoModel}`);
    // log(`after redo, model has model.redoModel = ${model.redoModel}`);
    // log(`after redo, model has ${model.settings.length} settings`);
    return true;
  }
  return false;
}

function usesWholeWord(existing: string, checkWord: string) {
  if (existing === checkWord) {
    return true;
  }
  return false;
}
function usesNumberValueWord(existing: string, checkWord: string) {
  const parsed = getNumberAndWordParts(existing);
  if (parsed.wordPart && parsed.wordPart === checkWord) {
    return true;
  }
  return false;
}
function usesSeparatedString(existing: string, checkWord: string) {
  const parts = existing.split(separator);
  let numMatches = 0;
  parts.forEach(obj => {
    if (obj === checkWord) {
      numMatches += 1;
    }
  });
  return numMatches > 0;
}

export function getSpecialWord(name: string): string {
  if (name.startsWith(revalue)) {
    return revalue;
  }
  if (name.startsWith(conditional)) {
    return conditional;
  }
  if (name.startsWith(pensionSS)) {
    return pensionSS;
  }
  if (name.startsWith(pensionTransfer)) {
    return pensionTransfer;
  }
  if (name.startsWith(pensionDB)) {
    return pensionDB;
  }
  if (name.startsWith(pension)) {
    return pension;
  }
  if (name.startsWith(moveTaxFreePart)) {
    return moveTaxFreePart;
  }
  if (name.startsWith(crystallizedPension)) {
    return crystallizedPension;
  }
  if (name.startsWith(transferCrystallizedPension)) {
    return transferCrystallizedPension;
  }
  return '';
}

export function checkForWordClashInModel(
  model: ModelData,
  replacement: string,
  messageWord: string,
): string {
  const settingMessages = model.settings
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Setting '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.VALUE, replacement)) {
        return `Setting '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  const triggerMessages = model.triggers
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Trigger '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  const assetMessages = model.assets
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Asset '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.START, replacement)) {
        return `Asset '${obj.NAME}' has start ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.VALUE, replacement)) {
        return `Asset '${obj.NAME}' has value ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.QUANTITY, replacement)) {
        return `Asset '${obj.NAME}' has quantity ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.GROWTH, replacement)) {
        return `Asset '${obj.NAME}' has growth ${messageWord} called ${replacement}`;
      }
      if (usesSeparatedString(obj.LIABILITY, replacement)) {
        return `Asset '${obj.NAME}' has liability ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.PURCHASE_PRICE, replacement)) {
        return `Asset '${obj.NAME}' has purchase price ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  const incomeMessages = model.incomes
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Income '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.START, replacement)) {
        return `Income '${obj.NAME}' has start ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.END, replacement)) {
        return `Income '${obj.NAME}' has end ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.VALUE, replacement)) {
        return `Income '${obj.NAME}' has value ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.VALUE_SET, replacement)) {
        return `Income '${obj.NAME}' has value set ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.GROWTH, replacement)) {
        return `Income '${obj.NAME}' has growth ${messageWord} called ${replacement}`;
      }
      if (usesSeparatedString(obj.LIABILITY, replacement)) {
        return `Income '${obj.NAME}' has liability ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  const expenseMessages = model.expenses
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Expense '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.START, replacement)) {
        return `Expense '${obj.NAME}' has start ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.END, replacement)) {
        return `Expense '${obj.NAME}' has end ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.VALUE, replacement)) {
        return `Expense '${obj.NAME}' has value ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.VALUE_SET, replacement)) {
        return `Expense '${obj.NAME}' has value set ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.GROWTH, replacement)) {
        return `Expense '${obj.NAME}' has growth ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  const transactionMessages = model.transactions
    .map(obj => {
      if (usesWholeWord(obj.NAME, replacement)) {
        return `Transaction '${obj.NAME}' has name ${messageWord} called ${replacement}`;
      }
      if (usesSeparatedString(obj.FROM, replacement)) {
        return `Transaction '${obj.NAME}' has from ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.FROM_VALUE, replacement)) {
        return `Transaction '${obj.NAME}' has from value ${messageWord} called ${replacement}`;
      }
      if (usesSeparatedString(obj.TO, replacement)) {
        return `Transaction '${obj.NAME}' has to ${messageWord} called ${replacement}`;
      }
      if (usesNumberValueWord(obj.TO_VALUE, replacement)) {
        return `Transaction '${obj.NAME}' has to value set ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.DATE, replacement)) {
        return `Transaction '${obj.NAME}' has date ${messageWord} called ${replacement}`;
      }
      if (usesWholeWord(obj.STOP_DATE, replacement)) {
        return `Transaction '${obj.NAME}' has stop date ${messageWord} called ${replacement}`;
      }
      return '';
    })
    .filter(obj => {
      return obj.length > 0;
    });
  let message = `${settingMessages} ${triggerMessages} ${assetMessages} ${incomeMessages} ${expenseMessages} ${transactionMessages}`;
  if (message.length <= 7) {
    message = '';
  }
  return message;
}

function replaceNumberValueString(
  value: string,
  old: string,
  replacement: string,
) {
  const parsed = getNumberAndWordParts(value);
  if (parsed.wordPart === '') {
    return value;
  } else if (parsed.wordPart === old) {
    return value.substring(0, value.length - old.length) + replacement;
  } else {
    return value;
  }
}
function replaceSeparatedString(
  value: string,
  old: string,
  replacement: string,
) {
  const parts = value.split(separator);
  let result = '';
  parts.forEach(obj => {
    if (obj === old) {
      result += replacement;
    } else {
      result += obj;
    }
    result += separator;
  });
  result = result.substr(0, result.length - separator.length);
  return result;
}
function replaceWholeString(value: string, old: string, replacement: string) {
  if (value !== old) {
    return value;
  } else {
    return replacement;
  }
}
export function attemptRenameLong(
  model: ModelData,
  old: string,
  replacement: string,
): string {
  // log(`attempt rename from ${old} to ${replacement}`);

  // prevent a change which alters a special word
  const oldSpecialWord = getSpecialWord(old);
  const newSpecialWord = getSpecialWord(replacement);
  if (oldSpecialWord !== newSpecialWord) {
    if (oldSpecialWord !== '') {
      return `Must maintain special formatting using ${oldSpecialWord}`;
    } else {
      return `Must not introduce special formatting using ${newSpecialWord}`;
    }
  }
  // prevent a change which clashes with an existing word
  let message = checkForWordClashInModel(model, replacement, 'already');
  if (message.length > 0) {
    // log(`found word clash ${message}`);
    return message;
  }

  // log(`get ready to make changes, be ready to undo...`);
  // be ready to undo
  markForUndo(model);
  model.settings.forEach(obj => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.VALUE = replaceNumberValueString(obj.VALUE, old, replacement);
  });
  model.triggers.forEach(obj => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
  });
  model.assets.forEach(obj => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.START = replaceWholeString(obj.START, old, replacement);
    obj.VALUE = replaceNumberValueString(obj.VALUE, old, replacement);
    obj.QUANTITY = replaceWholeString(obj.QUANTITY, old, replacement);
    obj.GROWTH = replaceWholeString(obj.GROWTH, old, replacement);
    obj.LIABILITY = replaceSeparatedString(obj.LIABILITY, old, replacement);
    obj.PURCHASE_PRICE = replaceNumberValueString(
      obj.PURCHASE_PRICE,
      old,
      replacement,
    );
  });
  model.incomes.forEach(obj => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.START = replaceWholeString(obj.START, old, replacement);
    obj.END = replaceWholeString(obj.END, old, replacement);
    obj.VALUE = replaceNumberValueString(obj.VALUE, old, replacement);
    obj.VALUE_SET = replaceWholeString(obj.VALUE_SET, old, replacement);
    obj.GROWTH = replaceWholeString(obj.GROWTH, old, replacement);
    obj.LIABILITY = replaceSeparatedString(obj.LIABILITY, old, replacement);
  });
  model.expenses.forEach(obj => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.START = replaceWholeString(obj.START, old, replacement);
    obj.END = replaceWholeString(obj.END, old, replacement);
    obj.VALUE = replaceNumberValueString(obj.VALUE, old, replacement);
    obj.VALUE_SET = replaceWholeString(obj.VALUE_SET, old, replacement);
    obj.GROWTH = replaceWholeString(obj.GROWTH, old, replacement);
  });
  model.transactions.forEach(obj => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.FROM = replaceSeparatedString(obj.FROM, old, replacement);
    obj.FROM_VALUE = replaceNumberValueString(obj.FROM_VALUE, old, replacement);
    obj.TO = replaceSeparatedString(obj.TO, old, replacement);
    obj.TO_VALUE = replaceNumberValueString(obj.TO_VALUE, old, replacement);
    obj.DATE = replaceWholeString(obj.DATE, old, replacement);
    obj.STOP_DATE = replaceWholeString(obj.STOP_DATE, old, replacement);
  });
  message = checkForWordClashInModel(model, old, 'still');
  if (message.length > 0) {
    // log(`old word still present in adjusted model`);
    revertToUndoModel(model);
    return message;
  }
  const checkResult = checkData(model);
  if (checkResult !== '') {
    // log(`revert adjusted model`);
    revertToUndoModel(model);
    return checkResult;
  } else {
    // log(`save adjusted model`);
    return '';
  }
}
export enum Context {
  Asset,
  Debt,
  Income,
  Expense,
}
