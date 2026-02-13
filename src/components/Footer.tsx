'use client';

import React from 'react';
import { Box, Container, Flex, Text, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <Box as="footer" bg="blue.800" color="white" py={6} px={4} mt="auto" width="100%">
      <Container maxW="container.xl">
        <Flex
          justify="space-between"
          align="center"
          direction={{ base: 'column', md: 'row' }}
          gap={4}
        >
          <HStack gap={4} align="center">
            <Box>
              <Image
                src="/UniversityofPennsylvania_Shield_RGB.svg"
                width={40}
                height={45}
                alt="University of Pennsylvania Shield"
              />
            </Box>
            <Box>
              <Box mb={1}>
                <Text fontSize="sm" color="white">
                  Copyright © {new Date().getFullYear()} University of Pennsylvania.
                </Text>
                <Text fontSize="sm" color="white">
                  All rights reserved.
                </Text>
              </Box>
              <HStack gap={2} fontSize="xs" color="gray.300">
                <Link
                  href="https://www.med.upenn.edu/kbjohnsonlab/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Text _hover={{ color: 'white', textDecoration: 'underline' }}>AI-4-AI Lab</Text>
                </Link>
              </HStack>
            </Box>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
