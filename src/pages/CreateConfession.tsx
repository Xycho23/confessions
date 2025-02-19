import React, { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
  Heading,
  PinInput,
  PinInputField,
  HStack,
  Text,
  useColorModeValue,
  FormHelperText,
} from '@chakra-ui/react';
import { collection, addDoc } from 'firebase/firestore';
import { db, ConfessionType, NewConfession, COLLECTIONS } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 2000;
const PIN_LENGTH = 4;

export default function CreateConfession() {
  const [content, setContent] = useState('');
  const [type, setType] = useState<ConfessionType>('letter');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to create a confession",
        status: "warning",
        duration: 3000,
      });
      navigate('/login');
    }
  }, [user, navigate, toast]);

  const validateConfession = () => {
    if (!user) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to create a confession",
        status: "error",
        duration: 3000,
      });
      return false;
    }

    if (content.trim().length < MIN_CONTENT_LENGTH) {
      toast({
        title: "Confession too short",
        description: `Please write at least ${MIN_CONTENT_LENGTH} characters`,
        status: "error",
        duration: 3000,
      });
      return false;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      toast({
        title: "Confession too long",
        description: `Please keep your confession under ${MAX_CONTENT_LENGTH} characters`,
        status: "error",
        duration: 3000,
      });
      return false;
    }

    if (pin.length !== PIN_LENGTH || !/^\d{4}$/.test(pin)) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a valid 4-digit PIN",
        status: "error",
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateConfession()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create confession data
      const confessionData: NewConfession = {
        content: content.trim(),
        type,
        pin: parseInt(pin, 10), // Convert PIN to number
        userId: user!.uid,
        createdAt: new Date().toISOString(),
        views: 0,
      };

      // Get reference to confessions collection
      const confessionsRef = collection(db, COLLECTIONS.CONFESSIONS);

      // Add the document
      const docRef = await addDoc(confessionsRef, confessionData);

      // Create share URL
      const shareUrl = `${window.location.origin}/confession/${docRef.id}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      // Show success message
      toast({
        title: "Confession created!",
        description: (
          <Fragment>
            Your confession has been shared successfully.
            <br />
            The share link has been copied to your clipboard!
          </Fragment>
        ),
        status: "success",
        duration: 5000,
      });

      // Navigate to the new confession
      navigate(`/confession/${docRef.id}`);
    } catch (error) {
      console.error('Error creating confession:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        const firebaseError = error as { code?: string; message: string };
        
        if (firebaseError.code === 'permission-denied') {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to create confessions",
            status: "error",
            duration: 3000,
          });
        } else if (firebaseError.code === 'unavailable') {
          toast({
            title: "Service Unavailable",
            description: "Please try again later",
            status: "error",
            duration: 3000,
          });
        } else {
          toast({
            title: "Error creating confession",
            description: firebaseError.message || "Please try again later",
            status: "error",
            duration: 3000,
          });
        }
      } else {
        toast({
          title: "Error creating confession",
          description: "An unexpected error occurred. Please try again later",
          status: "error",
          duration: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render the form if not logged in
  if (!user) {
    return null;
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8}>
        <Heading
          bgGradient="linear(to-r, pink.400, purple.500)"
          backgroundClip="text"
        >
          Create Your Love Confession
        </Heading>
        <Box as="form" onSubmit={handleSubmit} width="100%">
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Type</FormLabel>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as ConfessionType)}
              >
                <option value="letter">Love Letter</option>
                <option value="card">Greeting Card</option>
                <option value="note">Sweet Note</option>
                <option value="poem">Love Poem</option>
                <option value="story">Love Story</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Your Confession</FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Pour your heart out..."
                minH="200px"
                maxLength={MAX_CONTENT_LENGTH}
              />
              <Text fontSize="sm" color={textColor} mt={2}>
                {content.length}/{MAX_CONTENT_LENGTH} characters
                {content.length < MIN_CONTENT_LENGTH && (
                  <Text as="span" color="red.500">
                    {" "}(Minimum {MIN_CONTENT_LENGTH} characters required)
                  </Text>
                )}
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>PIN (4 digits)</FormLabel>
              <HStack justify="center">
                <PinInput
                  value={pin}
                  onChange={setPin}
                  type="number"
                  mask
                  otp
                >
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                </PinInput>
              </HStack>
              <FormHelperText>
                This PIN will be required to view your confession
              </FormHelperText>
            </FormControl>

            <Button
              type="submit"
              colorScheme="pink"
              size="lg"
              width="100%"
              isLoading={isSubmitting}
              loadingText="Sharing your love..."
              isDisabled={content.length < MIN_CONTENT_LENGTH || pin.length !== PIN_LENGTH}
            >
              Share Your Love
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
