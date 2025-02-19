import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Text,
  VStack,
  useColorModeValue,
  Heading,
  Badge,
  HStack,
  Button,
  useToast,
  PinInput,
  PinInputField,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Skeleton,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MdShare, MdArrowBack } from 'react-icons/md';
import { motion } from 'framer-motion';
import { ChakraIcon } from '../components/ChakraIcon';

const MotionBox = motion(Box);

type ConfessionType = 'letter' | 'card' | 'note' | 'poem' | 'story';

interface Confession {
  id: string;
  content: string;
  type: ConfessionType;
  createdAt: string;
  views: number;
  userId: string;
  pin: number;
}

const typeColors: Record<ConfessionType, string> = {
  letter: 'pink',
  card: 'purple',
  note: 'blue',
  poem: 'green',
  story: 'orange',
};

export default function ViewConfession() {
  const { id } = useParams<{ id: string }>();
  const [confession, setConfession] = useState<Confession | null>(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const toast = useToast();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    async function fetchConfession() {
      if (!id) return;

      try {
        const docRef = doc(db, 'confessions', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Ensure PIN is a number
          const pin = typeof data.pin === 'string' ? parseInt(data.pin, 10) : data.pin;
          setConfession({ 
            id: docSnap.id, 
            ...data, 
            pin 
          } as Confession);
          setIsPinModalOpen(true);

          // Increment view count
          await updateDoc(docRef, {
            views: increment(1)
          });
        } else {
          toast({
            title: "Confession not found",
            status: "error",
            duration: 3000,
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching confession:', error);
        toast({
          title: "Error fetching confession",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchConfession();
  }, [id, navigate, toast]);

  const handlePinSubmit = () => {
    if (!confession) return;

    // Convert entered PIN to number
    const enteredPin = parseInt(pin, 10);

    // Ensure both PINs are numbers
    const storedPin = typeof confession.pin === 'string' ? parseInt(confession.pin, 10) : confession.pin;

    if (enteredPin === storedPin) {
      setIsUnlocked(true);
      setIsPinModalOpen(false);
      setPinAttempts(0);
    } else {
      setPinAttempts(prev => prev + 1);
      if (pinAttempts >= 2) {
        toast({
          title: "Too many attempts",
          description: "Please try again later",
          status: "error",
          duration: 3000,
        });
        navigate('/');
      } else {
        toast({
          title: "Incorrect PIN",
          description: `${3 - pinAttempts} attempts remaining`,
          status: "error",
          duration: 3000,
        });
      }
      setPin('');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      status: "success",
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={6}>
          <Skeleton height="40px" width="200px" />
          <Skeleton height="300px" width="100%" />
        </VStack>
      </Container>
    );
  }

  if (!confession) {
    return (
      <Container maxW="container.md" py={8}>
        <Text>Confession not found</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6}>
        <HStack width="100%" justify="space-between">
          <IconButton
            aria-label="Go back"
            icon={<ChakraIcon icon={MdArrowBack} boxSize={5} />}
            onClick={() => navigate('/')}
            variant="ghost"
          />
          <IconButton
            aria-label="Share confession"
            icon={<ChakraIcon icon={MdShare} boxSize={5} />}
            onClick={handleShare}
            variant="ghost"
          />
        </HStack>

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          width="100%"
        >
          <Box
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            bg={bgColor}
            borderColor={borderColor}
          >
            <VStack align="start" spacing={4}>
              <HStack width="100%" justify="space-between">
                <Badge colorScheme={typeColors[confession.type]}>
                  {confession.type}
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  {new Date(confession.createdAt).toLocaleDateString()}
                </Text>
              </HStack>

              <Box width="100%">
                {isUnlocked ? (
                  <Text whiteSpace="pre-wrap">{confession.content}</Text>
                ) : (
                  <Text
                    css={{
                      filter: 'blur(4px)',
                    }}
                  >
                    {confession.content}
                  </Text>
                )}
              </Box>

              <Text fontSize="sm" color="gray.500">
                {confession.views} views
              </Text>
            </VStack>
          </Box>
        </MotionBox>
      </VStack>

      <Modal
        isOpen={isPinModalOpen}
        onClose={() => navigate('/')}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter PIN to unlock</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text>Please enter the 4-digit PIN to view this confession</Text>
              <HStack justify="center">
                <PinInput
                  value={pin}
                  onChange={setPin}
                  onComplete={handlePinSubmit}
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
              <Button
                colorScheme="pink"
                onClick={handlePinSubmit}
                isDisabled={pin.length !== 4}
              >
                Unlock
              </Button>
              {/* Debug info */}
              <Text fontSize="xs" color="gray.500">
                Entered PIN: {pin}
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
