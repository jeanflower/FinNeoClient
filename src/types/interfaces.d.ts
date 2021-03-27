export interface Item {
  name: string,
}

export interface Unit {
  name: string,
}

export interface FoodAmount {
  quantity: number,
  unit: Unit
}

export interface FoodDetails {
  calories: number,
  proteinWeight: number,
  vegWeight: number,
  carbsWeight: number,
  fatsWeight: number,
}  
 
export interface Food {
  foodName: string,
  amount: FoodAmount,
  details: FoodDetails | undefined,
  parts: Food[],
}
