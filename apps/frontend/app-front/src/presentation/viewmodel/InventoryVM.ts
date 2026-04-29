import { useState, useEffect } from 'react';
import { Inventory } from '../../domain/entities/inventory';
import { IInventoryUseCase } from '../../domain/interfaces/IInventoryUseCase';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';
import { useAuth } from '../context/AuthContext';

export const useInventoryVM = () => {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const inventoryUseCase = container.get<IInventoryUseCase>(TYPES.IInventoryUseCase);

  console.log('[DEBUG] useInventoryVM - user from useAuth:', user);

  const loadInventory = async () => {
    if (!user?.user_uuid) {
      console.log('[DEBUG] useInventoryVM - no user_uuid, skipping');
      return;
    }
    console.log('[DEBUG] InventoryVM.loadInventory called with uuid:', user.user_uuid);
    setIsLoading(true);
    try {
      const data = await inventoryUseCase.getByUserUUID(user.user_uuid);
      console.log('[DEBUG] InventoryVM.loadInventory - API response:', data);
      setInventory(data);
    } catch (error) {
      console.error('[DEBUG] InventoryVM.loadInventory - Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('[DEBUG] InventoryVM useEffect triggered, user:', user?.user_uuid);
    if (user?.user_uuid) {
      loadInventory();
    }
  }, [user?.user_uuid]);

  return { 
    inventory, 
    isLoading, 
    loadInventory,
  };
};