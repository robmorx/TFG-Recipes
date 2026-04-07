export enum QuantityUnit {
  LITRES = 'LITRES',
  KILOGRAMS = 'KILOGRAMS',
  GRAMS = 'GRAMS',
  UNITS = 'UNITS',
}

export interface Item {
  id: string;
  inventory_id?: string;
  name: string;
  quantity?: number;
  quantity_unit?: QuantityUnit;
  atcreated?: Date;
  atmodified?: Date;
}
