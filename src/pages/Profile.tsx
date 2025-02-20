import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Card,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface UserProfile {
  displayName: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setDisplayName(userData.displayName || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error fetching profile',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        displayName: displayName.trim(),
      });

      toast({
        title: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (!user) {
    return (
      <Box p={4}>
        <Text>Please sign in to view your profile.</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Card p={6} bg={bgColor}>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Profile Settings</Heading>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Display Name</FormLabel>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                isLoading={loading}
              >
                Save Changes
              </Button>
            </VStack>
          </form>
        </VStack>
      </Card>
    </Box>
  );
}
