import React, { Component } from 'react';

import { log, printDebug } from './utils';
import { loginPage, navbarContent } from './views/loginPage';

import {
  addFood,
  deleteFood,
  getFoods,
  updateFood,
} from './database/loadSaveModel';
import { Accordion, Button, Card, Container, Form, Nav, Navbar } from 'react-bootstrap';
import { useAuth0 } from './contexts/auth0-context';
import { homeView, ViewType } from './localization/stringConstants';
import { AddFoodButtonForm, AddFoodForm, DelFoodButtonForm, DelFoodForm } from './views/reactComponents/AddDeleteEntryForm';
import { Food, Item } from './types/interfaces';
import DataGrid from './views/reactComponents/DataGrid';
import SimpleFormatter from './views/reactComponents/SimpleFormatter';


// import FinKittyCat from './views/cat.png';

// import './bootstrap.css'

let userID = '';

function App() {
  const {
    isLoading,
    user,
    loginWithRedirect,
    loginForTesting,
    logout,
  } = useAuth0();
  if (!isLoading && !user) {
    userID = '';
    return loginPage(loginWithRedirect, loginForTesting);
  }
  if (!isLoading && user) {
    userID = user.sub;
    return (
      <AppContent
        logOutAction={() => {
          if (userID === 'TestUserID') {
            log(`logout ${userID}`);
            // try to be graceful without network connection...
            // userID = '';
            // return loginPage(loginWithRedirect, loginForTesting);
            // at the moment if there's no network access,
            // logging out takes you to a "no network" error page
            // but if we're using the testID we don't need to
            // contact Auth0 ...
            // current workaround is to navigate back in browser
            // to get back to login page
          }
          return logout({
            returnTo:
              window.location.origin + process.env.REACT_APP_ORIGIN_APPENDAGE,
          });
        }}
        user={user}
      ></AppContent>
    );
  }
  userID = '';
  return null;
}

let reactAppComponent: AppContent;


function getUserID() {
  return userID;
}

function showAlert(text: string) {
  reactAppComponent.setState({
    alertText: text,
  });
}

function filterFoods(
  allFoods: Food[],
  focusFood: Food | undefined,
): Food[]{
  if(focusFood === undefined){
    // console.log(`no focus food`);
    return [];
  }
  // console.log(`focus to ${focusFood.parts.length}`);
  return focusFood.parts;
}

export function toggle(
  type: ViewType
) {
  if (reactAppComponent === undefined) {
    return;
  }
  for (const k of views.keys()) {
    if (k !== type) {
      const view = views.get(k);
      if (view === undefined) {
        log(`Error : unrecognised view ${type}`);
        return;
      }
      view.display = false;
    }
  }
  const view = views.get(type);
  if (view === undefined) {
    log(`Error : unrecognised view ${type}`);
    return false;
  }
  view.display = true;
  reactAppComponent.refreshData(
    false, // refreshFoods,
  );
}

const views = new Map<
  ViewType,
  {
    display: boolean;
  }
>([
  [
    homeView,
    {
      display: true,
    },
  ],
]);

function makeDirectNum(val: string){
  if(val.length === 0){
    return NaN;
  }
  if(val[0] === '('){
    return NaN;
  }
  return parseFloat(val);
}


