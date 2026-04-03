import { useState, useEffect } from 'react';
import { Inventory } from '../../domain/entities/inventory';
import { IInventoryUseCase } from '../../domain/interfaces/IInventoryUseCase';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';

export const useInventoryVM = () => {
  const [inventory, setInventory] = useState<Inventory | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const inventoryUseCase = container.get<IInventoryUseCase>(TYPES.IInventoryUseCase);

  const loadInventory = (user_uuid: string) => {
    setIsLoading(true);
    const data = inventoryUseCase.getByUserUUID(user_uuid);
    setInventory(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInventory('1');
  }, []);

  const addInventory = (user_uuid: string) => {
    const newInventory = inventoryUseCase.add(user_uuid);
    setInventory(newInventory);
  };

  const deleteInventory = (id: string) => {
    inventoryUseCase.delete(id);
    setInventory(undefined);
  };

  return { inventory, isLoading, loadInventory, addInventory, deleteInventory };
};
