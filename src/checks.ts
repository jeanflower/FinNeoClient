import { evaluationType } from './evaluations';
import {
  allItems,
  annually,
  assetChartAdditions,
  assetChartDeltas,
  assetChartReductions,
  assetChartVal,
  assetChartView,
  birthDate,
  cgt,
  coarse,
  cpi,
  expenseChartFocus,
  fine,
  incomeChartFocus,
  incomeTax,
  monthly,
  nationalInsurance,
  pension,
  revalue,
  roiEnd,
  roiStart,
  separator,
  assetChartFocus,
  viewDetail,
  viewFrequency,
  taxPot,
  CASH_ASSET_NAME,
  conditional,
  pensionSS,
  pensionDBC,
  pensionTransfer,
} from './stringConstants';
import {
  DbAsset,
  DbExpense,
  DbIncome,
  DbModelData,
  DbSetting,
  DbTransaction,
  DbTrigger,
  Evaluation,
} from './types/interfaces';
import {
  checkTriggerDate,
  getSettings,
  getTriggerDate,
  log,
  showObj,
  makeDateFromString,
} from './utils';

export function isNumberString(input: string) {
  const re = new RegExp('^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$');
  const result = input.replace(re, '');
  return result === '';
}
function checkTransactionWords(
  name: string,
  word: string,
  date: string,
  triggers: DbTrigger[],
  assets: DbAsset[],
  incomes: DbIncome[],
) {
  // log(`date for check = ${getTriggerDate(date, triggers)}`);
  const a = assets.find(
    as =>
      as.NAME === word &&
      getTriggerDate(as.START, triggers) <= getTriggerDate(date, triggers),
  );
  if (a !== undefined) {
    return true;
  }

  // log(`name = ${name} and transaction from word ${word}`);
  // maybe t.FROM is the name of an income
  let i = incomes.find(
    is =>
      is.NAME === word &&
      (name.startsWith(pensionDBC) ||
        name.startsWith(pensionSS) ||
        getTriggerDate(is.START, triggers) <= getTriggerDate(date, triggers)),
  );
  if (i !== undefined) {
    // the word is an income
    // this only happens for transactions called Pension*
    if (
      !name.startsWith(pension) && // transfer out of income to pension
      !name.startsWith(pensionSS) && // transfer out of income for contribution
      !name.startsWith(pensionDBC) && // transfer from income to pension benefit
      !name.startsWith(pensionTransfer) // transfer from one pension to another
    ) {
      log(`Transaction ${name} from income
        ${word} must be pension-related`);
      return false;
    }
    return true;
  }

  // maybe t.FROM is an income liability
  i = incomes.find(
    is =>
      is.LIABILITY.includes(word) &&
      getTriggerDate(is.START, triggers) <= getTriggerDate(date, triggers),
  );
  if (i !== undefined) {
    // the word is an income liability
    return true;
  }

  return false;
}
function checkDate(d: Date) {
  // log(`checking date ${d}`);
  if (
    Number.isNaN(d.getTime()) ||
    d < makeDateFromString('1 Jan 1870') ||
    d > makeDateFromString('1 Jan 2199')
  ) {
    return false;
  }
  return true;
}
export function checkAssetLiability(l: string) {
  if (l.length > 0 && !l.startsWith(cgt) && !l.startsWith(incomeTax)) {
    return `Asset liability ${l} should start with ${cgt} or ${incomeTax}`;
  }
  return '';
}
export function checkAsset(a: DbAsset, model: DbModelData): string {
  // log(`checkAsset ${showObj(a)}`);
  if (a.NAME.length === 0) {
    return 'Asset name needs some characters';
  }
  if (a.NAME.split(separator).length !== 1) {
    return `Asset name '${a.NAME}' should not contain '${separator}'`;
  }
  const val = parseFloat(a.VALUE);
  // log(`asset value is ${val}`);
  if (val < 0 && !a.CAN_BE_NEGATIVE) {
    return `Asset '${a.NAME}' can't be negative but has negative value '${a.VALUE}'`;
  }
  if (a.LIABILITY.length > 0) {
    if (a.LIABILITY.includes(separator)) {
      return `Unexpected multiple asset liabilities for ${a.LIABILITY}`;
    }
    const x = checkAssetLiability(a.LIABILITY);
    if (x.length > 0) {
      return x;
    }
  }

  if (!isNumberString(a.GROWTH)) {
    const settingVal = getSettings(model.settings, a.GROWTH, 'missing');
    if (settingVal === 'missing') {
      return `Asset growth set to '${a.GROWTH}'
        but no corresponding setting found`;
    }
    if (!isNumberString(settingVal)) {
      return `Asset growth set to '${a.GROWTH}'
        but corresponding setting not a number`;
    }
  }

  if (!isNumberString(a.VALUE)) {
    return `Asset value '${a.VALUE}' is not a number`;
  }

  if (!isNumberString(a.PURCHASE_PRICE)) {
    return `Asset purchase price '${a.PURCHASE_PRICE}'
      is not a number`;
  }

  const d = checkTriggerDate(a.START, model.triggers);
  if (d === undefined || !checkDate(d)) {
    return `Asset start date doesn't make sense :
      ${showObj(a.START)}`;
  }
  return '';
}

