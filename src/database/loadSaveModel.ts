import { Food } from '../types/interfaces';
import { log } from '../utils';

import { getDB } from './database';
import { currentVersion } from './REST_db';

const showDBInteraction = false;

async function getFoodsDB(userID: string): Promise<Food[]> {
  if (showDBInteraction) {
    log(`getDB get model names for user ${userID}`);
  }
  let foods: Food[] = [];
  try {
    foods = await getDB().getFoods(userID);
  } catch (error) {
    alert(`error contacting database ${error}`);
  }
  if (showDBInteraction) {
    log(`getFoodsDB returning ${foods}`);
  }
  return foods;
}

export async function getFoods(userID: string) {
  const foods = await getFoodsDB(userID);
  return foods;
}

async function addFoodDB(
  userID: string,
  food: Food,
  callback: ()=>{},
): Promise<boolean> {
  if (showDBInteraction) {
    log(`add food for user ${userID}`);
  }
  try {
    await getDB().addFood(
      userID,
      food.foodName,
      JSON.stringify({
        amount: food.amount,
        details: food.details,
        parts: food.parts,
        version: currentVersion,
      }),
      callback,
    );
  } catch (error) {
    alert(`error contacting database ${error}`);
    return false;
  }
  if (showDBInteraction) {
    log(`added food ${food}`);
  }
  return true;
}


export async function addFood(
  userID: string,
  food: Food,
  allFoods: Food[],
  callback: ()=>{},
): Promise<boolean> {
  if(allFoods.find((x)=>{
    return x.foodName === food.foodName;
  })){
    alert(`food with name ${food.foodName} already exists`);
    return false
  }
  const result = await addFoodDB(userID, food, callback);
  return result;
}

async function deleteFoodDB(
  userID: string,
  foodName: string,
  callback: ()=>{},
) {
  if (showDBInteraction) {
    log(`delete food for user ${userID}`);
  }
  try {
    await getDB().deleteFood(userID, foodName, callback);
  } catch (error) {
    alert(`error contacting database ${error}`);
  }
  if (showDBInteraction) {
    log(`deleted food ${foodName}`);
  }
  return;
}


export async function deleteFood(
  userID: string,
  foodName: string,
  callback: ()=>{},
) {
  await deleteFoodDB(userID, foodName, callback);
  return;
}

async function updateFoodDB(
  userID: string,
  food: Food,
  callback: ()=>{},
) {
  if (showDBInteraction) {
    log(`update food for user ${userID}`);
  }
  try {
    await getDB().updateFood(
      userID, 
      food.foodName,
      JSON.stringify({
        amount: food.amount,
        details: food.details,
        parts: food.parts,
        version: currentVersion,
      }),      
      callback);
  } catch (error) {
    alert(`error contacting database ${error}`);
  }
  if (showDBInteraction) {
    log(`updated food ${food}`);
  }
  return;
}


export async function updateFood(
  userID: string,
  food: Food,
  callback: ()=>{},
) {
  await updateFoodDB(userID, food, callback);
  return;
}
