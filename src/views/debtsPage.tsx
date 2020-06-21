import React from 'react';
import { ChartData, DbModelData, DbItem } from './../types/interfaces';
import {
  debtsChart,
  debtsTable,
  debtsView,
  deleteAsset,
  getDisplay,
  showContent,
  submitAsset,
  submitTrigger,
  toggleDisplay,
  submitTransaction,
} from './../App';
import Button from './reactComponents/Button';
import { assetsOrDebtsChartDiv } from './chartPages';
import {
  assetsOrDebtsTableDiv,
  transactionsTableDiv,
  defaultColumn,
} from './tablePages';
import { checkAsset, checkTransaction } from '../models/checks';
import { AddDeleteDebtForm } from './reactComponents/AddDeleteDebtForm';
import { payOffDebt, revalueDebt } from '../localization/stringConstants';
import { getTodaysDate, lessThan } from '../utils';
import DataGrid from './reactComponents/DataGrid';
import NameFormatter from './reactComponents/NameFormatter';
import CashValueFormatter from './reactComponents/CashValueFormatter';

export function debtsDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  debtChartData: ChartData[],
  todaysValues: Map<string, number>,
) {
  if (!getDisplay(debtsView)) {
    return;
  }

  const today = getTodaysDate(model);
  return (
    <div style={{ display: getDisplay(debtsView) ? 'block' : 'none' }}>
      <Button
        action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.persist();
          toggleDisplay(debtsChart);
        }}
        title={`${showContent.get(debtsChart).display ? 'Hide ' : 'Show '}${
          debtsChart.lc
        }`}
        type={showContent.get(debtsChart).display ? 'primary' : 'secondary'}
        key={debtsChart.lc}
        id="toggleDebtsChart"
      />
      <Button
        action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.persist();
          toggleDisplay(debtsTable);
        }}
        title={`${showContent.get(debtsTable).display ? 'Hide ' : 'Show '}${
          debtsTable.lc
        }`}
        type={showContent.get(debtsTable).display ? 'primary' : 'secondary'}
        key={debtsTable.lc}
        id="toggleDebtsTable"
      />
      {assetsOrDebtsChartDiv(model, debtChartData, true, false)}
      <h4>Debt definitions</h4>
      {assetsOrDebtsTableDiv(model, showAlert, true)}
      <h4>Revalue debts</h4>
      {transactionsTableDiv(model, showAlert, revalueDebt)}
      <h4>Pay off debts</h4>
      {transactionsTableDiv(model, showAlert, payOffDebt)}

      <h4>Values at {today.toDateString()}</h4>
      <DataGrid
        deleteFunction={async function() {
          return false;
        }}
        handleGridRowsUpdated={function() {
          return false;
        }}
        rows={Array.from(todaysValues.entries())
          .map(key => {
            // log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
            return {
              NAME: key[0],
              VALUE: `${key[1]}`,
            };
          })
          .sort((a: DbItem, b: DbItem) => lessThan(a.NAME, b.NAME))}
        columns={[
          {
            ...defaultColumn,
            key: 'NAME',
            name: 'name',
            formatter: <NameFormatter value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'VALUE',
            name: `today's value`,
            formatter: <CashValueFormatter value="unset" />,
          },
        ]}
      />

      <div className="addNewDebt">
        <h4> Add a debt </h4>
        <AddDeleteDebtForm
          checkAssetFunction={checkAsset}
          submitAssetFunction={submitAsset}
          checkTransactionFunction={checkTransaction}
          submitTransactionFunction={submitTransaction}
          deleteAssetFunction={deleteAsset}
          submitTriggerFunction={submitTrigger}
          model={model}
          showAlert={showAlert}
        />
      </div>
    </div>
  );
}