export function checkIncomeLiability(l: string) {
  if (
    l.length > 0 &&
    !l.startsWith(incomeTax) &&
    !l.startsWith(nationalInsurance)
  ) {
    return (
      `Income liability '${l}' should begin with ` +
      `'${incomeTax}' or '${nationalInsurance}'`
    );
  }
  return '';
}
export function checkIncome(i: DbIncome, model: DbModelData): string {
  if (i.NAME.length === 0) {
    return 'Income name needs some characters';
  }
  // log(`checking ${showObj(i)}`);
  const parts = i.LIABILITY.split(separator);
  if (parts.length > 3) {
    return (
      `Income liability for '${i.NAME}' has parts '${parts}' ` +
      `but should contain at most two parts`
    );
  }
  let incomeTaxName = '';
  let niName = '';
  for (const l of parts) {
    /* eslint-disable-line no-restricted-syntax */
    if (
      l.length > 0 &&
      !l.startsWith(incomeTax) &&
      !l.startsWith(nationalInsurance)
    ) {
      const x = checkIncomeLiability(l);
      if (x.length > 0) {
        return (
          `Income liability for '${i.NAME}' has parts '${parts}' ` +
          `but the part '${l}' should begin with ` +
          `'${incomeTax}' or '${nationalInsurance}'`
        );
      }
    }
    if (l.startsWith(incomeTax)) {
      incomeTaxName = l.substring(incomeTax.length, l.length);
    } else if (l.startsWith(nationalInsurance)) {
      niName = l.substring(nationalInsurance.length, l.length);
    }
    if (incomeTaxName !== '' && niName !== '' && incomeTaxName !== niName) {
      return (
        `Income liability for '${i.NAME}' has parts '${parts}' ` +
        `but it should be the same person liable for NI and income tax'`
      );
    }
  }
  if (!isNumberString(i.VALUE)) {
    return `Income value '${i.VALUE}' is not a number`;
  }
  if (!isNumberString(i.GROWTH)) {
    return `Income growth '${i.GROWTH}' is not a number`;
  }
  const startDate = checkTriggerDate(i.START, model.triggers);
  if (startDate === undefined || !checkDate(startDate)) {
    return `Income start date doesn't make sense : ${showObj(i.START)}`;
  }
  const cashAssets = model.assets.filter(m => {
    return m.NAME === CASH_ASSET_NAME;
  });
  if (cashAssets.length > 0) {
    const cashStarts = getTriggerDate(cashAssets[0].START, model.triggers);
    if (startDate < cashStarts) {
      return `Income start date must be after cash starts; ${cashStarts.toDateString()}`;
    }
  }
  const taxAssets = model.assets.filter(m => {
    return m.NAME === taxPot;
  });
  if (taxAssets.length > 0) {
    const taxStarts = getTriggerDate(taxAssets[0].START, model.triggers);
    if (startDate < taxStarts) {
      return `Income start date must be after taxPot starts; ${taxAssets[0].START}`;
    }
  }
  const valueSetDate = checkTriggerDate(i.VALUE_SET, model.triggers);
  if (valueSetDate === undefined || !checkDate(valueSetDate)) {
    return `Income value set date doesn't make sense : ${showObj(i.VALUE_SET)}`;
  }
  const endDate = checkTriggerDate(i.END, model.triggers);
  if (endDate === undefined || !checkDate(endDate)) {
    return `Income end date doesn't make sense : ${showObj(i.END)}`;
  }
  if (valueSetDate > startDate) {
    return `Income value must be set on or before the start of the income.
      Here, start is ${startDate.toDateString()} and
      value is set ${valueSetDate.toDateString()}.`;
  }
  return '';
}

