import React from 'react';
import { Box, Heading, Text, HStack, Button } from '@chakra-ui/react';
import Link from 'next/link';
import { PAGE_CONTENT, BUTTON_STYLES } from '@/constants/homepage.constants';

const HeroSection: React.FC = () => (
  <Box textAlign="center" mb={12}>
    <Heading
      as="h1"
      fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
      color="blue.700"
      mb={6}
      fontWeight="bold"
      lineHeight="shorter"
    >
      {PAGE_CONTENT.title}
    </Heading>

    <Text
      fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
      color="blue.600"
      fontWeight="medium"
      mb={8}
    >
      {PAGE_CONTENT.subtitle}
    </Text>

    <Text fontSize="lg" color="gray.600" maxW="5xl" mx="auto" lineHeight="tall" mb={8}>
      {PAGE_CONTENT.description}
    </Text>

    <HStack justify="center" gap={4} flexWrap="wrap">
      {PAGE_CONTENT.ctaButtons.map((button, index) => (
        <Link key={index} href={button.href}>
          <Button {...BUTTON_STYLES}>{button.text}</Button>
        </Link>
      ))}
    </HStack>
  </Box>
);

export default HeroSection;