function updateFromTable(
  oldFoodRow:  {
    name: string,
    units: string,
    quantity: number,
    calories: string,
    protein: string,
    veg: string,
    carbs: string,
    fats: string,
  }, 
  newEntry: {
    name: string|undefined,
    units: string|undefined,
    quantity: number|undefined,
    calories: string|undefined,
    protein: string|undefined,
    veg: string|undefined,
    carbs: string|undefined,
    fats: string|undefined,
  },
  parentFood: Food | undefined,
){
  // console.log('updating3...');
  // console.log(`foodRow = ${showObj(oldFoodRow)} => ${showObj(newEntry)}`);

  if(newEntry.name !== undefined){
    if(newEntry.name !== oldFoodRow.name){
      alert (`can't update name - use copy and delete instead`);
    }
    return;
  }
  if(parentFood){
    // console.log(`parentFood is ${parentFood.foodName}`);
    if(newEntry.calories !== undefined){
      alert (`can't update calories - use copy and delete instead`);
      return;
    }
    if(newEntry.protein !== undefined){
      alert (`can't update protein - use copy and delete instead`);
      return;
    }
    if(newEntry.veg !== undefined){
      alert (`can't update veg - use copy and delete instead`);
      return;
    }
    if(newEntry.carbs !== undefined){
      alert (`can't update carbs - use copy and delete instead`);
      return;
    }
    if(newEntry.fats !== undefined){
      alert (`can't update fats - use copy and delete instead`);
      return;
    }

    const match = parentFood.parts.find((p)=>{
      return p.foodName === oldFoodRow.name;
    });
    console.log(`matched part is ${match}`);
    if(match && newEntry.units !== undefined){
      match.amount.unit.name = newEntry.units;
    }
    if(match && newEntry.quantity !== undefined){
      match.amount.quantity = newEntry.quantity;
    }
    updateFood(getUserID(), parentFood, async ()=>{
      await reactAppComponent.refreshData(
        true, // read all back from DB
        ); 
    });
    return;
  }

  const food: Food = {
    foodName: oldFoodRow.name,
    amount: {
      unit: {
        name: oldFoodRow.units,
      },
      quantity: oldFoodRow.quantity,
    },
    details: {
      calories: makeDirectNum(oldFoodRow.calories),
      proteinWeight: makeDirectNum(oldFoodRow.protein),
      carbsWeight: makeDirectNum(oldFoodRow.carbs),
      vegWeight: makeDirectNum(oldFoodRow.veg),
      fatsWeight: makeDirectNum(oldFoodRow.fats),
    },
    parts: [],
  }

  if(newEntry.units !== undefined){
    food.amount.unit.name = newEntry.units;
  }
  if(newEntry.quantity !== undefined){
    food.amount.quantity = newEntry.quantity;
  }
  if(food.details && newEntry.calories !== undefined){
    food.details.calories = parseFloat(newEntry.calories);
  }
  if(food.details && newEntry.protein !== undefined){
    food.details.proteinWeight = parseFloat(newEntry.protein);
  }
  if(food.details && newEntry.carbs !== undefined){
    food.details.carbsWeight = parseFloat(newEntry.carbs);
  }
  if(food.details && newEntry.veg !== undefined){
    food.details.vegWeight = parseFloat(newEntry.veg);
  }
  if(food.details && newEntry.fats !== undefined){
    food.details.fatsWeight = parseFloat(newEntry.fats);
  }

  updateFood(getUserID(), food, async ()=>{
    await reactAppComponent.refreshData(
      true, // read all back from DB
      ); 
  });

  return;
}

function handleFoodRowUpdated(
  parentFood: Food | undefined,
  args: any
){
  // console.log('updating2...');
  const oldFoodRow = args[0].fromRowData;
  const newEntry = args[0].updated;
  // console.log(`foodRow = ${showObj(oldFoodRow)} => ${showObj(newEntry)}`);

  updateFromTable(oldFoodRow, newEntry, parentFood);
}


interface AppState {
  allFoods: Food[];
  displayFoods: Food[];
  displayFoods2: Food[];
  focusFood: Food|undefined;
  focusFood2: Food|undefined;
  alertText: string;
}
interface AppProps {
  logOutAction: () => {};
  user: string;
}

export class AppContent extends Component<AppProps, AppState> {
  public constructor(props: AppProps) {
    super(props);
    //this.handleUnload = this.handleUnload.bind(this);

    reactAppComponent = this;
    this.state = {
      allFoods: [],
      displayFoods: [],
      displayFoods2: [],
      focusFood: undefined, 
      focusFood2: undefined, 
      alertText: '',
    };
    this.refreshData(
      true, // refreshFoods = true,
    );
  }

  public componentWillUnmount() {
    //log('in componentWillUnmount');
    //window.removeEventListener('beforeunload', this.handleUnload);
  }
  /*
  public handleUnload(e) {
    //log('in handleUnload');
    if (isDirty) {
      const message = 'o/';

      (e || window.event).returnValue = message; //Gecko + IE
      return message;
    }
  }
*/
  public componentDidMount() {
    //log('in componentDidMount');
    //window.addEventListener('beforeunload', this.handleUnload);
    toggle(homeView);
  }