export function checkExpense(e: DbExpense, model: DbModelData): string {
  if (e.NAME.length === 0) {
    return 'Expense name needs some characters';
  }
  if (!isNumberString(e.VALUE)) {
    return `Expense value '${e.VALUE}' is not a number`;
  }
  if (!isNumberString(e.GROWTH)) {
    return `Expense growth '${e.GROWTH}' is not a number`;
  }
  const startDate = checkTriggerDate(e.START, model.triggers);
  if (startDate === undefined || !checkDate(startDate)) {
    return `Expense start date doesn't make sense :
      ${showObj(e.START)}`;
  }
  const valueSetDate = checkTriggerDate(e.VALUE_SET, model.triggers);
  if (valueSetDate === undefined || !checkDate(valueSetDate)) {
    return `Expense value set date doesn't make sense :
      ${showObj(e.VALUE_SET)}`;
  }
  const endDate = checkTriggerDate(e.END, model.triggers);
  if (endDate === undefined || !checkDate(endDate)) {
    return `Expense end date doesn't make sense :
      ${showObj(e.END)}`;
  }
  if (valueSetDate > startDate) {
    return `Expense value must be set on or before the start of the income.
      Here, start is ${startDate.toDateString()} and
      value is set ${valueSetDate.toDateString()}.`;
  }
  return '';
}

function checkTransactionTo(
  word: string,
  t: DbTransaction,
  assetsForChecking: DbAsset[],
  incomes: DbIncome[],
  expenses: DbExpense[],
  triggers: DbTrigger[],
) {
  const a = assetsForChecking.find(as => as.NAME === word);
  if (a !== undefined) {
    if (t.NAME.startsWith(pensionDBC)) {
      return (
        `Transaction ${t.NAME} should have TO an income ` +
        `not an asset : ${a.NAME}`
      );
    }
    if (getTriggerDate(a.START, triggers) > getTriggerDate(t.DATE, triggers)) {
      return (
        `Transaction ${t.NAME} dated before start ` +
        `of affected asset : ${a.NAME}`
      );
    }
    return '';
  }

  const i = incomes.find(ic => ic.NAME === word);
  if (i !== undefined) {
    if (
      !t.NAME.startsWith(revalue) &&
      !t.NAME.startsWith(pensionDBC) &&
      !t.NAME.startsWith(pensionTransfer)
    ) {
      return (
        `Transactions to incomes must begin '${revalue}' ` +
        `or '${pensionDBC} or ${pensionTransfer}`
      );
    }
    if (t.NAME.startsWith(pensionDBC)) {
      if (!i.NAME.startsWith(pensionDBC)) {
        return (
          `transaction ${t.NAME} must have TO income ${t.TO} named` +
          `starting ${pensionDBC}`
        );
      }
    }
    // transacting on an income - check dates
    if (!t.NAME.startsWith(pensionDBC)) {
      if (
        getTriggerDate(i.START, triggers) > getTriggerDate(t.DATE, triggers)
      ) {
        return (
          `Transaction ${t.NAME} dated before start ` +
          `of affected income : ${i.NAME}`
        );
      }
    }
    return '';
  }

  const exp = expenses.find(e => e.NAME === word);
  if (exp !== undefined) {
    // transacting on an expense - must be a revaluation
    if (!t.NAME.startsWith(revalue)) {
      return `Transactions to expenses must begin '${revalue}'`;
    }
    // transacting on an expense - check dates
    if (
      getTriggerDate(exp.START, triggers) > getTriggerDate(t.DATE, triggers)
    ) {
      return (
        `Transaction ${t.NAME} dated before start ` +
        `of affected expense : ${exp.NAME}`
      );
    }
    return '';
  }
  return `Transaction to unrecognised thing : ${word}`;
}

