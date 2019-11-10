import React, { Component } from 'react';

import { checkIncomeLiability } from '../checks';
import { IDbIncome, IDbModelData } from '../types/interfaces';
import {
  checkTriggerDate,
  log,
  makeBooleanFromString,
  printDebug,
  showObj,
} from '../utils';
import Button from './Button';
import { DateSelectionRow } from './DateSelectionRow';
import Input from './Input';

interface IEditFormState {
  NAME: string;
  VALUE: string;
  VALUE_SET: string;
  START: string;
  END: string;
  GROWTH: string;
  CPI_IMMUNE: string;
  LIABILITY: string;
  CATEGORY: string;
}
interface IEditProps {
  checkFunction: any;
  submitFunction: any;
  deleteFunction: any;
  submitTrigger: any;
  model: IDbModelData;
}
export class AddDeleteIncomeForm extends Component<IEditProps, IEditFormState> {
  public defaultState: IEditFormState;

  private valueSetSelectID = 'valueSetSelect';
  private incomeStartSelectID = 'incomeStartSelect';
  private incomeEndSelectID = 'incomeEndSelect';

  constructor(props: IEditProps) {
    super(props);
    if (printDebug()) {
      log(`props for AddDeleteIncomeForm has
        ${showObj(props.model.triggers.length)} triggers`);
    }
    this.defaultState = {
      NAME: '',
      VALUE: '',
      VALUE_SET: '',
      START: '',
      END: '',
      GROWTH: '',
      CPI_IMMUNE: '',
      LIABILITY: '',
      CATEGORY: '',
    };

    this.state = this.defaultState;

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleGrowthChange = this.handleGrowthChange.bind(this);
    this.handleFixedChange = this.handleFixedChange.bind(this);
    this.handleLiabilityChange = this.handleLiabilityChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);

