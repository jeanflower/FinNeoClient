import React, { Component, FormEvent } from 'react';
import { Button } from 'react-bootstrap';
import { toggle } from '../../App';
import { Food } from '../../types/interfaces';

import { log, printDebug, showObj } from '../../utils';
import { InputRow } from './Input';

interface AddFoodState {
  name:string,
  units: string,
  quantity:string,
  calories: string,
  proteinWeight: string,
  vegWeight: string,
  carbsWeight: string,
  fatsWeight: string,
  partNameWIP: string,
  partUnitWIP: string,
  partQuantityWIP: string,
  parts: {
    name:string,
    units: string,
    quantity:string,  
  }[]
}
interface AddFoodProps {
  allFoods: Food[],
  submitFunction: (f: Food) => Promise<any>;
  showAlert: (message: string) => void;
}
function getEmptyState(): AddFoodState {
  return {
    units: '',
    name: '',
    quantity: '',
    calories: '',
    proteinWeight: '',
    vegWeight: '',
    carbsWeight: '',
    fatsWeight: '',
    partNameWIP: '',
    partUnitWIP: '',
    partQuantityWIP: '',
    parts: [],
  };
}
export class AddFoodForm extends Component<AddFoodProps, AddFoodState> {
  public constructor(props: AddFoodProps) {
    super(props);
    if (printDebug()) {
      log('props for AddDeleteFoodForm: ' + showObj(props));
    }

    this.state = getEmptyState();

    this.handleName = this.handleName.bind(this);
    this.handleUnits = this.handleUnits.bind(this);
    this.handleQuantity = this.handleQuantity.bind(this);
    this.handleCalories = this.handleCalories.bind(this);
    this.handleProteinWeight = this.handleProteinWeight.bind(this);
    this.handleVegWeight = this.handleVegWeight.bind(this);
    this.handleCarbsWeight = this.handleCarbsWeight.bind(this);
    this.handleFatsWeight = this.handleFatsWeight.bind(this);
    this.handlePartNameWIP = this.handlePartNameWIP.bind(this);
    this.handlePartUnitWIP = this.handlePartUnitWIP.bind(this);
    this.handlePartQuantityWIP = this.handlePartQuantityWIP.bind(this);
    this.add = this.add.bind(this);
    this.addPart = this.addPart.bind(this);
    this.delParts = this.delParts.bind(this);
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
          title={`Quantity`}
          type={'text'}
          name={`AddFoodQuantity`}
          value={this.state.quantity}
          placeholder={'quantity'}
          onChange={this.handleQuantity}
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
        {JSON.stringify(this.state.parts)}
        <InputRow
          title={`Part name`}
          type={'text'}
          name={`AddPartNameWIP`}
          value={this.state.partNameWIP}
          placeholder={'part name'}
          onChange={this.handlePartNameWIP}
        />
        <InputRow
          title={`Part quantity`}
          type={'text'}
          name={`AddFoodQtyWIP`}
          value={this.state.partQuantityWIP}
          placeholder={'part quantity'}
          onChange={this.handlePartQuantityWIP}
        />
        <InputRow
          title={`Part unit`}
          type={'text'}
          name={`AddPartUnitWIP`}
          value={this.state.partUnitWIP}
          placeholder={'part units'}
          onChange={this.handlePartUnitWIP}
        />
        <Button
          onClick={this.addPart}
          type={'primary'}
          id="addFoodPart"
        >Add a food part</Button>
        <Button
          onClick={this.delParts}
          type={'primary'}
          id="delFoodPart"
        >Delete a food part</Button>
        <p></p>
        <Button
          onClick={this.add}
          type={'primary'}
          id="addFood"
        >Create new food (over-writes any existing with the same name)</Button>
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
  private handlePartNameWIP(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ partNameWIP: value });
  }
  private handlePartUnitWIP(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ partUnitWIP: value });
  }
  private handlePartQuantityWIP(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ partQuantityWIP: value });
  }
  private async addPart(e: FormEvent<Element>) {
    e.preventDefault();
    const parts = this.state.parts;
    parts.push({
      name: this.state.partNameWIP,
      units: this.state.partUnitWIP,
      quantity: this.state.partQuantityWIP,
    });
    this.setState({ 
      parts: parts,
      partNameWIP: '',
      partUnitWIP: '',
      partQuantityWIP: '',
    });
  }
  private async delParts(e: FormEvent<Element>) {
    e.preventDefault();
    this.setState({ 
      parts: [],
    });
  }
  private getUnits(
    unitsInput: string,
    foodName: string,
    allFoods: Food[],
  ){    
    let units = unitsInput;
    console.log(`given units for ${foodName}, are units ${units}`);
    if(unitsInput === ''){
      units = 'defaultUnit';
      // console.log(`check for ${foodName} in allFoods`);
      const matchedFoods = allFoods.filter((f)=>{
        return f.foodName === foodName;
      });
      if(matchedFoods.length === 1){
        const matchedUnit = matchedFoods[0].amount.unit.name;
        // console.log(`matched a food called ${foodName}, with units ${matchedUnit}`);
        units = matchedUnit;
      }
    }
    return units;
  }
  private getQuantity(
    quantityInput: string,
    foodName: string,
    allFoods: Food[],
  ){
    let quantity = quantityInput;
    console.log(`given qty for ${foodName}, is ${quantityInput}`);
    if(quantityInput === ''){
      quantity = '1';
      // console.log(`check for ${foodName} in allFoods`);
      const matchedFoods = allFoods.filter((f)=>{
        return f.foodName === foodName;
      });
      if(matchedFoods.length === 1){
        const matchedQty = matchedFoods[0].amount.quantity;
        // console.log(`matched a food called ${foodName}, with units ${matchedQty}`);
        quantity = `${matchedQty}`;
      }
    }
    return quantity;
  }
  private async add(e: FormEvent<Element>) {
    e.preventDefault();

    if(this.state.name === ''){
      alert('a food needs a name');
      return;
    }

    // log('adding something ' + showObj(this));
    await this.props.submitFunction(
      {
        foodName: this.state.name,
        amount: {
          unit:{
            name : this.getUnits(this.state.units, this.state.name, this.props.allFoods),
          },
          quantity: parseFloat(this.getQuantity(this.state.quantity, this.state.name, this.props.allFoods)),
        },
        details: {
          calories: parseFloat(this.state.calories),
          proteinWeight: parseFloat(this.state.proteinWeight),
          vegWeight: parseFloat(this.state.vegWeight),
          carbsWeight: parseFloat(this.state.carbsWeight),
          fatsWeight: parseFloat(this.state.fatsWeight),
        },
        parts: this.state.parts.map((p)=>{

          return {
            foodName: p.name,
            amount: {
              unit: {
                name: this.getUnits(p.units, p.name, this.props.allFoods),
              },
              quantity: parseFloat(this.getQuantity(p.quantity, p.name, this.props.allFoods)),
            },
            details:{
              calories: NaN,
              proteinWeight: NaN,
              vegWeight: NaN,
              carbsWeight: NaN,
              fatsWeight: NaN,
            },
            parts:[],
          }
        }),
      });
    this.delParts(e);
    this.setState(getEmptyState());
    this.props.showAlert(`updating`);
  }
}

