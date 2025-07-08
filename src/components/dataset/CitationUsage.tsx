import React from 'react';
import Link from 'next/link';
import { 
  Box, 
  Heading, 
  Text, 
  Button,
  HStack
} from '@chakra-ui/react';
import { FaQuoteLeft } from 'react-icons/fa';
import { USAGE_ETHICS } from '@/constants/usage-ethics.constants';
import type { CitationUsageProps } from '@/interfaces/dataset.d';

const CitationUsage = ({ onOpenModal }: CitationUsageProps) => {
  return (
    <Box mb={12}>
      {/* Citation Card */}
      <Box bg="blue.50" p={8} borderRadius="xl" border="1px" borderColor="blue.200">
        <Heading 
          size="xl" 
          mb={6} 
          color="blue.700"
          textAlign="center"
          fontWeight="bold"
        >
          How to Cite
        </Heading>
        
        <HStack justify="space-between" align="start" mb={4}>
          <Box>
            <Text fontSize="sm" color="blue.600" fontWeight="medium">APA Format (default)</Text>
          </Box>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenModal}
            color="blue.600"
            _hover={{ bg: "blue.100" }}
          >
            <Box as="span" color="blue.500" mr={2}>
              <FaQuoteLeft />
            </Box>
            Other Formats
          </Button>
        </HStack>
        
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" mb={4}>
          <Text fontSize="md" color="gray.800" lineHeight="tall">
            {USAGE_ETHICS.citation.apa}
          </Text>
        </Box>
        
        <Box textAlign="center">
          <Link href={USAGE_ETHICS.citation.url} target="_blank" rel="noopener noreferrer">
            <Text as="span" color="blue.600" fontSize="sm" fontWeight="medium" _hover={{ color: "blue.800", textDecoration: "underline" }}>
              {USAGE_ETHICS.citation.url}
            </Text>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default CitationUsage;