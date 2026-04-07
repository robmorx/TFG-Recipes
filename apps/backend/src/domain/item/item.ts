export enum QuantityUnit {
  LITRES = 'LITRES',
  KILOGRAMS = 'KILOGRAMS',
  GRAMS = 'GRAMS',
  UNITS = 'UNITS',
}

export interface Item {
  id: number;
  inventory_id: number;
  name: string;
  quantity: number;
  quantity_unit: QuantityUnit;
  createdAt: Date;
  updatedAt: Date;
}
