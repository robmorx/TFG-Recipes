import type { QuantityUnit } from '../item';

export class ItemResponseDTO {
  id: number;
  name: string;
  quantity: number;
  quantity_unit: QuantityUnit;
}
