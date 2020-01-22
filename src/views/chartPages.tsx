import React from 'react';
import { ChartData, DbModelData, DbSetting } from '../types/interfaces';
import {
  allItems,
  assetChartAdditions,
  assetChartDeltas,
  assetChartFocus,
  assetChartFocusHint,
  assetChartHint,
  assetChartReductions,
  assetChartVal,
  assetChartView,
  CASH_ASSET_NAME,
  coarse,
  expenseChartFocus,
  expenseChartFocusHint,
  fine,
  incomeChartFocus,
  incomeChartFocusHint,
  taxPot,
  viewDetail,
  viewDetailHint,
} from '../localization/stringConstants';
import { getSettings, showObj } from '../utils';
import Button from './reactComponents/Button';
import {
  assetsChart,
  expensesChart,
  getDisplay,
  incomesChart,
  submitSetting,
  showContent,
  taxView,
} from '../App';
import ReactiveTextArea from './reactComponents/ReactiveTextArea';

import CanvasJSReact from '../assets/js/canvasjs.react';
const { CanvasJSChart } = CanvasJSReact;

function getIncomeChartFocus(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return allItems;
  }
  const categoryName = getSettings(
    model.settings,
    incomeChartFocus,
    allItems, // default fallback
  );
  return categoryName;
}

function makeFiltersList(
  gridData: { CATEGORY: string; NAME: string }[],
  selectedChartFocus: string,
  settingName: string,
  defaultSetting: string,
  hint: string,
) {
  // selectedChartFocus = this.getExpenseChartFocus()
  // settingName = expenseChartFocus
  // defaultSetting = expenseChartFocusAll
  // hint = expenseChartFocusHint
  const categories = [defaultSetting];
  gridData.forEach(e => {
    let candidate = defaultSetting;
    candidate = e.NAME;
    if (categories.indexOf(candidate) < 0) {
      categories.push(candidate);
    }
  });
  gridData.forEach(e => {
    let candidate = defaultSetting;
    if (e.CATEGORY !== '') {
      candidate = e.CATEGORY;
      if (categories.indexOf(candidate) < 0) {
        categories.push(candidate);
      }
    }
  });
  const buttons = categories.map(category => (
    <Button
      key={category}
      action={(e: any) => {
        e.persist();
        // when a button is clicked,
        // go to change the settings value
        const forSubmission: DbSetting = {
          NAME: settingName,
          VALUE: category,
          HINT: hint,
        };
        submitSetting(forSubmission);
      }}
      title={category}
      type={category === selectedChartFocus ? 'primary' : 'secondary'}
      id={`select-${category}`}
    />
  ));
  return <div role="group">{buttons}</div>;
}

function getCoarseFineView(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return fine;
  }
  const assetName = getSettings(
    model.settings,
    viewDetail,
    fine, // default fallback
  );
  return assetName;
}

function coarseFineList(model: DbModelData) {
  const viewTypes: string[] = [coarse, fine];
  const selectedCoarseFineView = getCoarseFineView(model);
  const buttons = viewTypes.map(viewType => (
    <Button
      key={viewType}
      action={(e: any) => {
        e.persist();
        // when a button is clicked,
        // go to change the settings value
        const forSubmission: DbSetting = {
          NAME: viewDetail,
          VALUE: viewType,
          HINT: viewDetailHint,
        };
        submitSetting(forSubmission);
      }}
      title={viewType}
      type={viewType === selectedCoarseFineView ? 'primary' : 'secondary'}
      id="chooseViewDetailType"
    />
  ));
  return <div role="group">{buttons}</div>;
}

const defaultChartSettings = {
  height: 400,
  toolTip: {
    content: '{name}: {ttip}',
  },
  // width: 800,

  legend: {
    // fontSize: 30,
    fontFamily: 'Helvetica',
    fontWeight: 'normal',
    horizontalAlign: 'right', // left, center ,right
    verticalAlign: 'center', // top, center, bottom
  },
};

export function incomesChartDiv(
  model: DbModelData,
  incomesChartData: ChartData[],
) {
  const chartVisible = showContent.get(incomesChart).display;
  return (
    <div
      style={{
        display: chartVisible ? 'block' : 'none',
      }}
    >
      <ReactiveTextArea
        identifier="incomeDataDump"
        message={showObj(incomesChartData)}
      />
      {makeFiltersList(
        model.incomes,
        getIncomeChartFocus(model),
        incomeChartFocus,
        allItems,
        incomeChartFocusHint,
      )}
      {coarseFineList(model)}
      <fieldset>
        <CanvasJSChart
          options={{
            ...defaultChartSettings,
            data: incomesChartData,
          }}
        />
      </fieldset>
    </div>
  );
}

function getExpenseChartFocus(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return allItems;
  }
  const categoryName = getSettings(
    model.settings,
    expenseChartFocus,
    allItems, // default fallback
  );
  return categoryName;
}

