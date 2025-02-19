import React from 'react';
import {
  Box,
  Flex,
  Button,
  Link,
  Container,
  IconButton,
  useColorMode,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useToast,
  Icon,
  Stack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDarkMode, MdLightMode, MdCreate, MdFavorite } from 'react-icons/md';
import { ChakraIcon } from './ChakraIcon';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 3000,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error logging out',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCreateConfession = () => {
    if (!user) {
      toast({
        title: 'Please login first',
        description: 'You need to be logged in to create a confession',
        status: 'info',
        duration: 3000,
      });
      navigate('/login');
      return;
    }
    navigate('/create');
  };

  return (
    <Box 
      bg={bgColor} 
      borderBottom="1px" 
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap={8}>
            <Link 
              as={RouterLink} 
              to="/" 
              fontSize="xl" 
              fontWeight="bold"
              color="pink.500"
              _hover={{ textDecoration: 'none' }}
            >
              <ChakraIcon icon={MdFavorite} boxSize={6} color="pink.500" />
              <Box as="span" ml={2}>
                Love Confessions
              </Box>
            </Link>
            
            <Flex gap={4}>
              <Link 
                as={RouterLink} 
                to="/board"
                display="flex"
                alignItems="center"
                color={useColorModeValue('gray.600', 'gray.300')}
                _hover={{ color: 'pink.500', textDecoration: 'none' }}
              >
                <ChakraIcon icon={MdFavorite} boxSize={5} mr={2} />
                Confession Board
              </Link>
            </Flex>
          </Flex>

          <Flex alignItems="center" gap={4}>
            <IconButton
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
              icon={<ChakraIcon icon={colorMode === 'light' ? MdDarkMode : MdLightMode} boxSize={5} />}
              onClick={toggleColorMode}
              variant="ghost"
            />

            <Button
              leftIcon={<ChakraIcon icon={MdCreate} boxSize={5} />}
              colorScheme="pink"
              variant="solid"
              onClick={handleCreateConfession}
            >
              Create
            </Button>

            {user ? (
              <Menu>
                <MenuButton>
                  <Avatar size="sm" name={user.email || undefined} />
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Flex gap={2}>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  colorScheme="pink"
                >
                  Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/signup"
                  colorScheme="pink"
                >
                  Sign Up
                </Button>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
