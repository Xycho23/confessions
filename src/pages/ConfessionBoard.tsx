import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  Heading,
  Container,
  Badge,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Skeleton,
  SkeletonText,
  Icon,
  Alert,
  AlertIcon,
  FormControl,
  Textarea,
  FormLabel,
  PinInputField,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Center
} from '@chakra-ui/react';
import {
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  setDoc,
  where,
  addDoc,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdMoreVert, MdShare, MdLock, MdVisibility, MdVisibilityOff, MdChat, MdSearch } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { ChakraIcon } from '../components/ChakraIcon';
import { CustomPinInput as PinInput } from '../components/PinInput';

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

interface Reply {
  id: string;
  content: string;
  userId: string;
  pin: number;
  createdAt: string;
  parentId: string;
}

interface NewReply {
  content: string;
  userId: string;
  pin: number;
  createdAt: string;
  parentId: string;
}

interface ConfessionCardProps {
  confession: Confession;
  hiddenConfessions: Set<string>;
  onHide: (id: string) => Promise<void>;
  onUnhide: (id: string) => Promise<void>;
}

const typeColors: Record<ConfessionType, string> = {
  letter: 'pink',
  card: 'purple',
  note: 'blue',
  poem: 'green',
  story: 'orange',
};

const confessionThemes: Record<ConfessionType, { bg: string; border: string; shadow: string; icon: string; font: string }> = {
  letter: {
    bg: 'pink.100',
    border: '1px solid pink.400',
    shadow: '0 0 10px rgba(255, 105, 135, 0.2)',
    icon: '',
    font: 'cursive',
  },
  card: {
    bg: 'purple.100',
    border: '1px solid purple.400',
    shadow: '0 0 10px rgba(128, 0, 128, 0.2)',
    icon: '',
    font: 'fantasy',
  },
  note: {
    bg: 'blue.100',
    border: '1px solid blue.400',
    shadow: '0 0 10px rgba(0, 0, 255, 0.2)',
    icon: '',
    font: 'monospace',
  },
  poem: {
    bg: 'green.100',
    border: '1px solid green.400',
    shadow: '0 0 10px rgba(0, 128, 0, 0.2)',
    icon: '',
    font: 'serif',
  },
  story: {
    bg: 'orange.100',
    border: '1px solid orange.400',
    shadow: '0 0 10px rgba(255, 165, 0, 0.2)',
    icon: '',
    font: 'sans-serif',
  },
};

const LoadingCard = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      borderColor={borderColor}
      h="full"
    >
      <VStack align="start" spacing={3} h="full">
        <HStack width="100%" justify="space-between">
          <Skeleton height="20px" width="60px" />
          <Skeleton height="20px" width="100px" />
        </HStack>
        <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
        <HStack width="100%" justify="space-between" mt="auto">
          <Skeleton height="20px" width="80px" />
          <Skeleton height="32px" width="32px" borderRadius="md" />
        </HStack>
      </VStack>
    </Box>
  );
};

