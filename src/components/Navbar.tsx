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
  Stack,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDarkMode, MdLightMode, MdCreate, MdFavorite, MdPerson, MdLogout } from 'react-icons/md';
import { ChakraIcon } from './ChakraIcon';

export function Navbar() {
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
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      backdropFilter="blur(10px)"
      backgroundColor={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <HStack spacing={8}>
            <Link 
              as={RouterLink} 
              to="/" 
              fontSize="xl" 
              fontWeight="bold"
              color="brand.500"
              _hover={{ textDecoration: 'none', color: 'brand.600' }}
              display="flex"
              alignItems="center"
            >
              <ChakraIcon icon={MdFavorite} boxSize={6} />
              <Box as="span" ml={2}>
                Confessions
              </Box>
            </Link>
            
            <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
              <Link 
                as={RouterLink} 
                to="/board"
                py={2}
                px={4}
                rounded="lg"
                color={useColorModeValue('gray.600', 'gray.300')}
                _hover={{ 
                  bg: useColorModeValue('gray.100', 'gray.700'),
                  color: 'brand.500',
                  textDecoration: 'none'
                }}
              >
                Confession Board
              </Link>
            </HStack>
          </HStack>

          <HStack spacing={4}>
            <Button
              leftIcon={<ChakraIcon icon={MdCreate} />}
              colorScheme="brand"
              onClick={handleCreateConfession}
              size="sm"
            >
              Create
            </Button>

            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <ChakraIcon icon={MdDarkMode} /> : <ChakraIcon icon={MdLightMode} />}
              onClick={toggleColorMode}
              variant="ghost"
              colorScheme="brand"
              size="sm"
            />

            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded="full"
                  variant="link"
                  cursor="pointer"
                  minW={0}
                >
                  <Avatar size="sm" name={user.displayName || ''} src={user.photoURL || ''} />
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<ChakraIcon icon={MdPerson} />}>Profile</MenuItem>
                  <MenuItem icon={<ChakraIcon icon={MdLogout} />} onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Stack direction="row" spacing={2}>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  colorScheme="brand"
                  size="sm"
                >
                  Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/signup"
                  colorScheme="brand"
                  size="sm"
                >
                  Sign Up
                </Button>
              </Stack>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