export class AddFoodButtonForm extends Component<AddFoodProps, AddFoodState> {
  public constructor(props: AddFoodProps) {
    super(props);
    if (printDebug()) {
      log('props for AddDeleteFoodForm: ' + showObj(props));
    }

    this.state = getEmptyState();

    this.handleName = this.handleName.bind(this);
    this.add = this.add.bind(this);
  }

  private makeButton(
    buttonName: string,
    primary: boolean,
    toggle: ()=>void,
  ) {  
    return (<Button
      key={buttonName}
        onClick={async (e: any) => {
          e.persist();
          toggle();
        }}
        className={
          primary ? 'btn btn-secondary mr-1 mb-1' : 'btn btn-outline-secondary mr-1 mb-1'
        }
        id={`toggle${buttonName}`}
      >
      {buttonName}
      </Button>
    );
  }
  private makeButtons(){
    return this.props.allFoods.sort((a: Food,b: Food)=>{
      const aHasParts = a.parts.length > 0;
      const bHasParts = b.parts.length > 0;
      if(aHasParts && !bHasParts){
        return 1;
      } else if(!aHasParts && bHasParts){
        return -1;
      }
      const lt = a.foodName.toLowerCase() < b.foodName.toLowerCase();
      return lt ? -1 : 1;
    }).map((f)=>{
      const includedAlready = this.state.parts.find((p)=>{
        return p.name === f.foodName;
      }) !== undefined;
      return this.makeButton(
        f.foodName, 
        includedAlready,
        ()=>{
          // console.log(`toggle ${f.foodName}`);
          const parts = this.state.parts;
          parts.push({
            name: f.foodName,
            units: '',
            quantity: '',
          })
          this.setState({
            parts: parts
          })
        });
    });
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
        {this.makeButtons()}
        <p></p>
        <Button
          onClick={this.add}
          type={'primary'}
          id="addFood"
        >Create new food (over-writes any existing with the same name)</Button>
      </form>
      </>
    );
  }
  private handleName(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({ name: value });
  }

  private getUnits(
    unitsInput: string,
    foodName: string,
    allFoods: Food[],
  ){    
    let units = unitsInput;
    // console.log(`given units for ${foodName}, are units ${units}`);
    if(unitsInput === ''){
      units = 'defaultUnit';
      // console.log(`check for ${foodName} in allFoods`);
      const matchedFoods = allFoods.filter((f)=>{
        return f.foodName === foodName;
      });
      if(matchedFoods.length === 1){
        const matchedUnit = matchedFoods[0].amount.unit.name;
        // console.log(`matched a food called ${foodName}, with units ${matchedUnit}`);
        units = matchedUnit;
      }
    }
    return units;
  }
  private getQuantity(
    quantityInput: string,
    foodName: string,
    allFoods: Food[],
  ){
    let quantity = quantityInput;
    // console.log(`given qty for ${foodName}, is ${quantityInput}`);
    if(quantityInput === ''){
      quantity = '1';
      // console.log(`check for ${foodName} in allFoods`);
      const matchedFoods = allFoods.filter((f)=>{
        return f.foodName === foodName;
      });
      if(matchedFoods.length === 1){
        const matchedQty = matchedFoods[0].amount.quantity;
        // console.log(`matched a food called ${foodName}, with units ${matchedQty}`);
        quantity = `${matchedQty}`;
      }
    }
    return quantity;
  }
  private async add(e: FormEvent<Element>) {
    e.preventDefault();

    if(this.state.name === ''){
      alert('a food needs a name');
      return;
    }

    // log('adding something ' + showObj(this));
    await this.props.submitFunction(
      {
        foodName: this.state.name,
        amount: {
          unit:{
            name : this.getUnits(this.state.units, this.state.name, this.props.allFoods),
          },
          quantity: parseFloat(this.getQuantity(this.state.quantity, this.state.name, this.props.allFoods)),
        },
        details: {
          calories: parseFloat(this.state.calories),
          proteinWeight: parseFloat(this.state.proteinWeight),
          vegWeight: parseFloat(this.state.vegWeight),
          carbsWeight: parseFloat(this.state.carbsWeight),
          fatsWeight: parseFloat(this.state.fatsWeight),
        },
        parts: this.state.parts.map((p)=>{

          return {
            foodName: p.name,
            amount: {
              unit: {
                name: this.getUnits(p.units, p.name, this.props.allFoods),
              },
              quantity: parseFloat(this.getQuantity(p.quantity, p.name, this.props.allFoods)),
            },
            details:{
              calories: NaN,
              proteinWeight: NaN,
              vegWeight: NaN,
              carbsWeight: NaN,
              fatsWeight: NaN,
            },
            parts:[],
          }
        }),
      });
    this.setState(getEmptyState());
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
    this.setState({
      name: '',
    });
  }
}