  async refreshData(
    refreshFoods: boolean,
    //refreshChart: boolean,
  ) {
    log(`refreshData`);
  
    let allFoods: Food[] = reactAppComponent.state.allFoods;
  
    // log('refreshData in AppContent - get data and redraw content');
    if (refreshFoods) {
      // log(`refresh model evaluation data`);
  
      allFoods = await getFoods(getUserID());
  
      // log(`got ${allFoods.length} foods`);
      // log(`got ${showObj(allFoods)}`);
    }
  
    const displayFoods = filterFoods(allFoods, this.state.focusFood);
    const displayFoods2 = filterFoods(allFoods, this.state.focusFood2);

      // setState on a reactComponent triggers update of view
    reactAppComponent.setState(
      {
        allFoods: allFoods,
        displayFoods: displayFoods,
        displayFoods2: displayFoods2,
      },
      () => {
        // setState is async
        // do logging after setState using the 2nd argument
        // https://www.freecodecamp.org/news/get-pro-with-react-setstate-in-10-minutes-d38251d1c781/
        if (printDebug()) {
          log(
            'reactAppComponent.state.foods = ' +
              `${reactAppComponent.state.allFoods}`,
          );
        }
      },
    );
    // log(`finished refreshData`);
  }


  private navbarDiv() {
    return navbarContent(() => {
      return (
        <>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Form
                inline
                onSubmit={(e: React.FormEvent<Element>) => {
                  e.preventDefault();
                  return false;
                }}
              >
                <div className="col">
                  <div className="row">{this.statusButtonList()}</div>
                </div>
              </Form>
            </Nav>
            <Nav>
              <Form
                inline
                onSubmit={(e: React.FormEvent<Element>) => {
                  e.preventDefault();
                  return false;
                }}
              >
                <div className="col">
                  <div className="d-flex flex-row-reverse">
                    {this.rhsTopButtonList()}
                  </div>
                  <div className="d-flex flex-row-reverse">
                    {/*this.rhsBottomButtonList()*/}
                  </div>
                </div>
              </Form>
            </Nav>
          </Navbar.Collapse>
        </>
      );
    });
  }

  private defaultColumn = {
    editable: true,
    resizable: true,
    sortable: true,
  };

