import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';

const PrivacyPolicy: React.FC = () => {
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" mb={4}>
          Privacy Policy
        </Heading>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            1. Information We Collect
          </Heading>
          <Text mb={2}>We collect the following types of information:</Text>
          <UnorderedList spacing={2} pl={4}>
            <ListItem>Confession content</ListItem>
            <ListItem>PIN numbers (stored securely)</ListItem>
            <ListItem>Usage data (views, access times)</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            2. How We Use Your Information
          </Heading>
          <Text mb={2}>Your information is used to:</Text>
          <UnorderedList spacing={2} pl={4}>
            <ListItem>Display your confessions to intended recipients</ListItem>
            <ListItem>Protect access to private confessions</ListItem>
            <ListItem>Improve our service</ListItem>
            <ListItem>Maintain security of the platform</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            3. Information Security
          </Heading>
          <Text mb={4}>
            We implement security measures to protect your information:
          </Text>
          <UnorderedList spacing={2} pl={4}>
            <ListItem>PIN-protected access to confessions</ListItem>
            <ListItem>Secure storage of confession data</ListItem>
            <ListItem>Regular security audits</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            4. Data Retention
          </Heading>
          <Text mb={4}>
            Confessions are stored until explicitly deleted by the user or when they violate our terms of service.
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            5. Your Rights
          </Heading>
          <Text mb={2}>You have the right to:</Text>
          <UnorderedList spacing={2} pl={4}>
            <ListItem>Access your confessions</ListItem>
            <ListItem>Delete your confessions</ListItem>
            <ListItem>Update PIN access</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            6. Contact Us
          </Heading>
          <Text mb={4}>
            If you have any questions about this Privacy Policy, please contact us through the provided support channels.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default PrivacyPolicy;
