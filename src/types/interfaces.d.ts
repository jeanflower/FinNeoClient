export interface Item {
  name: string,
}

export interface Unit {
  name: string,
}

export interface FoodDetails {
  quantity: number,
  unit: Unit
  calories: number,
  proteinWeight: number,
  vegWeight: number,
  carbsWeight: number,
  fatsWeight: number,
}  
 
export interface Food {
  foodName: string,
  details: FoodDetails,
}
