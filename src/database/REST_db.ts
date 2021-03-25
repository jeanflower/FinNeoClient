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
            const parsedResult:{
              foodName: string,
              food: string,
            }[] = JSON.parse(result);
            console.log(`foods are ${showObj(parsedResult)}`);

            resolve(parsedResult.map((f)=>{
              try{
                console.log(`try parsing, f ${showObj(f)}`);
                const d = JSON.parse(f.food);
                console.log(`after parsing, d is ${showObj(d)}`);
                return {
                  foodName: f.foodName,
                  details: {
                    unit: {
                      name: d.unit.name,
                    },
                    quantity: d.quantity,
                    calories: d.calories,
                    proteinWeight: d.proteinWeight,
                    vegWeight: d.vegWeight,
                    carbsWeight: d.carbsWeight,
                    fatsWeight: d.fatsWeight,
                  },
                }
              } catch(err){
                console.log(`recovering from err ${err}`);
                return {
                  foodName: f.foodName,
                  details: {
                    unit: {
                      name: 'no unit',
                    },
                    quantity: NaN,
                    calories: NaN,
                    proteinWeight: NaN,
                    vegWeight: NaN,
                    carbsWeight: NaN,
                    fatsWeight: NaN,
                  }
                }
              }
            }));
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
    callback: ()=>{},
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
      .then(callback)
      .catch(error => console.log('error', error));    
  }
  deleteFood(
    userID: string, 
    foodName: string,
    callback: ()=>{},
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
      .then(callback)
      .catch(error => console.log('error', error));
  }
}