import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { useAuth } from '@/hooks/useAuth';

export interface Booking {
  id: string;
  equipment_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  equipment?: {
    name: string;
    location: string;
  };
}

export function useBookings(isAdmin: boolean = false) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let q;
      if (isAdmin) {
        q = query(collection(db, 'bookings'), orderBy('booking_date', 'asc'));
      } else {
        q = query(
          collection(db, 'bookings'),
          where('user_id', '==', user.uid),
          orderBy('booking_date', 'asc')
        );
      }
      
      const snapshot = await getDocs(q);
      const bookingsData: Booking[] = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let equipment;
          
          // Fetch equipment details if equipment_id exists
          if (data.equipment_id) {
            try {
              const equipmentDoc = await getDoc(doc(db, 'equipment', data.equipment_id));
              if (equipmentDoc.exists()) {
                const equipData = equipmentDoc.data();
                equipment = {
                  name: equipData.name || 'Unknown',
                  location: equipData.location || 'Unknown',
                };
              }
            } catch (err) {
              console.error('Error fetching equipment:', err);
            }
          }
          
          return {
            id: docSnap.id,
            ...data,
            equipment,
          } as Booking;
        })
      );
      
      setBookings(bookingsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user, isAdmin]);

  const createBooking = async (booking: {
    equipment_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }) => {
    if (!user) throw new Error('Not authenticated');

    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...booking,
        user_id: user.uid,
        status: 'confirmed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      // Fetch equipment details for the new booking
      let equipment;
      try {
        const equipmentDoc = await getDoc(doc(db, 'equipment', booking.equipment_id));
        if (equipmentDoc.exists()) {
          const equipData = equipmentDoc.data();
          equipment = {
            name: equipData.name || 'Unknown',
            location: equipData.location || 'Unknown',
          };
        }
      } catch (err) {
        console.error('Error fetching equipment:', err);
      }
      
      const newBooking: Booking = {
        id: docRef.id,
        ...booking,
        user_id: user.uid,
        status: 'confirmed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        equipment,
      };
      
      setBookings([...bookings, newBooking]);
      return newBooking;
    } catch (err) {
      throw err;
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'cancelled' });
      setBookings(
        bookings.map((b) =>
          b.id === id ? { ...b, status: 'cancelled' as const } : b
        )
      );
    } catch (err) {
      throw err;
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    createBooking,
    cancelBooking,
    deleteBooking,
  };
}