export function checkTransaction(t: DbTransaction, model: DbModelData): string {
  // log(`checking transaction ${showObj(t)}`);
  const { assets, incomes, expenses, triggers } = model;
  const assetsForChecking = assets.filter(a => a.NAME !== taxPot);
  if (t.NAME.length === 0) {
    return 'Transaction name needs some characters';
  }
  if (t.NAME.startsWith(conditional) && t.TO === '') {
    return 'conditional transactions need a To asset defined';
  }
  const d = checkTriggerDate(t.DATE, triggers);
  if (d === undefined || !checkDate(d)) {
    return `Transaction has bad date : ${showObj(t.DATE)}`;
  }
  // log(`transaction date ${getTriggerDate(t.DATE, triggers)}`);
  if (t.FROM !== '') {
    if (
      !checkTransactionWords(
        t.NAME,
        t.FROM,
        t.DATE,
        triggers,
        assetsForChecking,
        incomes,
      )
    ) {
      // log(`split up t.FROM ${t.FROM}`);
      const words = t.FROM.split(separator);
      // log(`words ${showObj(words)}`);
      const arrayLength = words.length;
      for (let i = 0; i < arrayLength; i += 1) {
        const word = words[i];
        // log(`word to check is ${word}`);
        if (
          !checkTransactionWords(
            t.NAME,
            word,
            t.DATE,
            triggers,
            assetsForChecking,
            incomes,
          )
        ) {
          // flag a problem
          return (
            'Transaction from unrecognised asset (could ' +
            `be typo or before asset start date?) : ${showObj(word)}`
          );
        }
      }
    }
    if (t.FROM_VALUE === '') {
      return `Transaction from ${t.FROM} needs a non-empty from value`;
    } else if (!isNumberString(t.FROM_VALUE)) {
      return `Transaction from value ${t.FROM_VALUE} isn't a number`;
    }
  }
  if (t.TO !== '') {
    if (t.NAME.startsWith(revalue)) {
      const words = t.TO.split(separator);
      for (let idx = 0; idx < words.length; idx += 1) {
        const w = words[idx];
        const outcome = checkTransactionTo(
          w,
          t,
          assetsForChecking,
          incomes,
          expenses,
          triggers,
        );
        if (outcome.length > 0) {
          return outcome;
        }
      }
    } else {
      const outcome = checkTransactionTo(
        t.TO,
        t,
        assetsForChecking,
        incomes,
        expenses,
        triggers,
      );
      if (outcome.length > 0) {
        return outcome;
      }
    }
    if (t.TO_VALUE === '') {
      return `Transaction to ${t.TO} needs a non-empty to value`;
    } else if (!isNumberString(t.TO_VALUE)) {
      return `Transaction to value ${t.TO_VALUE} isn't a number`;
    }
  }
  if (t.RECURRENCE.length > 0) {
    if (
      t.NAME.startsWith(pension) ||
      t.NAME.startsWith(pensionSS) ||
      t.NAME.startsWith(pensionDBC)
    ) {
      return (
        `Pension transaction ${t.NAME} gets frequency from income, ` +
        `should not have recurrence ${t.RECURRENCE} defined`
      );
    }

    const lastChar = t.RECURRENCE.substring(t.RECURRENCE.length - 1);
    // log(`lastChar of ${t.RECURRENCE} = ${lastChar}`);
    if (!(lastChar === 'm' || lastChar === 'y')) {
      return `transaction recurrence '${t.RECURRENCE}' must end in m or y`;
    }
    const firstPart = t.RECURRENCE.substring(0, t.RECURRENCE.length - 1);
    // log(`firstPart of ${t.RECURRENCE} = ${firstPart}`);

    const val = parseFloat(firstPart);
    // log(`val from ${t.RECURRENCE} = ${val}`);
    if (Number.isNaN(val)) {
      return (
        `transaction recurrence '${t.RECURRENCE}' must ` +
        'be a number ending in m or y'
      );
    }
  }

  const tToValue = parseFloat(t.TO_VALUE);
  const tFromValue = parseFloat(t.FROM_VALUE);
  // log(`transaction ${showObj(t)} appears OK`);
  if (!t.FROM_ABSOLUTE && tFromValue > 1.0) {
    log(`WARNING : not-absolute value from ${tFromValue} > 1.0`);
  }
  if (
    !t.TO_ABSOLUTE &&
    tToValue > 1.0 &&
    !t.NAME.startsWith(pension) && // pensions can have employer contributions
    !t.NAME.startsWith(pensionSS)
  ) {
    log(`WARNING : not-absolute value to ${tToValue} > 1.0`);
  }
  return '';
}

