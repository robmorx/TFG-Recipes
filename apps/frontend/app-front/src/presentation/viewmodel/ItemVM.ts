import { useState } from 'react';
import { Item } from '../../domain/entities/item';
import { IItemUseCase } from '../../domain/interfaces/IItemUseCase';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';

export const useItemVM = () => {
  const [isLoading, setIsLoading] = useState(false);

  const itemUseCase = container.get<IItemUseCase>(TYPES.IItemUseCase);

  const addItem = async (item: { inventory_uuid: string; name: string; quantity: number; quantity_unit: string }) => {
    setIsLoading(true);
    try {
      console.log("VM")
      await itemUseCase.post(item);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const editItem = async (item: Item) => {
    setIsLoading(true);
    try {
      await itemUseCase.update({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        quantity_unit: item.quantityUnit,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    setIsLoading(true);
    try {
      await itemUseCase.delete(id);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, addItem, editItem, removeItem };
};