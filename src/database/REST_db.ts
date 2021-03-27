import { Food } from '../types/interfaces';
import { log, printDebug, showObj } from '../utils';

const url = process.env.REACT_APP_SERVER_URL_NOT_SECRET;

export const currentVersion = 1;

function makeBlankFood(
  foodName: string
): Food{
  return {
    foodName: foodName,
    amount: {
      unit: {
        name: 'no unit',
      },
      quantity: NaN,
    },
    details: {
      calories: NaN,
      proteinWeight: NaN,
      vegWeight: NaN,
      carbsWeight: NaN,
      fatsWeight: NaN,
    },
    parts: [],
  };
}

/*
after parsing, we have {
    "amount": {
        "unit": {
            "name": "1"
        },
        "quantity": 1
    },
    "details": {
        "calories": 1,
        "proteinWeight": 1,
        "vegWeight": 1,
        "carbsWeight": 1,
        "fatsWeight": 1
    },
    "parts": [
        {
            "foodName": "1",
            "amount": {
                "unit": {
                    "name": "1"
                },
                "quantity": 1
            },
            "details": {
                "calories": null,
                "proteinWeight": null,
                "vegWeight": null,
                "carbsWeight": null,
                "fatsWeight": null
            },
            "parts": []
        }
    ],
    "version": 1
}
*/

function makeFood(
  foodName: string,
  data: string,
): Food{
  try{
    // console.log(`try parsing string ${showObj(data)}`);
    const obj = JSON.parse(data);
    // console.log(`after parsing, we have ${showObj(obj)}`);
    if(obj.version === currentVersion){
      return {
        foodName: foodName,
        amount: obj.amount,
        details: obj.details,
        parts: obj.parts
      };
    } else {
      console.log(`don't understand version`);
      return makeBlankFood(foodName);

    }
  } catch(err){
    console.log(`recovering from err ${err}`);
    return makeBlankFood(foodName);  
  }
}


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
            // console.log(`foods are ${showObj(parsedResult)}`);

            resolve(parsedResult.map((f)=>{

              const result: Food = makeFood(f.foodName, f.food);
              return result;
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

  updateFood(
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
      method: 'PUT',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow'
    };
    
    fetch("http://localhost:3001/finneo/food_update", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .then(callback)
      .catch(error => console.log('error', error));    
  }
}