export function expensesChartDiv(
  model: DbModelData,
  expensesChartData: ChartData[],
) {
  const chartVisible = showContent.get(expensesChart).display;
  return (
    <div
      style={{
        display: chartVisible ? 'block' : 'none',
      }}
    >
      <ReactiveTextArea
        identifier="expenseDataDump"
        message={showObj(expensesChartData)}
      />
      {makeFiltersList(
        model.expenses,
        getExpenseChartFocus(model),
        expenseChartFocus,
        allItems,
        expenseChartFocusHint,
      )}
      {coarseFineList(model)}
      <fieldset>
        <ReactiveTextArea
          identifier="expensesDataDump"
          message={showObj(expensesChartData)}
        />
        <CanvasJSChart
          options={{
            ...defaultChartSettings,
            data: expensesChartData,
          }}
        />
      </fieldset>
    </div>
  );
}

function getAssetChartName(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return CASH_ASSET_NAME;
  }
  const assetName = getSettings(
    model.settings,
    assetChartFocus,
    CASH_ASSET_NAME, // default fallback
  );
  return assetName;
}

function assetsList(model: DbModelData) {
  const assets: string[] = model.assets
    .filter(obj => {
      return obj.NAME !== taxPot;
    })
    .map(data => data.NAME);
  // log(`assets = ${assets}`);
  assets.unshift(allItems);
  model.assets.forEach(data => {
    const cat = data.CATEGORY;
    if (cat !== '') {
      if (assets.indexOf(cat) < 0) {
        assets.push(cat);
      }
    }
  });
  const selectedAsset = getAssetChartName(model);
  const buttons = assets.map(asset => (
    <Button
      key={asset}
      action={(e: any) => {
        e.persist();
        // when a button is clicked,
        // go to change the settings value
        const forSubmission: DbSetting = {
          NAME: assetChartFocus,
          VALUE: asset,
          HINT: assetChartFocusHint,
        };
        submitSetting(forSubmission);
      }}
      title={asset}
      type={asset === selectedAsset ? 'primary' : 'secondary'}
      id="chooseAssetChartSetting"
    />
  ));
  return <div role="group">{buttons}</div>;
}

function getAssetChartView(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return assetChartVal;
  }
  const assetName = getSettings(
    model.settings,
    assetChartView,
    assetChartVal, // default fallback
  );
  return assetName;
}

function assetViewTypeList(model: DbModelData) {
  const viewTypes: string[] = [
    assetChartVal,
    assetChartAdditions,
    assetChartReductions,
    assetChartDeltas,
  ];
  const selectedAssetView = getAssetChartView(model);
  const buttons = viewTypes.map(viewType => (
    <Button
      key={viewType}
      action={(e: any) => {
        e.persist();
        // when a button is clicked,
        // go to change the settings value
        const forSubmission: DbSetting = {
          NAME: assetChartView,
          VALUE: viewType,
          HINT: assetChartHint,
        };
        submitSetting(forSubmission);
      }}
      title={viewType}
      type={viewType === selectedAssetView ? 'primary' : 'secondary'}
      id="chooseAssetChartType"
    />
  ));
  return <div role="group">{buttons}</div>;
}

export function assetsChartDiv(
  model: DbModelData,
  assetChartData: ChartData[],
) {
  const chartVisible = showContent.get(assetsChart).display;

  // log(`assetChartData = ${assetChartData}`);

  return (
    <div
      style={{
        display: chartVisible ? 'block' : 'none',
      }}
    >
      {assetsList(model)}
      {assetViewTypeList(model)}
      {coarseFineList(model)}
      <ReactiveTextArea
        identifier="assetDataDump"
        message={showObj(assetChartData)}
      />
      <CanvasJSChart
        options={{
          ...defaultChartSettings,
          data: assetChartData,
        }}
      />
    </div>
  );
}

export function taxDiv(taxChartData: ChartData[]) {
  if (!getDisplay(taxView)) {
    return;
  }

  return (
    <div style={{ display: getDisplay(taxView) ? 'block' : 'none' }}>
      <CanvasJSChart
        options={{
          ...defaultChartSettings,
          data: taxChartData,
        }}
      />
    </div>
  );
}

/*
import {
  IReactVisChartPoint,
} from './reactComponents/ReactVisExample';
*/

/*
function convertChartDatum(z: IChartDataPoint, name: string): IReactVisChartPoint {
  log(`IChartDataPoint z is ${showObj(z)}`);
  const result: IReactVisChartPoint = {
    x: z.label,
    y: z.y,
    ttip: `${name} ${z.ttip}`,
  };
  log(`converted result is ${showObj(result)}`);
  return result;
}

function makeReactVisChartData(x: IChartData): IReactVisChartPoint[] {
  const result = x.dataPoints.map(w => convertChartDatum(w, x.name));
  // log(`${result}`);
  return result;
}
*/
