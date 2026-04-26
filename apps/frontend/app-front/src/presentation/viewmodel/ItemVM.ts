import { useState, useEffect } from 'react';
import { Item } from '../../domain/entities/item';
import { IItemUseCase } from '../../domain/interfaces/IItemUseCase';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';

export const useItemVM = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const itemUseCase = container.get<IItemUseCase>(TYPES.IItemUseCase);

  const loadItems = async () => {
    setIsLoading(true);
    const data = await itemUseCase.get();
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const addItem = async (item: { inventory_uuid: string; name: string; quantity: number; quantity_unit: string }) => {
    await itemUseCase.post(item);
    await loadItems();
  };

  const editItem = async (item: Item) => {
    await itemUseCase.update(item);
    await loadItems();
  };

  const removeItem = async (id: string) => {
    await itemUseCase.delete(id);
    await loadItems();
  };

  return { items, isLoading, loadItems, addItem, editItem, removeItem };
};