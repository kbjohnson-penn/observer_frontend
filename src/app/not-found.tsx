'use client';

import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function NotFound() {
  return (
    <Box maxW="6xl" mx="auto" py={8} px={{ base: 4, md: 6 }}>
      <VStack gap={4} textAlign="center" py={20}>
        <Heading
          as="h1"
          fontSize={{ base: '6xl', md: '7xl' }}
          color="blue.700"
          fontWeight="bold"
          lineHeight="shorter"
        >
          404
        </Heading>

        <Text fontSize="lg" color="gray.600" maxW="md" mx="auto" lineHeight="tall">
          The page you are looking for does not exist or has been moved.
        </Text>

        <Link href="/" style={{ marginTop: '8px' }}>
          <Text
            as="span"
            display="inline-flex"
            alignItems="center"
            gap="8px"
            color="blue.600"
            fontWeight="medium"
            _hover={{ textDecoration: 'underline' }}
          >
            <FaArrowLeft size={14} />
            Back to Home
          </Text>
        </Link>
      </VStack>
    </Box>
  );
}
