import React from 'react';
import Button from './reactComponents/Button';
import FinNeoCat from './cat.png';
import { Navbar } from 'react-bootstrap';
import { toggle } from '../App';
import { homeView } from '../localization/stringConstants';

export function navbarContent(rhContent: () => any) {
  return (
    <Navbar expand="lg" bg="light" sticky="top">
      <Navbar.Brand href="#home" id="finneo-brand">
        <div className="page-header">
          <div className="col">
            <div className="row">
              <h3>{`FinNeo`}</h3>
            </div>
            <div className="row">
              <img
                src={FinNeoCat}
                alt="FinNeo cat"
                width={70}
                height={'auto'}
                onClick={() => {
                  toggle(homeView);
                }}
                id="btn-Home"
              ></img>
            </div>
          </div>
        </div>
      </Navbar.Brand>
      {rhContent()}
    </Navbar>
  );
}

export function loginPage(loginWithRedirect: any, loginForTesting: any) {
  return (
    <>
      {navbarContent(() => {
        return <h3>An app for fitnesss, nutrition and a new you</h3>;
      })}
      <div className="row">
        <div className="col-sm mb-4">
          <div className="alert alert-block">
            <h2>Get started</h2> To begin using this app, log in or use a shared
            playpen
            <br />
            <Button
              type="secondary"
              id="buttonLogin"
              action={loginWithRedirect}
              title="Login or create an account"
            />
            <Button
              type="secondary"
              id="buttonTestLogin"
              action={loginForTesting}
              title="Shared playpen (no login)"
            />
          </div>
        </div>
      </div>
    </>
  );
}
