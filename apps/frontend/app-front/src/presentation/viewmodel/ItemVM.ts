import { useState, useEffect } from 'react';
import { Item } from '../../domain/entities/item';
import { IItemUseCase } from '../../domain/interfaces/IItemUseCase';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';

export const useItemVM = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const itemUseCase = container.get<IItemUseCase>(TYPES.IItemUseCase);

  const loadItems = () => {
    setIsLoading(true);
    const data = itemUseCase.get();
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const addItem = (item: Item) => {
    itemUseCase.post(item);
    loadItems();
  };

  const editItem = (item: Item) => {
    itemUseCase.update(item);
    loadItems();
  };

  const removeItem = (id: string) => {
    itemUseCase.delete(id);
    loadItems();
  };

  return { items, isLoading, loadItems, addItem, editItem, removeItem };
};