export function checkTrigger(t: DbTrigger): string {
  // log(`check trigger ${showObj(t)}`);
  if (t.NAME.length === 0) {
    return 'Trigger name needs some characters';
  }
  if (!checkDate(t.DATE)) {
    return `Your important dats is not valid : ${t.DATE}`;
  }
  return '';
}

function checkViewFrequency(settings: DbSetting[]) {
  const vf = getSettings(settings, viewFrequency, 'noneFound');
  if (vf !== 'noneFound') {
    if (
      vf.substring(0, 5).toLowerCase() !==
        monthly.substring(0, 5).toLowerCase() &&
      vf.substring(0, 6).toLowerCase() !==
        annually.substring(0, 6).toLowerCase()
    ) {
      return (
        `"${viewFrequency}" setting should be "${monthly}" ` +
        `or "${annually}"`
      );
    }
  } else {
    return (
      `"${viewFrequency}" setting should be present ` +
      `(value "${monthly}" or "${annually})"`
    );
  }
  return '';
}
function checkViewDetail(settings: DbSetting[]) {
  const vf = getSettings(settings, viewDetail, 'noneFound');
  if (vf !== 'noneFound') {
    if (
      vf.substring(0, 5).toLowerCase() !==
        coarse.substring(0, 5).toLowerCase() &&
      vf.substring(0, 4).toLowerCase() !== fine.substring(0, 4).toLowerCase()
    ) {
      return `"${viewDetail}" setting should be "${coarse}" or "${fine}"`;
    }
  } else {
    return (
      `"${viewDetail}" setting should be present, ` +
      `(value "${coarse}" or "${fine}")`
    );
  }
  return '';
}
function checkViewROI(settings: DbSetting[]) {
  // log(`check settings ${showObj(settings)}`);
  const start = getSettings(settings, roiStart, 'noneFound');
  if (start === 'noneFound') {
    return `"${roiStart}" should be present in settings (value is a date)`;
  }
  const startDate = makeDateFromString(start);
  if (Number.isNaN(startDate.getTime())) {
    return `Setting "${roiStart}" should be a valid date string (e.g. 1 April 2018)`;
  }
  const end = getSettings(settings, roiEnd, 'noneFound');
  if (end === 'noneFound') {
    return `"${roiEnd}" should be present in settings (value is a date)`;
  }
  const endDate = makeDateFromString(end);
  if (Number.isNaN(endDate.getTime())) {
    return `Setting "${roiEnd}" should be a valid date string (e.g. 1 April 2018)`;
  }
  if (endDate < startDate) {
    return `Setting "${roiEnd}" should be after setting "${roiStart}"`;
  }
  return '';
}

