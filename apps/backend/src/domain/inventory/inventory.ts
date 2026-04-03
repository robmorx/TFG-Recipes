import { Item } from '../item/item';

export interface Inventory {
  id: number;
  inventory_uuid: string;
  user_uuid: string;
  items: Item[];
  createdAt: Date;
  updatedAt: Date;
}
