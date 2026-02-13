import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Heading, Text, Button, HStack, IconButton } from '@chakra-ui/react';
import { FaQuoteLeft, FaCopy, FaCheck } from 'react-icons/fa';
import { USAGE_ETHICS } from '@/constants/usage-ethics.constants';
import type { CitationUsageProps } from '@/interfaces/dataset';

const CitationUsage = ({ onOpenModal }: CitationUsageProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(USAGE_ETHICS.citation.apa).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Box mb={12}>
      {/* Citation Card */}
      <Box bg="blue.50" p={8} borderRadius="xl" border="1px" borderColor="blue.200">
        <Heading size="xl" mb={6} color="blue.700" textAlign="center" fontWeight="bold">
          How to Cite
        </Heading>

        <HStack justify="space-between" align="start" mb={4}>
          <Box>
            <Text fontSize="sm" color="blue.600" fontWeight="medium">
              APA Format (default)
            </Text>
          </Box>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenModal}
            color="blue.600"
            _hover={{ bg: 'blue.100' }}
          >
            <Box as="span" color="blue.500" mr={2}>
              <FaQuoteLeft />
            </Box>
            Other Formats
          </Button>
        </HStack>

        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" mb={4} position="relative">
          <Text fontSize="md" color="gray.800" lineHeight="tall" pr={10}>
            {USAGE_ETHICS.citation.apa}
          </Text>
          <IconButton
            aria-label="Copy APA citation"
            size="sm"
            position="absolute"
            top={2}
            right={2}
            onClick={copyToClipboard}
            bg={copied ? 'green.100' : 'transparent'}
            color={copied ? 'green.600' : 'blue.500'}
            _hover={{
              bg: copied ? 'green.200' : 'blue.100',
              color: copied ? 'green.700' : 'blue.600',
            }}
            variant="ghost"
          >
            {copied ? <FaCheck /> : <FaCopy />}
          </IconButton>
        </Box>

        <Box textAlign="center">
          <Link href={USAGE_ETHICS.citation.url} target="_blank" rel="noopener noreferrer">
            <Text
              as="span"
              color="blue.600"
              fontSize="sm"
              fontWeight="medium"
              _hover={{ color: 'blue.800', textDecoration: 'underline' }}
            >
              {USAGE_ETHICS.citation.url}
            </Text>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default CitationUsage;