export interface DelFoodButtonProps {
  allFoods: Food[];
  submitFunction: (name: string) => Promise<any>;
  showAlert: (message: string) => void;
}

export class DelFoodButtonForm extends Component<DelFoodButtonProps, {}> {
  public constructor(props: DelFoodButtonProps) {
    super(props);
    if (printDebug()) {
      log('props for DelDeleteFoodButtonForm: ' + showObj(props));
    }

    this.del = this.del.bind(this);
  }

  private makeButton(
    buttonName: string,
    toggle: ()=>void,
  ) {  
    return (<Button
      key={buttonName}
        onClick={async (e: any) => {
          e.persist();
          toggle();
        }}
        className={'btn btn-secondary mr-1 mb-1'}
        id={`del${buttonName}`}
      >
      {buttonName}
      </Button>
    );
  }
  private makeButtons(){
    return this.props.allFoods.sort((a: Food,b: Food)=>{
      const aHasParts = a.parts.length > 0;
      const bHasParts = b.parts.length > 0;
      if(aHasParts && !bHasParts){
        return 1;
      } else if(!aHasParts && bHasParts){
        return -1;
      }
      const lt = a.foodName.toLowerCase() < b.foodName.toLowerCase();
      return lt ? -1 : 1;
    }).map((f)=>{
      return this.makeButton(
        f.foodName, 
        ()=>{
          this.del(f.foodName);
        });
    });
  }

  public render() {
    //log(`rendering widget, title = ${this.props.name}`);
    //log(`rendering widget, value from callback = ${this.props.getValue()}`);
    //log(`rendering widget, value in component = ${this.state.VALUE}`);
    return (
      <>
      <h2>Delete food</h2>
      {this.makeButtons()}
      </>
    );
  }
  private async del(name: string) {
    // log('adding something ' + showObj(this));
    await this.props.submitFunction(
      name,
    );
    this.props.showAlert(`deleting`);
    this.setState({
      name: '',
    });
  }
}
