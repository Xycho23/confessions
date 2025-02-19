import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { confessionServices } from '../services/firebase';
import { Confession } from '../config/firebase';

interface UseFirebaseReturn {
  loading: boolean;
  error: string | null;
  createConfession: (data: Omit<Confession, 'id'>) => Promise<string>;
  getConfession: (id: string) => Promise<Confession | null>;
  getConfessions: () => Promise<Confession[]>;
  getUserConfessions: (userId: string) => Promise<Confession[]>;
  deleteConfession: (id: string) => Promise<void>;
  updateConfessionViews: (id: string) => Promise<void>;
}

export function useFirebase(): UseFirebaseReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleError = (error: any) => {
    console.error('Firebase operation failed:', error);
    setError(error.message);
    toast({
      title: 'Error',
      description: error.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const wrapOperation = async <T,>(operation: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await operation();
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createConfession: (data) => wrapOperation(() => confessionServices.createConfession(data)),
    getConfession: (id) => wrapOperation(() => confessionServices.getConfession(id)),
    getConfessions: () => wrapOperation(() => confessionServices.getConfessions()),
    getUserConfessions: (userId) => wrapOperation(() => confessionServices.getUserConfessions(userId)),
    deleteConfession: (id) => wrapOperation(() => confessionServices.deleteConfession(id)),
    updateConfessionViews: (id) => wrapOperation(() => confessionServices.updateConfessionViews(id)),
  };
}
