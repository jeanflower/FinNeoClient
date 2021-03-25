import { Food } from '../types/interfaces';
import { log } from '../utils';

import { getDB } from './database';

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
) {
  if (showDBInteraction) {
    log(`add food for user ${userID}`);
  }
  try {
    await getDB().addFood(userID, food.foodName, JSON.stringify(food.details), callback);
  } catch (error) {
    alert(`error contacting database ${error}`);
  }
  if (showDBInteraction) {
    log(`added food ${food}`);
  }
  return;
}


export async function addFood(
  userID: string,
  food: Food,
  callback: ()=>{},
) {
  const foods = await addFoodDB(userID, food, callback);
  return foods;
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
