import React, { Component, FormEvent } from 'react';
import { Food } from '../../types/interfaces';

import { log, printDebug, showObj } from '../../utils';
import Button from './Button';
import { InputRow } from './Input';

interface AddFoodState {
  units: string;
  name:string,
  quantity:string,
  calories: string,
  proteinWeight: string,
  vegWeight: string,
  carbsWeight: string,
  fatsWeight: string,
}
interface AddFoodProps {
  submitFunction: (f: Food) => Promise<any>;
  showAlert: (message: string) => void;
}
export class AddFoodForm extends Component<AddFoodProps, AddFoodState> {
  public constructor(props: AddFoodProps) {
    super(props);
    if (printDebug()) {
      log('props for AddDeleteFoodForm: ' + showObj(props));
    }

    this.state = {
      units: '',
      name: '',
      quantity: '',
      calories: '',
      proteinWeight: '',
      vegWeight: '',
      carbsWeight: '',
      fatsWeight: '',
    };

    this.handleName = this.handleName.bind(this);
    this.handleUnits = this.handleUnits.bind(this);
    this.handleQuantity = this.handleQuantity.bind(this);
    this.handleCalories = this.handleCalories.bind(this);
    this.handleProteinWeight = this.handleProteinWeight.bind(this);
    this.handleVegWeight = this.handleVegWeight.bind(this);
    this.handleCarbsWeight = this.handleCarbsWeight.bind(this);
    this.handleFatsWeight = this.handleFatsWeight.bind(this);
    this.add = this.add.bind(this);
  }
  public render() {
    //log(`rendering widget, title = ${this.props.name}`);
    //log(`rendering widget, value from callback = ${this.props.getValue()}`);
    //log(`rendering widget, value in component = ${this.state.VALUE}`);
    return (
      <>
      <h2>Add new food</h2>
      <form className="container-fluid" onSubmit={this.add}>
        <InputRow
          title={`Name`}
          type={'text'}
          name={`AddFoodName`}
          value={this.state.name}
          placeholder={'name'}
          onChange={this.handleName}
        />
        <InputRow
          title={`Units`}
          type={'text'}
          name={`AddFoodUnits`}
          value={this.state.units}
          placeholder={'units'}
          onChange={this.handleUnits}
        />
        <InputRow
          title={`Quantity`}
          type={'text'}
          name={`AddFoodQuantity`}
          value={this.state.quantity}
          placeholder={'quantity'}
          onChange={this.handleQuantity}
        />
        <InputRow
          title={`Calories`}
          type={'text'}
          name={`AddFoodCalories`}
          value={this.state.calories}
          placeholder={'calories'}
          onChange={this.handleCalories}
        />
        <InputRow
          title={`Protein`}
          type={'text'}
          name={`AddFoodProtein`}
          value={this.state.proteinWeight}
          placeholder={'protein'}
          onChange={this.handleProteinWeight}
        />
        <InputRow
          title={`Veg`}
          type={'text'}
          name={`AddFoodVeg`}
          value={this.state.vegWeight}
          placeholder={'veg'}
          onChange={this.handleVegWeight}
        />
        <InputRow
          title={`Carbs`}
          type={'text'}
          name={`AddFoodCarbs`}
          value={this.state.carbsWeight}
          placeholder={'carbs'}
          onChange={this.handleCarbsWeight}
        />
        <InputRow
          title={`Fats`}
          type={'text'}
          name={`AddFoodFats`}
          value={this.state.fatsWeight}
          placeholder={'fats'}
          onChange={this.handleFatsWeight}
        />
        <Button
          action={this.add}
          type={'primary'}
          title={
            'Create new food (over-writes any existing with the same name)'
          }
          id="addFood"
        />
      </form>
      </>
    );
  }
  private handleName(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ name: value });
  }
  private handleUnits(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ units: value });
  }
  private handleQuantity(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ quantity: value });
  }
  private handleCalories(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ calories: value });
  }
  private handleProteinWeight(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ proteinWeight: value });
  }
  private handleVegWeight(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ vegWeight: value });
  }
  private handleCarbsWeight(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ carbsWeight: value });
  }
  private handleFatsWeight(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ fatsWeight: value });
  }
  private async add(e: FormEvent<Element>) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    await this.props.submitFunction(
      {
        foodName: this.state.name,
        details: {
          unit:{
            name : this.state.units,
          },
          quantity: parseFloat(this.state.quantity),
          calories: parseFloat(this.state.calories),
          proteinWeight: parseFloat(this.state.proteinWeight),
          vegWeight: parseFloat(this.state.vegWeight),
          carbsWeight: parseFloat(this.state.carbsWeight),
          fatsWeight: parseFloat(this.state.fatsWeight),
        }
      });
    this.props.showAlert(`updating`);
  }
}


interface DelFoodState {
  name:string,
}
interface DelFoodProps {
  submitFunction: (name: string) => Promise<any>;
  showAlert: (message: string) => void;
}
export class DelFoodForm extends Component<DelFoodProps, DelFoodState> {
  public constructor(props: DelFoodProps) {
    super(props);
    if (printDebug()) {
      log('props for DelDeleteFoodForm: ' + showObj(props));
    }

    this.state = {
      name: '',
    };

    this.handleName = this.handleName.bind(this);
    this.del = this.del.bind(this);
  }
  public render() {
    //log(`rendering widget, title = ${this.props.name}`);
    //log(`rendering widget, value from callback = ${this.props.getValue()}`);
    //log(`rendering widget, value in component = ${this.state.VALUE}`);
    return (
      <>
      <h2>Delete food</h2>
      <form className="container-fluid" onSubmit={this.del}>
        <InputRow
          title={`Name`}
          type={'text'}
          name={`DelFoodName`}
          value={this.state.name}
          placeholder={'name'}
          onChange={this.handleName}
        />
      </form>
      </>
    );
  }
  private handleName(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ name: value });
  }
  private async del(e: FormEvent<Element>) {
    e.preventDefault();
    // log('adding something ' + showObj(this));
    await this.props.submitFunction(
      this.state.name,
    );
    this.props.showAlert(`deleting`);
  }
}