import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Input,
  IconButton,
  Text,
  useColorModeValue,
  HStack,
  Avatar,
  Button,
  useToast,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Badge,
} from '@chakra-ui/react';
import { MdSend, MdChat } from 'react-icons/md';
import { collection, query, orderBy, limit, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { ChakraIcon } from './ChakraIcon';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: string;
  userPhotoURL?: string;
}

export function GlobalChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.CHATS),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(newMessages.reverse());
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to send messages",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, COLLECTIONS.CHATS), {
        content: newMessage.trim(),
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      });
      setNewMessage('');
    } catch (error) {
      toast({
        title: "Error sending message",
        status: "error",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ChatButton = () => (
    <Button
      position="fixed"
      bottom="4"
      right="4"
      colorScheme="purple"
      onClick={onOpen}
      leftIcon={<ChakraIcon icon={MdChat} />}
      size="lg"
      rounded="full"
      shadow="lg"
      _hover={{ transform: 'scale(1.05)' }}
      transition="all 0.2s"
    >
      Chat
      {messages.length > 0 && (
        <Badge
          ml={2}
          colorScheme="red"
          borderRadius="full"
          position="absolute"
          top="-2"
          right="-2"
        >
          {messages.length}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      <ChatButton />
      
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Global Chat</DrawerHeader>

          <DrawerBody p={0}>
            <VStack h="full" spacing={0}>
              <Box
                flex={1}
                w="full"
                overflowY="auto"
                p={4}
                bg={useColorModeValue('gray.50', 'gray.900')}
              >
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <MotionBox
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      mb={4}
                    >
                      <HStack
                        alignItems="start"
                        spacing={3}
                        bg={bgColor}
                        p={3}
                        borderRadius="lg"
                        borderWidth="1px"
                        borderColor={borderColor}
                        boxShadow="sm"
                      >
                        <Avatar
                          size="sm"
                          name={message.userName}
                          src={message.userPhotoURL}
                        />
                        <Box flex={1}>
                          <HStack mb={1}>
                            <Text fontWeight="bold" fontSize="sm">
                              {message.userName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </Text>
                          </HStack>
                          <Text fontSize="md">{message.content}</Text>
                        </Box>
                      </HStack>
                    </MotionBox>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </Box>

              <Box
                p={4}
                w="full"
                borderTopWidth="1px"
                bg={bgColor}
              >
                <form onSubmit={handleSendMessage}>
                  <HStack>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={!user || isLoading}
                    />
                    <IconButton
                      type="submit"
                      aria-label="Send message"
                      icon={<ChakraIcon icon={MdSend} />}
                      colorScheme="purple"
                      isLoading={isLoading}
                      disabled={!user || !newMessage.trim()}
                    />
                  </HStack>
                </form>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
