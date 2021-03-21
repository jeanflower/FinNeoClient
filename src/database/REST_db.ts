import { Food } from '../types/interfaces';
import { log, printDebug, showObj } from '../utils';

const url = process.env.REACT_APP_SERVER_URL_NOT_SECRET;

export class RESTDB {
  getFoods(userID: string): Promise<Food[]> {
    if (printDebug()) {
      log(`url for REST requests = ${url}`);
    }
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    return new Promise((resolve, reject) => {
      const requestOptions: {
        method: string;
        headers: Headers;
        redirect: 'follow' | 'error' | 'manual' | undefined;
      } = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };
      const address = `${url}foods?userID=${userID}`;
      // console.log(`address for fetch is ${address}`);
      return fetch(address, requestOptions)
        .then(response => response.text())
        .then(result => {
          // console.log(result);
          try {
            const parsedResult = JSON.parse(result);
            console.log(`foods are ${showObj(parsedResult)}`);
            resolve(parsedResult);
          } catch (err) {
            reject('Query failed');
          }
        })
        .catch(error => {
          console.log('error', error);
          reject(error);
        });
    });
  }

  addFood(
    userID: string, 
    foodName: string,
    food: string,
  ){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    
    var urlencoded = new URLSearchParams();
    urlencoded.append("userID", userID);
    urlencoded.append("foodName", foodName);
    urlencoded.append("food", food);
    
    var requestOptions: {
      method: string;
      headers: Headers;
      body: URLSearchParams;
      redirect: 'follow' | 'error' | 'manual' | undefined;
    } = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow'
    };
    
    fetch(`${url}food_create`, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));    
  }
  deleteFood(
    userID: string, 
    foodName: string,
  ){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    
    var urlencoded = new URLSearchParams();
    urlencoded.append("userID", userID);
    urlencoded.append("foodName", foodName);
    
    var requestOptions: {
      method: string;
      headers: Headers;
      body: URLSearchParams;
      redirect: 'follow' | 'error' | 'manual' | undefined;
    } = {
      method: 'DELETE',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow'
    };
    
    fetch(`${url}food_delete`, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }
}