  private lessThan(a: string, b: string) {
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

  private makeTableNumberForPart(
    p:Food,
    counter:(x:Food)=>number,
  ): number{
    const matchingFood = this.state.allFoods.find((x)=>{
      return x.foodName === p.foodName;
    })
    if(!matchingFood){
      return NaN;
    }
    const resultForPart = this.makeTableNumber(matchingFood, counter);
    // console.log(`makeTableNumber for ${resultForPart.val}`);
    return resultForPart.val * p.amount.quantity / matchingFood.amount.quantity;
  }


  private makeTableNumber(
    f:Food,
    counter:(x:Food)=>number,
  ): {
    val: number,
    isDirect: boolean
  }{
    // console.log(`makeTableNumber for ${f.foodName}`);
    const val = counter(f);
    if(isNaN(val) || val === null){
      let total = 0;
      f.parts.forEach((p)=>{
        const matchingFood = this.state.allFoods.find((x)=>{
          return x.foodName === p.foodName;
        })
        if(!matchingFood){
          total = NaN;
          return;
        }
        total += this.makeTableNumberForPart(p, counter);
      })
      // console.log(`total (indirect) for ${f.foodName} is ${total}`);
      return {
        val: total,
        isDirect: false
      };
    } else {
      // console.log(`value for ${f.foodName} (direct) is ${val}`);
      return {
        val: val,
        isDirect: true,
      }
    }
  }

  private makeTableStringForPart(
    p:Food,
    counter:(x:Food)=>number,
  ): string{
    const n = this.makeTableNumberForPart(p, counter);
    if(isNaN(n)){
      return '';
    } else {
      return `(${n})`;
    }
  }

  private makeTableString(
    f:Food,
    counter:(x:Food)=>number,
  ): string{
    // console.log(`makeTableString for ${f.foodName}`);
    const tot = this.makeTableNumber(f, counter);
    if(tot.isDirect){
      return `${tot.val}`;
    } else {
      return `(${tot.val})`;
    }
  }

  private foodsTable(
    title: string,
    parentFood: Food | undefined,
    foods: Food[],
    viewFunction: (val: string)=>Promise<void>,
    copyFunction: (val: string)=>Promise<void>,
    showDel: boolean,
    showCopy: boolean,
    editable: boolean,
  ) {
    return (
      <>
        <h4>{title}</h4>
        <DataGrid
          deleteFunction={async function(val: string) {
            console.log(`deleting food ${val}`);
            await deleteFood(getUserID(), val, async ()=>{
              await reactAppComponent.refreshData(
                true, // read all back from DB
                ); 
            });
            return true;  
          }}
          viewFunction={viewFunction}
          copyFunction={copyFunction}
          showDel={showDel}
          showCopy={showCopy}          
          handleGridRowsUpdated={function(){
            console.log('updating...');
            return handleFoodRowUpdated(parentFood, arguments);
          }}
          rows={foods
            .map((f) => {
              // log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
              if(f.details && f.details.calories !== undefined){
                if(parentFood){
                  let HAS_PARTS = false;
                  const matchingFood = this.state.allFoods.find((x)=>{
                    return x.foodName === f.foodName;
                  })
                  if(matchingFood){
                    HAS_PARTS = matchingFood.parts.length > 0;
                  }
                  return {
                    name: f.foodName,
                    units: f.amount.unit.name,
                    quantity: this.makeTableString(f, (x:Food)=>{return x.amount.quantity}),
                    calories: this.makeTableStringForPart(f, (x:Food)=>{return x.details?x.details.calories:NaN}),
                    protein: this.makeTableStringForPart(f, (x:Food)=>{return x.details?x.details.proteinWeight:NaN}),
                    veg: this.makeTableStringForPart(f, (x:Food)=>{return x.details?x.details.vegWeight:NaN}),
                    carbs: this.makeTableStringForPart(f, (x:Food)=>{return x.details?x.details.carbsWeight:NaN}),
                    fats: this.makeTableStringForPart(f, (x:Food)=>{return x.details?x.details.fatsWeight:NaN}),
                    HAS_PARTS: HAS_PARTS,
                  };
                } else {
                  return {
                    name: f.foodName,
                    units: f.amount.unit.name,
                    quantity: this.makeTableString(f, (x:Food)=>{return x.amount.quantity}),
                    calories: this.makeTableString(f, (x:Food)=>{return x.details?x.details.calories:NaN}),
                    protein: this.makeTableString(f, (x:Food)=>{return x.details?x.details.proteinWeight:NaN}),
                    veg: this.makeTableString(f, (x:Food)=>{return x.details?x.details.vegWeight:NaN}),
                    carbs: this.makeTableString(f, (x:Food)=>{return x.details?x.details.carbsWeight:NaN}),
                    fats: this.makeTableString(f, (x:Food)=>{return x.details?x.details.fatsWeight:NaN}),
                    HAS_PARTS: f.parts.length > 0,
                  };
                }
              } else {
                return {
                  name: f.foodName,
                  calories: 'undefined',
                };
              }
            })
            .sort((a: Item, b: Item) => this.lessThan(a.name, b.name))}
          columns={[
            {
              ...this.defaultColumn,
              key: 'DEL',
              name: '',
              editable: false,
              width: 30,
            },
            {
              ...this.defaultColumn,
              key: 'VIEW',
              name: '',
              editable: false,
              width: 30,
            },
            {
              ...this.defaultColumn,
              key: 'COPY',
              name: '',
              editable: false,
              width: 30,
            },
            {
              ...this.defaultColumn,
              key: 'name',
              name: 'name',
              formatter: <SimpleFormatter name="name" value="unset" />,
              editable: editable,
            },
            {
              ...this.defaultColumn,
              key: 'units',
              name: `units`,
              formatter: <SimpleFormatter name="value" value="unset" />,
              editable: editable,
            },
            {
              ...this.defaultColumn,
              key: 'quantity',
              name: `quantity`,
              formatter: <SimpleFormatter name="value" value="unset" />,
              editable: editable,
            },
            {
              ...this.defaultColumn,
              key: 'calories',
              name: `calories`,
              formatter: <SimpleFormatter name="value" value="unset" />,
              editable: editable,
            },
            {
              ...this.defaultColumn,
              key: 'protein',
              name: `protein`,
              formatter: <SimpleFormatter name="value" value="unset" />,
              editable: editable,
            },
            {
              ...this.defaultColumn,
              key: 'veg',
              name: `veg`,
              formatter: <SimpleFormatter name="value" value="unset" />,
              editable: editable,
            },
            {
              ...this.defaultColumn,
              key: 'carbs',
              name: `carbs`,
              formatter: <SimpleFormatter name="value" value="unset" />,
              editable: editable,
            },
            {
              ...this.defaultColumn,
              key: 'fats',
              name: `fats`,
              formatter: <SimpleFormatter name="value" value="unset" />,
              editable: editable,
            },
          ]}
        />
      </>
    );
  }

  private homeDiv() {
    // log(`this.state.modelNamesData = ${this.state.modelNamesData}`);
    return (
      <Accordion>
      <Card>
        <Card.Header>
          <Accordion.Toggle  as={Card.Header} eventKey="ShowTables">
            Data tables
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="ShowTables">
          <Container>

      here are the foods I found for you:
      {
      this.foodsTable(
        'All foods', 
        undefined, // parentFood
        this.state.allFoods,
        async function(val: string){
          const match = reactAppComponent.state.allFoods.find((f)=>{
            return f.foodName === val;
          });
          // console.log(`matched food? ${showObj(match)}`);
          if(match){
            reactAppComponent.setState({
              focusFood: match
            },
            async ()=>{
              await reactAppComponent.refreshData(
                false, // read all back from DB
              ); 
            });
          }
        },
        async function(val: string){
          const match = reactAppComponent.state.allFoods.find((f)=>{
            return f.foodName === val;
          });
          if(match){
            // copy
            const inputName = prompt('Enter new name for this Food');
            if (inputName === null) {
              return;
            }
            const newFood: Food = {
              foodName: inputName,
              amount: match.amount,
              details: match.details,
              parts: match.parts,
            }
            if(!await addFood(
              getUserID(), 
              newFood,
              reactAppComponent.state.allFoods,
              async ()=>{
                await reactAppComponent.refreshData(
                  true, // read all back from DB
                ); 
              }
            )){
              alert('problem adding food - duplicate name?');
            };
          }
        },
        true, // showDel
        true, // showCopy
        true, // editable
      )
      },
      {
      this.foodsTable(
        this.state.focusFood ? `Parts of ${this.state.focusFood.foodName}`: 'Click eye in table above to view details', 
        this.state.focusFood, // parentFood
        this.state.displayFoods,
        async function(val: string){
          const match = reactAppComponent.state.allFoods.find((f)=>{
            return f.foodName === val;
          });
          // console.log(`matched food? ${showObj(match)}`);
          if(match){
            reactAppComponent.setState({
              focusFood2: match
            },
            async ()=>{
              await reactAppComponent.refreshData(
                false, // read all back from DB
              ); 
            });
          }
        },
        async function(val: string){
          alert('no copy for a part')
        },
        false, // showDel
        false, // showCopy
        true, // editable
      )
      }
      {
      this.foodsTable(
        this.state.focusFood2 ? `Parts of ${this.state.focusFood2.foodName}`: 'Click eye in table above to view details', 
        this.state.focusFood, // parentFood
        this.state.displayFoods2,
        async function(val: string){
          // view does nothing
          alert('no view from this level')
        },
        async function(val: string){
          // copy        
          alert('no copy for a part')
        },
        false, // showDel
        false, // showCopy
        true, // editable
      )
      }
          </Container>
        </Accordion.Collapse>
      </Card>
      <Card>
        <Card.Header>
          <Accordion.Toggle  as={Card.Header} eventKey="AddFoods">
            Add foods (text input)
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="AddFoods">
          <Container>

      <AddFoodForm
        allFoods={this.state.allFoods}
        submitFunction={async (newFood: Food)=>{
          // console.log(`adding new food ${newFood}`);
          if(!await addFood(
            getUserID(), 
            newFood, 
            this.state.allFoods,
            async ()=>{
              await this.refreshData(
                true, // read all back from DB
                );
            })){
              alert('problem adding food : duplicate name?')
            }
            return;
          }}
        showAlert={showAlert}
      />

          </Container>
        </Accordion.Collapse>
      </Card>
      <Card>
        <Card.Header>
          <Accordion.Toggle  as={Card.Header} eventKey="AddFoodsButton">
            Add composite foods (button input)
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="AddFoodsButton">
          <Container>

      <AddFoodButtonForm
        allFoods={this.state.allFoods}
        submitFunction={async (newFood: Food)=>{
          console.log(`adding new food ${newFood}`);
          if(!await addFood(
            getUserID(), 
            newFood, 
            this.state.allFoods,
            async ()=>{
            await this.refreshData(
              true, // read all back from DB
              );
          })){
            alert('problem adding food : duplicate name?')
          }
          return;
        }}
        showAlert={showAlert}
      />

          </Container>
        </Accordion.Collapse>
      </Card>
      <Card>
        <Card.Header>
          <Accordion.Toggle  as={Card.Header} eventKey="DeleteFoods">
            Delete foods (text input)
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="DeleteFoods">
          <Container>

      <DelFoodForm
        submitFunction={async (val: string)=>{
          console.log(`deleting food ${val}`);
          await deleteFood(getUserID(), val, async ()=>{
            await this.refreshData(
              true, // read all back from DB
              ); 
          });
          return;
        }}
        showAlert={showAlert}
      />
          </Container>
        </Accordion.Collapse>
      </Card>
      <Card>
        <Card.Header>
          <Accordion.Toggle  as={Card.Header} eventKey="DeleteFoodsButton">
            Delete foods (button input)
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="DeleteFoodsButton">
          <Container>

      <DelFoodButtonForm
        allFoods={this.state.allFoods}
        submitFunction={async (val: string)=>{
          console.log(`deleting food ${val}`);
          await deleteFood(getUserID(), val, async ()=>{
            await this.refreshData(
              true, // read all back from DB
              ); 
          });
          return;
        }}
        showAlert={showAlert}
      />
          </Container>
        </Accordion.Collapse>
      </Card>
    </Accordion>
    );
  }

  private rhsTopButtonList() {
    const buttons: JSX.Element[] = [];
    buttons.push(
      <Button
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.persist();
          this.props.logOutAction();
        }}
        title="Log out"
        className={'btn btn-outline-primary mr-1 mb-1'}
        key="Log out"
        id={`btn-LogOut`}
      >Log out</Button>,
    );
    return buttons;
  }  

  public render() {
    if (printDebug()) {
      log('in render');
    }
    try {
      // throw new Error('pretend something went wrong');
      //showAlert('rendering...');

      return (
        <>
          {this.navbarDiv()}
          <>
            {this.homeDiv()}
          </>
        </>
      );
    } catch (e) {
      return this.internalErrorDiv();
    }
  }

  private internalErrorDiv() {
    return (
      <>
        {this.navbarDiv()}
        <h1>
          Oops! something has gone wrong with FinNeo. Sad FinNeo apologises.
        </h1>
      </>
    );
  }

  private statusButtonList() {
    let buttons: JSX.Element[] = [];
    buttons = buttons.concat(this.makeHelpText(this.state.alertText));
    return buttons;
  }

