import React from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  SimpleGrid,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdFavorite, MdLock, MdCreate, MdVisibility } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { IconType } from 'react-icons';
import { ChakraIcon } from '../components/ChakraIcon';

const MotionBox = motion(Box);

interface FeatureProps {
  title: string;
  description: string;
  icon: IconType;
}

const Feature: React.FC<FeatureProps> = ({ title, icon, description }) => {
  return (
    <VStack
      p={6}
      bg={useColorModeValue('white', 'gray.800')}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      borderRadius="lg"
      align="start"
      spacing={4}
      height="100%"
    >
      <ChakraIcon icon={icon} boxSize={8} color="pink.500" />
      <Heading size="md">{title}</Heading>
      <Text color={useColorModeValue('gray.600', 'gray.300')}>{description}</Text>
    </VStack>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const handleCreateConfession = () => {
    if (!user) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to create a confession",
        status: "info",
        duration: 3000,
      });
      navigate('/login');
      return;
    }
    navigate('/create');
  };

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={12}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          textAlign="center"
        >
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, pink.400, purple.500)"
            backgroundClip="text"
            mb={4}
          >
            Love Confessions
          </Heading>
          <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')} maxW="2xl" mx="auto">
            Share your heartfelt messages with those you care about, securely and anonymously.
          </Text>
        </MotionBox>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} width="100%">
          <Feature
            icon={MdLock}
            title="Secure & Private"
            description="Your confessions are protected with PIN access, ensuring only intended recipients can view them."
          />
          <Feature
            icon={MdFavorite}
            title="Express Yourself"
            description="Choose from various confession types including letters, cards, notes, poems, and stories."
          />
          <Feature
            icon={MdVisibility}
            title="Anonymous"
            description="Share your feelings without revealing your identity, unless you choose to."
          />
        </SimpleGrid>

        <HStack spacing={4}>
          <Button
            colorScheme="pink"
            size="lg"
            leftIcon={<ChakraIcon icon={MdCreate} boxSize={5} />}
            onClick={handleCreateConfession}
          >
            Create Confession
          </Button>
          <Button
            colorScheme="pink"
            variant="outline"
            size="lg"
            onClick={() => navigate('/board')}
          >
            View Confessions
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
}