const ConfessionCard = ({ confession, hiddenConfessions, onHide, onUnhide }: ConfessionCardProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [error, setError] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [replyPin, setReplyPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const theme = confessionThemes[confession.type];
  const navigate = useNavigate();

  const handleVerifyPin = () => {
    if (parseInt(pin) === confession.pin) {
      setIsVerified(true);
      setError('');
      setShowPinInput(false);
    } else {
      setError('Incorrect PIN');
    }
  };

  const handleCopy = () => {
    if (!isVerified) {
      setShowPinInput(true);
      return;
    }
    const shareLink = `${window.location.origin}/confession/${confession.id}`;
    navigator.clipboard.writeText(shareLink);
    toast({
      title: 'Share link copied!',
      status: 'success',
      duration: 2000,
    });
  };

  const handleReply = async () => {
    if (!user) {
      toast({
        title: 'Please sign in to reply',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    if (replyContent.trim().length < 1) {
      toast({
        title: 'Reply cannot be empty',
        status: 'error',
        duration: 3000
      });
      return;
    }

    if (replyPin.length !== 4 || !/^\d{4}$/.test(replyPin)) {
      toast({
        title: 'Invalid PIN',
        description: 'Please enter a valid 4-digit PIN',
        status: 'error',
        duration: 3000
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const replyData: NewReply = {
        content: replyContent.trim(),
        userId: user.uid,
        pin: parseInt(replyPin, 10),
        createdAt: new Date().toISOString(),
        parentId: confession.id
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.REPLIES), replyData);
      
      // Create share URL for the reply
      const shareUrl = `${window.location.origin}/reply/${docRef.id}`;
      await navigator.clipboard.writeText(shareUrl);

      setReplies(prev => [{
        id: docRef.id,
        ...replyData
      } as Reply, ...prev]);
      
      setReplyContent('');
      setReplyPin('');
      toast({
        title: 'Reply added!',
        description: 'Share link has been copied to your clipboard!',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: 'Error adding reply',
        status: 'error',
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showReplies) {
      const fetchReplies = async () => {
        try {
          const q = query(
            collection(db, COLLECTIONS.REPLIES),
            where('parentId', '==', confession.id),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const repliesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Reply));
          setReplies(repliesData);
        } catch (error) {
          console.error('Error fetching replies:', error);
          toast({
            title: 'Error fetching replies',
            status: 'error',
            duration: 3000
          });
        }
      };
      fetchReplies();
    }
  }, [showReplies, confession.id, toast]);

  return (
    <Box
      p={6}
      borderRadius="lg"
      bg={theme.bg}
      borderWidth="1px"
      borderStyle={theme.border.split(' ')[0]}
      borderColor={theme.border.split(' ')[2]}
      boxShadow={theme.shadow}
      position="relative"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)' }}
    >
      <VStack align="start" spacing={4}>
        <HStack width="100%" justify="space-between">
          <HStack>
            <Text fontSize="xl">{theme.icon}</Text>
            <Badge colorScheme={typeColors[confession.type]}>
              {confession.type}
            </Badge>
          </HStack>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<ChakraIcon icon={MdMoreVert} />}
              variant="ghost"
              size="sm"
            />
            <MenuList>
              <MenuItem
                icon={<ChakraIcon icon={hiddenConfessions.has(confession.id) ? MdVisibility : MdVisibilityOff} />}
                onClick={() => hiddenConfessions.has(confession.id) ? onUnhide(confession.id) : onHide(confession.id)}
              >
                {hiddenConfessions.has(confession.id) ? 'Unhide' : 'Hide'}
              </MenuItem>
              <MenuItem
                icon={<ChakraIcon icon={MdChat} />}
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? 'Hide Replies' : 'Show Replies'}
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        {isVerified ? (
          <Text
            whiteSpace="pre-wrap"
            css={{ fontFamily: theme.font }}
            onClick={() => navigate(`/confession/${confession.id}`)}
            cursor="pointer"
          >
            {confession.content}
          </Text>
        ) : (
          <Box>
            <Text fontSize="lg" fontWeight="medium" mb={2}>
              🔒 This confession is locked
            </Text>
            {showPinInput ? (
              <VStack spacing={2} align="stretch">
                <PinInput
                  value={pin}
                  onChange={(value) => setPin(value)}
                  onComplete={handleVerifyPin}
                  error={error}
                />
                <Button size="sm" onClick={() => setShowPinInput(false)}>
                  Cancel
                </Button>
              </VStack>
            ) : (
              <Text fontSize="sm" color="gray.600">
                Enter PIN to view content
              </Text>
            )}
          </Box>
        )}

        <HStack width="100%" justify="space-between">
          <Text fontSize="sm" color="gray.500">
            {new Date(confession.createdAt).toLocaleDateString()}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {confession.views} views
          </Text>
        </HStack>

        {isVerified && showReplies && (
          <VStack width="100%" spacing={4} pt={4} borderTop="1px" borderColor="gray.200">
            <Box width="100%">
              <FormControl>
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                />
              </FormControl>
              <HStack mt={2} spacing={4}>
                <PinInput
                  value={replyPin}
                  onChange={(value) => setReplyPin(value)}
                  label="PIN (4 digits)"
                />
                <Button
                  colorScheme="pink"
                  onClick={handleReply}
                  isLoading={isSubmitting}
                  loadingText="Sending..."
                  isDisabled={!replyContent.trim() || replyPin.length !== 4}
                  alignSelf="flex-end"
                >
                  Reply
                </Button>
              </HStack>
            </Box>

            {replies.map((reply) => (
              <Box
                key={reply.id}
                width="100%"
                p={4}
                borderRadius="md"
                bg={`${theme.bg}80`}
                borderWidth="1px"
                borderColor={theme.border.split(' ')[2]}
              >
                <Text
                  whiteSpace="pre-wrap"
                  css={{ fontFamily: theme.font }}
                  onClick={() => navigate(`/reply/${reply.id}`)}
                  cursor="pointer"
                >
                  {reply.content}
                </Text>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {new Date(reply.createdAt).toLocaleDateString()}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
      <IconButton
        aria-label="Share confession"
        icon={<ChakraIcon icon={isVerified ? MdShare : MdLock} />}
        size="sm"
        onClick={handleCopy}
      />
    </Box>
  );
};

const BlurredConfessionCard = ({ confession, hiddenConfessions, onHide, onUnhide }: ConfessionCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const overlayBg = useColorModeValue('whiteAlpha.800', 'blackAlpha.800');
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/confession/${confession.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      status: "success",
      duration: 2000,
    });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || user.uid !== confession.userId) {
      toast({
        title: "Permission denied",
        description: "You can only delete your own confessions",
        status: "error",
        duration: 2000,
      });
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.CONFESSIONS, confession.id));
      toast({
        title: "Confession deleted",
        status: "success",
        duration: 2000,
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error deleting confession",
        status: "error",
        duration: 2000,
      });
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <MotionBox
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          bg={bgColor}
          borderColor={borderColor}
          position="relative"
          overflow="hidden"
          h="full"
          role="group"
          onClick={() => navigate(`/confession/${confession.id}`)}
          cursor="pointer"
        >
          <VStack align="start" spacing={3} h="full">
            <HStack width="100%" justify="space-between">
              <Badge colorScheme={typeColors[confession.type]}>
                {confession.type}
              </Badge>
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.500">
                  {new Date(confession.createdAt).toLocaleDateString()}
                </Text>
                <Menu isLazy>
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<ChakraIcon icon={MdMoreVert} boxSize={5} />}
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <MenuList onClick={(e) => e.stopPropagation()}>
                    <MenuItem onClick={handleShare} icon={<ChakraIcon icon={MdShare} boxSize={5} />}>
                      Copy Link
                    </MenuItem>
                    {user && user.uid === confession.userId ? (
                      <MenuItem 
                        onClick={() => setIsDeleteDialogOpen(true)} 
                        icon={<ChakraIcon icon={MdLock} boxSize={5} />}
                        color="red.500"
                      >
                        Delete
                      </MenuItem>
                    ) : user && (
                      <MenuItem 
                        onClick={() => hiddenConfessions.has(confession.id) 
                          ? onUnhide(confession.id)
                          : onHide(confession.id)
                        }
                        icon={<ChakraIcon icon={hiddenConfessions.has(confession.id) ? MdVisibility : MdVisibilityOff} boxSize={5} />}
                      >
                        {hiddenConfessions.has(confession.id) ? 'Unhide' : 'Hide'}
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>
              </HStack>
            </HStack>

            <Box flex="1" width="100%" position="relative">
              <Text
                fontSize={{ base: "md", md: "lg" }}
                noOfLines={6}
                filter="blur(5px)"
              >
                {confession.content}
              </Text>
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg={overlayBg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                gap={2}
              >
                <ChakraIcon icon={MdLock} boxSize={6} />
                <Text fontSize="sm" fontWeight="medium">
                  Enter PIN to view
                </Text>
              </Box>
            </Box>

            <HStack width="100%" justify="space-between" mt="auto">
              <Text fontSize="sm" color="gray.500">
                {confession.views} views
              </Text>
            </HStack>
          </VStack>
        </Box>
      </MotionBox>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Confession
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default function ConfessionBoard() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hiddenConfessions, setHiddenConfessions] = useState<Set<string>>(new Set());
  const [selectedType, setSelectedType] = useState<ConfessionType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchHiddenConfessions = useCallback(async () => {
    if (!user) {
      setHiddenConfessions(new Set());
      return;
    }

    try {
      const q = query(
        collection(db, COLLECTIONS.HIDDEN_CONFESSIONS),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const hiddenIds = new Set<string>();
      querySnapshot.forEach((doc) => {
        hiddenIds.add(doc.data().confessionId);
      });
      setHiddenConfessions(hiddenIds);
    } catch (error) {
      console.error('Error fetching hidden confessions:', error);
    }
  }, [user]);

  const fetchConfessions = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, COLLECTIONS.CONFESSIONS),
        sortBy === 'newest' 
          ? orderBy('createdAt', 'desc')
          : orderBy('views', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedConfessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Confession[];

      setConfessions(fetchedConfessions);
      setError(null);
    } catch (error) {
      console.error('Error fetching confessions:', error);
      setError('Failed to load confessions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchConfessions();
    fetchHiddenConfessions();
  }, [fetchConfessions, fetchHiddenConfessions]);

  const handleCreateConfession = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to create a confession",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    navigate('/create');
  };

  const filteredConfessions = confessions
    .filter(confession => {
      if (selectedType !== 'all' && confession.type !== selectedType) return false;
      if (searchTerm && !confession.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="6xl">
        {/* Header Section */}
        <VStack spacing={8} mb={12}>
          <Heading fontSize={{ base: "2xl", md: "4xl" }} textAlign="center">
            Confession Wall
          </Heading>
          <Text fontSize="lg" color="gray.500" textAlign="center" maxW="2xl">
            Share your thoughts anonymously. Each confession is protected by a PIN, ensuring your privacy.
          </Text>
          <Button
            size="lg"
            colorScheme="purple"
            leftIcon={<ChakraIcon icon={MdChat} boxSize={5} />}
            onClick={handleCreateConfession}
          >
            Create Confession
          </Button>
        </VStack>

        {/* Filters Section */}
        <HStack spacing={4} mb={8} wrap="wrap">
          <InputGroup maxW="300px">
            <InputLeftElement>
              <ChakraIcon icon={MdSearch} color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Search confessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={cardBg}
            />
          </InputGroup>

          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ConfessionType | 'all')}
            maxW="200px"
            bg={cardBg}
          >
            <option value="all">All Types</option>
            <option value="letter">Letters</option>
            <option value="card">Cards</option>
            <option value="note">Notes</option>
            <option value="poem">Poems</option>
            <option value="story">Stories</option>
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
            maxW="200px"
            bg={cardBg}
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Viewed</option>
          </Select>
        </HStack>

        {/* Error Message */}
        {error && (
          <Alert status="error" mb={8} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {[...Array(6)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </SimpleGrid>
        ) : (
          <>
            {/* Results Summary */}
            <Text mb={4} color="gray.500">
              Showing {filteredConfessions.length} confession{filteredConfessions.length !== 1 ? 's' : ''}
            </Text>

            {/* Confessions Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {filteredConfessions.map((confession) => (
                <BlurredConfessionCard
                  key={confession.id}
                  confession={confession}
                  hiddenConfessions={hiddenConfessions}
                  onHide={async (id) => {
                    if (!user) {
                      toast({
                        title: "Please log in",
                        description: "You need to be logged in to hide confessions",
                        status: "warning",
                        duration: 3000,
                      });
                      return;
                    }
                    try {
                      await addDoc(collection(db, COLLECTIONS.HIDDEN_CONFESSIONS), {
                        userId: user.uid,
                        confessionId: id,
                        hiddenAt: new Date().toISOString()
                      });
                      await fetchHiddenConfessions();
                      toast({
                        title: "Confession hidden",
                        status: "success",
                        duration: 2000,
                      });
                    } catch (error) {
                      console.error('Error hiding confession:', error);
                      toast({
                        title: "Error hiding confession",
                        status: "error",
                        duration: 2000,
                      });
                    }
                  }}
                  onUnhide={async (id) => {
                    if (!user) return;
                    try {
                      const q = query(
                        collection(db, COLLECTIONS.HIDDEN_CONFESSIONS),
                        where('userId', '==', user.uid),
                        where('confessionId', '==', id)
                      );
                      const querySnapshot = await getDocs(q);
                      const deletePromises = querySnapshot.docs.map(doc => 
                        deleteDoc(doc.ref)
                      );
                      await Promise.all(deletePromises);
                      await fetchHiddenConfessions();
                      toast({
                        title: "Confession unhidden",
                        status: "success",
                        duration: 2000,
                      });
                    } catch (error) {
                      console.error('Error unhiding confession:', error);
                      toast({
                        title: "Error unhiding confession",
                        status: "error",
                        duration: 2000,
                      });
                    }
                  }}
                />
              ))}
            </SimpleGrid>

            {/* Empty State */}
            {filteredConfessions.length === 0 && (
              <Center py={12}>
                <VStack spacing={4}>
                  <ChakraIcon icon={MdChat} boxSize={12} color="gray.400" />
                  <Text color="gray.500" fontSize="lg">
                    No confessions found
                  </Text>
                  <Button
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => {
                      setSelectedType('all');
                      setSearchTerm('');
                      setSortBy('newest');
                    }}
                  >
                    Clear Filters
                  </Button>
                </VStack>
              </Center>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