/*
  if (props.type === 'primary') {
    className = `btn btn-primary${spacer}`;
  } else if (props.type === 'primary-off') {
    className = `btn btn-outline-primary${spacer}`;
  } else if (props.type === 'secondary-on') {
    className = `btn btn-secondary${spacer}`;
  } else if (props.type === 'secondary') {
    className = `btn btn-outline-secondary${spacer}`;
  } else {
    className = `btn btn-error${spacer}`;
  }
*/

  private makeHelpText(alertText: string): JSX.Element[] {
    const result: JSX.Element[] = [];
    let messageText = alertText;
    if (messageText === '') {
      messageText = `foods`;
      result.push(
        <h4 className="text" id="pageTitle" key="pageTitle">
          {messageText}
        </h4>,
      );
    } else {
      result.push(
        <h4 className="text-warning" id="pageTitle" key="pageTitle">
          {messageText}
        </h4>,
      );
    }
    // log('display alert text');
    if (alertText !== '') {
      result.push(
        <Button
          key={'alert'}
          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            // log('clear alert text');
            e.persist();
            this.setState({ alertText: '' });
          }}
          id={`btn-clear-alert`}
          className={'btn btn-outline-secondary mr-1 mb-1'}
        >Clear Alert</Button>,
      );
    }
    return result;
  }
}

export default App;
