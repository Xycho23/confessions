import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@chakra-ui/react';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ConfessionBoard from './pages/ConfessionBoard';
import ViewConfession from './pages/ViewConfession';
import CreateConfession from './pages/CreateConfession';
import Profile from './pages/Profile';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';

export function AppRoutes() {
  return (
    <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/board" element={<ConfessionBoard />} />
        <Route path="/create" element={<CreateConfession />} />
        <Route path="/confession/:id" element={<ViewConfession />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </Container>
  );
}