    this.handleValueSetChange = this.handleValueSetChange.bind(this);
    this.setValueSet = this.setValueSet.bind(this);
    this.handleStartChange = this.handleStartChange.bind(this);
    this.setStart = this.setStart.bind(this);
    this.handleEndChange = this.handleEndChange.bind(this);
    this.setEnd = this.setEnd.bind(this);

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
  }

  public render() {
    // log('rendering an AddDeleteIncomeForm');
    return (
      <form
        className="container-fluid"
        onSubmit={this.add}
      >
      <div className="row">
        <div className="col">
          <Input
            title="Income name:"
            inputtype="text"
            name="name"
            value={this.state.NAME}
            placeholder="Enter name"
            handlechange={this.handleNameChange}
          />
        </div> {/* end col */}
        <div className="col">
          <Input
            title="Income value (amount per month):"
            inputtype="text"
            name="value"
            value={this.state.VALUE}
            placeholder="Enter value"
            handlechange={this.handleValueChange}
          />
        </div> {/* end col */}
      </div>{/* end row */}

      <div className="container-fluid">
        {/* fills width */}
        <DateSelectionRow
          introLabel="Date on which the income value is set:"
          setDateFunction={this.setValueSet}
          selectID={this.valueSetSelectID}
          inputName="income valuation date"
          inputValue={this.state.VALUE_SET}
          onChangeHandler={this.handleValueSetChange}
          triggers={this.props.model.triggers}
          submitTrigger={this.props.submitTrigger}
        />
        <DateSelectionRow
          introLabel="Date on which the income starts:"
          setDateFunction={this.setStart}
          selectID="incomeStartSelect"
          inputName="start date"
          inputValue={this.state.START}
          onChangeHandler={this.handleStartChange}
          triggers={this.props.model.triggers}
          submitTrigger={this.props.submitTrigger}
        />
        <DateSelectionRow
          introLabel="Date on which the income ends:"
          setDateFunction={this.setEnd}
          selectID="incomeEndSelect"
          inputName="end date"
          inputValue={this.state.END}
          onChangeHandler={this.handleEndChange}
          triggers={this.props.model.triggers}
          submitTrigger={this.props.submitTrigger}
        />
      </div>
      <div className="row">
        <div className="col">
          <Input
            title="Annual growth (excluding inflation):"
            inputtype="text"
            name="growth"
            value={this.state.GROWTH}
            placeholder="Enter growth"
            handlechange={this.handleGrowthChange}
          />
        </div> {/* end col */}
        <div className="col">
          <Input
            title="Is value immune to inflation?:"
            inputtype="text"
            name="cpi-immune"
            value={this.state.CPI_IMMUNE}
            placeholder="Enter T/F"
            handlechange={this.handleFixedChange}
          />
        </div> {/* end col */}
      </div>{/* end row */}
      <div className="row">
        <div className="col">
          <Input
            title="Taxable liability (e.g. empty or IncomeJoe or NIJane):"
            inputtype="text"
            name="taxable"
            value={this.state.LIABILITY}
            placeholder="Enter tax liability"
            handlechange={this.handleLiabilityChange}
          />
        </div> {/* end col */}
        <div className="col">
          <Input
            title="Category for view (optional):"
            inputtype="text"
            name="category"
            value={this.state.CATEGORY}
            placeholder="category"
            handlechange={this.handleCategoryChange}
          />
        </div> {/* end col */}
      </div>{/* end row */}
      <Button
        action={this.add}
        type={'primary'}
        title={'Create new income (over-writes any existing with the same name)'}
        id="addIncome"
      />
      <Button
        action={this.delete}
        type={'secondary'}
        title={'Delete any income with this name'}
        id="deleteIncome"
      />
      </form>
    );
  }
  private handleNameChange(e: any) {
    const value = e.target.value;
    this.setState({ NAME: value });
  }
  private handleGrowthChange(e: any) {
    const value = e.target.value;
    this.setState({ GROWTH: value });
  }
  private handleCategoryChange(e: any) {
    const value = e.target.value;
    this.setState({ CATEGORY: value });
  }
  private handleLiabilityChange(e: any) {
    const value = e.target.value;
    this.setState({ LIABILITY: value });
  }
  private handleFixedChange(e: any) {
    const value = e.target.value;
    this.setState({ CPI_IMMUNE: value });
  }
  private handleValueChange(e: any) {
    const value = e.target.value;
    this.setState({ VALUE: value });
  }
  private setValueSet(value: string): void {
    this.setState({
      VALUE_SET: value,
    });
  }
  private handleValueSetChange(e: any): void {
    const value = e.target.value;
    this.setValueSet(value);
    this.resetValueSetSelect();
  }
  private setStart(value: string): void {
    this.setState({START: value});
  }
  private handleStartChange(e: any): void {
    const value = e.target.value;
    this.setStart(value);
    this.resetStartSelect();
  }
  private setEnd(value: string): void {
    this.setState({END: value});
  }
  private handleEndChange(e: any): void {
    const value = e.target.value;
    this.setEnd(value);
    this.resetEndSelect();
  }
  private resetValueSetSelect() {
    const selector: any = document.getElementById(this.valueSetSelectID);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private resetStartSelect() {
    const selector: any = document.getElementById(this.incomeStartSelectID);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private resetEndSelect() {
    const selector: any = document.getElementById(this.incomeEndSelectID);
    if (selector !== null) {
      selector.selectedIndex = '0';
    }
  }
  private add(e: any): void {
    e.preventDefault();

    let isNotANumber = Number.isNaN(parseFloat(this.state.VALUE));
    if (isNotANumber) {
      alert(`Income value ${this.state.VALUE} should be a numerical value`);
      return;
    }
    let date = checkTriggerDate(this.state.START, this.props.model.triggers);
    let isNotADate = date === undefined;
    if (isNotADate) {
      alert(`Start date '${this.state.START}' should be a date`);
      return;
    }
    date = checkTriggerDate(this.state.END, this.props.model.triggers);
    isNotADate = date === undefined;
    if (isNotADate) {
      alert(`End date '${this.state.END}' should be a date`);
      return;
    }
    date = checkTriggerDate(this.state.VALUE_SET, this.props.model.triggers);
    isNotADate = date === undefined;
    if (isNotADate) {
      alert(`Value set date should be a date`);
      return;
    }
    isNotANumber = Number.isNaN(parseFloat(this.state.GROWTH));
    if (isNotANumber) {
      alert(`Growth value '${this.state.GROWTH}' should be a numerical value`);
      return;
    }
    const s = this.state.CPI_IMMUNE.toLowerCase();
    if (!((s === 'f') || (s === 't') || (s === 'false') || (s === 'true'))) {
      alert(`Fixed '${this.state.CPI_IMMUNE}' should be a True/False value`);
      return;
    }
    const liabilityMessage = checkIncomeLiability(this.state.LIABILITY);
    if (liabilityMessage !== '') {
      alert(liabilityMessage);
      return;
    }

    // log('adding something ' + showObj(this));
    const income: IDbIncome = {
      NAME: this.state.NAME,
      VALUE: this.state.VALUE,
      VALUE_SET: this.state.VALUE_SET,
      START: this.state.START,
      END: this.state.END,
      GROWTH: this.state.GROWTH,
      CPI_IMMUNE: makeBooleanFromString(this.state.CPI_IMMUNE),
      LIABILITY: this.state.LIABILITY,
      CATEGORY: this.state.CATEGORY,
    };
    const message = this.props.checkFunction(income, this.props.model);
    if (message.length > 0) {
      alert(message);
    } else {
      this.props.submitFunction( income );
      alert('added new income');
      // clear fields
      this.setState(this.defaultState);
      this.resetValueSetSelect();
      this.resetStartSelect();
      this.resetEndSelect();
    }
  }
  private delete(e: any) {
    e.preventDefault();
    // log('deleting something ' + showObj(this));
    this.props.deleteFunction(this.state.NAME);
  }
}
