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
import { MdArrowBack } from 'react-icons/md';
import { ChakraIcon } from '../components/ChakraIcon';

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
        isHidden: false
      };

      // Get reference to confessions collection
      const confessionsRef = collection(db, COLLECTIONS.CONFESSIONS);

      // Add the document
      const docRef = await addDoc(confessionsRef, confessionData);

      // Create share URL
      const shareUrl = `${window.location.origin}/confession/${docRef.id}`;

      // Try to copy to clipboard, but don't block on failure
      try {
        await navigator.clipboard.writeText(shareUrl);
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
      } catch (clipboardError) {
        // Handle clipboard error gracefully
        toast({
          title: "Confession created!",
          description: (
            <Fragment>
              Your confession has been shared successfully.
              <br />
              Share link: {shareUrl}
            </Fragment>
          ),
          status: "success",
          duration: 8000,
        });
      }

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
    <Box minH="100vh" bg="gray.50">
      <Container maxW={{ base: "100%", md: "90%", lg: "70%" }} p={{ base: 2, md: 4 }}>
        <VStack spacing={{ base: 3, md: 6 }} align="stretch">
          <HStack 
            justify="space-between" 
            wrap="wrap" 
            gap={2}
            position="sticky"
            top={0}
            bg="gray.50"
            p={2}
            zIndex={1}
            boxShadow="sm"
          >
            <Heading size={{ base: "md", md: "lg" }}>Create Confession</Heading>
            <Button
              leftIcon={<ChakraIcon icon={MdArrowBack} />}
              onClick={() => navigate(-1)}
              size={{ base: "sm", md: "md" }}
              variant="ghost"
              rounded="full"
            >
              Back
            </Button>
          </HStack>

          <Box
            p={{ base: 4, md: 6 }}
            borderRadius="xl"
            bg="white"
            boxShadow="sm"
          >
            <VStack spacing={{ base: 3, md: 4 }}>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: "sm", md: "md" }}>Type</FormLabel>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value as ConfessionType)}
                  size={{ base: "md", md: "lg" }}
                  rounded="lg"
                  bg="white"
                  _focus={{ boxShadow: "outline" }}
                >
                  <option value="letter">Love Letter</option>
                  <option value="card">Greeting Card</option>
                  <option value="note">Sweet Note</option>
                  <option value="poem">Love Poem</option>
                  <option value="story">Love Story</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize={{ base: "sm", md: "md" }}>Content</FormLabel>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Pour your heart out..."
                  size="lg"
                  minH={{ base: "150px", md: "200px" }}
                  resize="vertical"
                  rounded="lg"
                  bg="white"
                  _focus={{ boxShadow: "outline" }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {content.length}/{MAX_CONTENT_LENGTH} characters
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize={{ base: "sm", md: "md" }}>PIN</FormLabel>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={2}>
                  Set a 4-digit PIN to protect your confession
                </Text>
                <HStack justify="center" py={2}>
                  <PinInput
                    value={pin}
                    onChange={setPin}
                    type="number"
                    mask
                    size={{ base: "lg", md: "xl" }}
                  >
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </HStack>
              </FormControl>

              <Button
                colorScheme="blue"
                width="100%"
                mt={4}
                isLoading={isSubmitting}
                onClick={handleSubmit}
                size={{ base: "lg", md: "xl" }}
                rounded="full"
                isDisabled={content.length < MIN_CONTENT_LENGTH || pin.length !== 4}
                _disabled={{
                  opacity: 0.6,
                  cursor: "not-allowed"
                }}
              >
                Share Your Love
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