function checkViewType(settings: DbSetting[]): string {
  const type = getSettings(settings, assetChartView, 'noneFound');
  if (type === 'noneFound') {
    return (
      `"${assetChartView}" should be present in settings (value is ` +
      `"${assetChartVal}", "${assetChartAdditions}", ` +
      `"${assetChartReductions}" or "${assetChartDeltas}"`
    );
  }
  if (
    type !== assetChartVal &&
    type !== assetChartAdditions &&
    type !== assetChartReductions &&
    type !== assetChartDeltas
  ) {
    return (
      `"${assetChartView}" in settings should have value ` +
      `"${assetChartVal}", "${assetChartAdditions}", ` +
      `"${assetChartReductions}" or "${assetChartDeltas}"`
    );
  }
  return '';
}
function checkDateOfBirth(settings: DbSetting[]): string {
  const dob = getSettings(settings, birthDate, '');
  if (dob === '') {
    return '';
  }
  const d = makeDateFromString(dob);
  if (!checkDate(d)) {
    return `Date of birth ${dob} should parse and be reasonable`;
  }
  return '';
}
function checkCpi(settings: DbSetting[]): string {
  const stringVal = getSettings(settings, cpi, '');
  const val = parseFloat(stringVal);
  if (Number.isNaN(val)) {
    return 'Setting for CPI should be a number';
  }
  return '';
}
function checkAssetChartFocus(model: DbModelData) {
  const val = getSettings(model.settings, assetChartFocus, '');
  if (val === allItems) {
    return '';
  }
  if (
    model.assets.filter(a => a.NAME === val || a.CATEGORY === val).length > 0
  ) {
    return '';
  }
  return (
    `Settings for '${assetChartFocus}' should be '${allItems}'` +
    ` or one of the asset names or one of the asset categories (not ${val})`
  );
}
function checkExpenseChartFocus(model: DbModelData) {
  const val = getSettings(model.settings, expenseChartFocus, '');
  if (val === allItems) {
    return '';
  }
  if (
    model.expenses.filter(a => a.NAME === val || a.CATEGORY === val).length > 0
  ) {
    return '';
  }
  return (
    `Settings for '${expenseChartFocus}' should be '${allItems}'` +
    ` or one of the expense names or one of the expense categories (not ${val})`
  );
}
function checkIncomeChartFocus(model: DbModelData) {
  const val = getSettings(model.settings, incomeChartFocus, '');
  if (val === allItems) {
    return '';
  }
  if (
    model.incomes.filter(a => a.NAME === val || a.CATEGORY === val).length > 0
  ) {
    return '';
  }
  return (
    `Settings for '${incomeChartFocus}' should be '${allItems}'` +
    ` or one of the income names or one of the income categories (not ${val})`
  );
}

export function checkData(model: DbModelData): string {
  // log(`checking data ${showObj(model)}`);
  // log(`check settings`);
  let message = checkViewFrequency(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkViewDetail(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkViewROI(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkViewType(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkDateOfBirth(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkCpi(model.settings);
  if (message.length > 0) {
    return message;
  }
  message = checkAssetChartFocus(model);
  if (message.length > 0) {
    return message;
  }
  message = checkExpenseChartFocus(model);
  if (message.length > 0) {
    return message;
  }
  message = checkIncomeChartFocus(model);
  if (message.length > 0) {
    return message;
  }

  // Any transactions must have date inside
  // the lifetime of relevant assets
  // Don't use forEach because we want to log a bug and
  // return if we meet bad data.

  // linter doesn't like this loop
  //  for (let i = 0; i < transactions.length; i += 1){
  //    const t = transactions[i];
  // ERROR: Expected a 'for-of' loop instead of a 'for'
  // loop with this simple iteration

  // codacy doesn't like this loop
  // iterators/generators require regenerator-runtime,
  // which is too heavyweight for this guide to allow them.
  // Separately, loops should be avoided in favor of array iterations.
  // (no-restricted-syntax)
  // log(`check transactions`);
  for (const t of model.transactions) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkTransaction(t, model);
    if (message.length > 0) {
      return message;
    }
  }
  // log(`check assets`);
  for (const a of model.assets) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkAsset(a, model);
    if (message.length > 0) {
      return message;
    }
  }
  // log(`check incomes`);
  for (const i of model.incomes) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkIncome(i, model);
    if (message.length > 0) {
      return message;
    }
  }
  // log(`check expenses`);
  for (const e of model.expenses) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkExpense(e, model);
    if (message.length > 0) {
      return message;
    }
  }
  // log(`check triggers`);
  for (const t of model.triggers) {
    /* eslint-disable-line no-restricted-syntax */
    message = checkTrigger(t);
    if (message.length > 0) {
      return message;
    }
  }
  return '';
}
export function checkEvalnType(
  evaln: Evaluation,
  nameToTypeMap: Map<string, string>,
) {
  // expect 'PurchaseAssetName' as valuation for cgt purposes
  if (evaln.name.startsWith('Purchase')) {
    const evalnType = nameToTypeMap.get(evaln.name.substr(8));
    if (evalnType === evaluationType.asset) {
      // don't process this evaluation
      // it was just logged to track CGT liability
      return;
    }
    if (evalnType === undefined) {
      log(`BUG!! evaluation of an unknown type: ${showObj(evaln)}`);
      return;
    }
    log(`BUG!! Purchase of non-asset? : ${showObj(evaln)}`);
  } else {
    log(`BUG!! evaluation of an unknown type: ${showObj(evaln)}`);
  }
}
