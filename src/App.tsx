import React from 'react';
import { ChakraProvider, Box, Container, useColorModeValue } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ConfessionBoard from './pages/ConfessionBoard';
import ViewConfession from './pages/ViewConfession';
import CreateConfession from './pages/CreateConfession';

function App() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Box minH="100vh" bg={bgColor}>
            <Navbar />
            <Container maxW="container.xl" py={4}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/board" element={<ConfessionBoard />} />
                <Route path="/create" element={<CreateConfession />} />
                <Route path="/confession/:id" element={<ViewConfession />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
