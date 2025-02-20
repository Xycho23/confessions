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
  Center,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Textarea,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MdShare, MdArrowBack } from 'react-icons/md';
import { motion } from 'framer-motion';
import { ChakraIcon } from '../components/ChakraIcon';
import { HiDotsVertical } from 'react-icons/hi';

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
  isHidden: boolean;
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
            pin,
            isHidden: data.isHidden || false
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

  const handleHideToggle = async () => {
    if (!confession) return;

    try {
      const docRef = doc(db, 'confessions', confession.id);
      await updateDoc(docRef, {
        isHidden: !confession.isHidden
      });

      toast({
        title: `Confession ${confession.isHidden ? 'unhidden' : 'hidden'}`,
        status: 'success',
        duration: 3000
      });

      // Update local state
      setConfession(prev => prev ? {
        ...prev,
        isHidden: !prev.isHidden
      } : null);
    } catch (error) {
      console.error('Error toggling confession visibility:', error);
      toast({
        title: 'Error updating confession',
        status: 'error',
        duration: 3000
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW={{ base: "100%", md: "90%", lg: "80%" }} p={{ base: 2, md: 4 }}>
        {loading ? (
          <Center h="50vh">
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : !confession ? (
          <Alert status="error" rounded="lg">
            <AlertIcon />
            Confession not found
          </Alert>
        ) : (
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
              <Button
                leftIcon={<ChakraIcon icon={MdArrowBack} />}
                onClick={() => navigate(-1)}
                size={{ base: "sm", md: "md" }}
                variant="ghost"
                rounded="full"
              >
                Back
              </Button>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                {new Date(confession.createdAt).toLocaleDateString()}
              </Text>
              <Menu>
                <MenuButton as={IconButton} icon={<ChakraIcon icon={HiDotsVertical} />} />
                <MenuList>
                  <MenuItem onClick={handleHideToggle}>
                    {confession.isHidden ? 'Unhide' : 'Hide'}
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>

            <Box
              p={{ base: 4, md: 6 }}
              borderRadius="xl"
              bg="white"
              boxShadow="sm"
              {...getThemeStyles(confession.type)}
            >
              <VStack spacing={4} align="stretch">
                <Badge 
                  alignSelf="flex-start"
                  variant="subtle"
                  colorScheme={getThemeColor(confession.type)}
                  rounded="full"
                  px={3}
                  py={1}
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  {confession.type}
                </Badge>

                <Text
                  fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                  fontWeight="medium"
                  lineHeight="tall"
                  whiteSpace="pre-wrap"
                >
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
                </Text>

                <HStack justify="space-between" mt={2}>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                    {confession.views} views
                  </Text>
                </HStack>
              </VStack>
            </Box>

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
                        size={{ base: "lg", md: "xl" }}
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
          </VStack>
        )}
      </Container>
    </Box>
  );
}

function getThemeStyles(type: ConfessionType) {
  switch (type) {
    case 'letter':
      return {
        bg: 'pink.100',
        borderColor: 'pink.200',
      };
    case 'card':
      return {
        bg: 'purple.100',
        borderColor: 'purple.200',
      };
    case 'note':
      return {
        bg: 'blue.100',
        borderColor: 'blue.200',
      };
    case 'poem':
      return {
        bg: 'green.100',
        borderColor: 'green.200',
      };
    case 'story':
      return {
        bg: 'orange.100',
        borderColor: 'orange.200',
      };
    default:
      return {};
  }
}

function getThemeColor(type: ConfessionType) {
  switch (type) {
    case 'letter':
      return 'pink';
    case 'card':
      return 'purple';
    case 'note':
      return 'blue';
    case 'poem':
      return 'green';
    case 'story':
      return 'orange';
    default:
      return 'gray';
  }
}
