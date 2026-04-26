import { useState, useEffect } from 'react';
import { Inventory } from '../../domain/entities/inventory';
import { IInventoryUseCase } from '../../domain/interfaces/IInventoryUseCase';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';

export const useInventoryVM = () => {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const inventoryUseCase = container.get<IInventoryUseCase>(TYPES.IInventoryUseCase);

  const loadInventory = async (user_uuid: string) => {
    setIsLoading(true);
    const data = await inventoryUseCase.getByUserUUID(user_uuid);
    setInventory(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInventory('1');
  }, []);

  const deleteInventory = async (user_uuid: string) => {
    await inventoryUseCase.delete(user_uuid);
    setInventory(null);
  };

  return { 
    inventory, 
    isLoading, 
    loadInventory, 
    deleteInventory,
  };
};