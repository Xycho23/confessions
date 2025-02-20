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

const TermsAndConditions: React.FC = () => {
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" mb={4}>
          Terms and Conditions
        </Heading>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            1. Acceptance of Terms
          </Heading>
          <Text mb={4}>
            By accessing and using Confessions, you agree to be bound by these Terms and Conditions.
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            2. User Responsibilities
          </Heading>
          <UnorderedList spacing={2} pl={4}>
            <ListItem>You must be at least 13 years old to use this service.</ListItem>
            <ListItem>You are responsible for maintaining the confidentiality of your confessions and PINs.</ListItem>
            <ListItem>You agree not to post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            3. Content Guidelines
          </Heading>
          <Text mb={4}>
            Users are prohibited from posting:
          </Text>
          <UnorderedList spacing={2} pl={4}>
            <ListItem>Illegal content</ListItem>
            <ListItem>Hate speech or discriminatory content</ListItem>
            <ListItem>Personal information of others without consent</ListItem>
            <ListItem>Spam or commercial solicitation</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            4. Privacy
          </Heading>
          <Text mb={4}>
            Your use of Confessions is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            5. Modifications
          </Heading>
          <Text mb={4}>
            We reserve the right to modify these terms at any time. Continued use of the service after any modifications indicates your acceptance of the new terms.
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={3}>
            6. Termination
          </Heading>
          <Text mb={4}>
            We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any reason whatsoever.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default TermsAndConditions;
