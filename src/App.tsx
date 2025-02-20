import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AppRoutes } from './routes';
import { GlobalChat } from './components/GlobalChat';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Box minH="100vh" bg="gray.50">
            <Navbar />
            <Box pt={{ base: 20, md: 24 }} pb={8}>
              <AppRoutes />
            </Box>
            <GlobalChat />
          </Box>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
