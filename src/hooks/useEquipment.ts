 import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';

export interface Equipment {
  id: string;
  name: string;
  description: string | null;
  category: string;
  location: string;
  status: 'available' | 'in-use' | 'maintenance';
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'equipment'), orderBy('name'));
      const snapshot = await getDocs(q);
      const data: Equipment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Equipment));
      setEquipment(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const addEquipment = async (
    newEquipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'> & { image_url?: string | null }
  ) => {
    try {
      const docRef = await addDoc(collection(db, 'equipment'), {
        ...newEquipment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      const addedEquipment: Equipment = {
        id: docRef.id,
        ...newEquipment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setEquipment([...equipment, addedEquipment]);
      return addedEquipment;
    } catch (err) {
      throw err;
    }
  };

  const updateEquipment = async (
    id: string,
    updates: Partial<Omit<Equipment, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const equipmentRef = doc(db, 'equipment', id);
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await updateDoc(equipmentRef, updateData);
      setEquipment(
        equipment.map((e) =>
          e.id === id ? { ...e, ...updateData } : e
        )
      );
      return { id, ...updateData };
    } catch (err) {
      throw err;
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'equipment', id));
      setEquipment(equipment.filter((e) => e.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    equipment,
    loading,
    error,
    refetch: fetchEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
  };
}