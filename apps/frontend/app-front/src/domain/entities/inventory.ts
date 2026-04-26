import { Item } from './item';

export interface Inventory {
  id: string;
  inventory_uuid?: string;
  user_uuid?: string;
  items: Item[];
  createdAt?: Date;
  updatedAt?: Date;
}
