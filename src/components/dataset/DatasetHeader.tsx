import Link from 'next/link';
import { Box, Heading, Text, Button, HStack } from '@chakra-ui/react';

const DatasetHeader = () => {
  return (
    <Box textAlign="center" mb={12}>
      <Heading
        as="h1"
        fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
        color="blue.700"
        mb={6}
        fontWeight="bold"
        lineHeight="shorter"
      >
        Observer Repository Dataset
      </Heading>
      <Text fontSize="lg" color="gray.600" maxW="5xl" mx="auto" mb={8} lineHeight="tall">
        Comprehensive multimodal clinical encounter data for healthcare research. Real outpatient
        visits captured through video, audio, transcripts, EHR data, and surveys - all de-identified
        and structured for analysis.
      </Text>

      {/* Primary CTA */}
      <Box bg="blue.50" p={8} borderRadius="xl" border="1px" borderColor="blue.200">
        <Heading size="xl" mb={4} color="blue.800" fontWeight="bold">
          Explore the Dataset
        </Heading>
        <Text color="blue.700" mb={6} fontSize="xl" fontWeight="medium" lineHeight="tall">
          Interactive data browser with video players, transcript viewer, and table explorer
        </Text>
        <HStack justify="center" gap={4} flexWrap="wrap">
          <Link href="/dataset/explore">
            <Button
              size="lg"
              colorPalette="blue"
              bg="blue.500"
              _hover={{ bg: 'blue.600' }}
              transition="all 0.2s"
              color="white"
              minW="200px"
              padding={2}
            >
              Explore Sample Dataset
            </Button>
          </Link>
          <Link href="/documentation">
            <Button
              size="lg"
              colorPalette="blue"
              bg="blue.500"
              _hover={{ bg: 'blue.600' }}
              transition="all 0.2s"
              color="white"
              minW="200px"
              padding={2}
            >
              Dataset Documentation
            </Button>
          </Link>
        </HStack>
      </Box>
    </Box>
  );
};

export default DatasetHeader;
