import React, { Component } from 'react';

import { log, printDebug, showObj } from './utils';
import { loginPage, navbarContent } from './views/loginPage';

import {
  addFood,
  deleteFood,
  getFoods,
} from './database/loadSaveModel';
import { Button, Form, Nav, Navbar } from 'react-bootstrap';
import { useAuth0 } from './contexts/auth0-context';
import { homeView, ViewType } from './localization/stringConstants';
import { AddDeleteEntryForm } from './views/reactComponents/AddDeleteEntryForm';
import { Food } from './types/interfaces';

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

export async function refreshData(
  refreshFoods: boolean,
  //refreshChart: boolean,
) {
  log(`refreshData`);

  let foods: Food[] = reactAppComponent.state.foods;

  // log('refreshData in AppContent - get data and redraw content');
  if (refreshFoods) {
    // log(`refresh model evaluation data`);

    foods = await getFoods(getUserID());

    log(`got ${foods.length} foods`);
    log(`got ${showObj(foods)}`);

      // setState on a reactComponent triggers update of view
    reactAppComponent.setState(
      {
        foods: foods,
      },
      () => {
        // setState is async
        // do logging after setState using the 2nd argument
        // https://www.freecodecamp.org/news/get-pro-with-react-setstate-in-10-minutes-d38251d1c781/
        if (printDebug()) {
          log(
            'reactAppComponent.state.foods = ' +
              `${reactAppComponent.state.foods}`,
          );
        }
      },
    );
  } else {
    // log('refreshData in no need to visit db');
    reactAppComponent.setState({ ...reactAppComponent.state });
  }
  // log(`finished refreshData`);
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

export function toggle(type: ViewType) {
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
  refreshData(
    false, // refreshFoods,
  );
}

interface AppState {
  foods: Food[];
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
      foods:[],
      alertText: '',
    };
    refreshData(
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
                    {/*this.rhsTopButtonList()*/}
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
  private homeDiv() {
    // log(`this.state.modelNamesData = ${this.state.modelNamesData}`);
    return (
      <>
      here are the foods I found for you:
      {
      JSON.stringify(this.state.foods)
      }
      <AddDeleteEntryForm
        name="add new food"
        getValue={()=>{return ''}}
        submitFunction={async (val: string)=>{
          console.log(`adding new food ${val}`);
          await addFood(getUserID(), val, 'food details');
          await refreshData(true); // read all back from DB
          return;
        }}
        showAlert={showAlert}
      />
      <AddDeleteEntryForm
        name="delete food"
        getValue={()=>{return ''}}
        submitFunction={async (val: string)=>{
          console.log(`deleting food ${val}`);
          await deleteFood(getUserID(), val);
          await refreshData(true); // read all back from DB
          return;
        }}
        showAlert={showAlert}
      />
      </>
    );
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
          title={'clear alert'}
          id={`btn-clear-alert`}
          type={'secondary'}
        />,
      );
    }
    return result;
  }
}

export default App;
