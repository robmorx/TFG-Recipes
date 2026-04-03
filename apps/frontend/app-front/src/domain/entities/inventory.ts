export interface Inventory {
  id: string;
  inventory_uuid?: string;
  user_uuid?: string;
  items: Item[];
  atcreated?: Date;
  atmodified?: Date;
}
