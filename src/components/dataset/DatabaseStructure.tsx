import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Grid,
  VStack
} from '@chakra-ui/react';
import { DATABASE_STRUCTURE } from '@/constants/dataset.constants';

const dataStructure = DATABASE_STRUCTURE;

const DatabaseStructure = () => {
  return (
    <Box mb={16} py={12} bg="gray.50" borderRadius="xl">
      <Heading 
        size="2xl" 
        mb={6} 
        color="blue.700"
        textAlign="center"
        fontWeight="bold"
      >
        Dataset Structure & Data Types
      </Heading>
      <Text 
        color="blue.600" 
        mb={8} 
        fontSize="xl"
        fontWeight="medium"
        lineHeight="tall"
        textAlign="center"
        maxW="5xl"
        mx="auto"
      >
        {dataStructure.overview}
      </Text>
      
      <Grid 
        templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} 
        gap={8}
        maxW="7xl"
        mx="auto"
      >
        {dataStructure.categories.map((category, index) => (
          <Box 
            key={index} 
            bg="white" 
            p={6} 
            borderRadius="lg" 
            boxShadow="sm" 
            border="1px" 
            borderColor="gray.200"
            transition="all 0.3s"
          >
            {/* Header - no icon */}
            <Box mb={4}>
              <Heading size="lg" color="blue.600" fontWeight="bold" mb={2}>
                {category.name}
              </Heading>
              <Text color="gray.600" fontSize="md" lineHeight="tall">
                {category.description}
              </Text>
            </Box>

            {/* Data type details */}
            <Box mb={4} p={3} bg="blue.50" borderRadius="md">
              <Text fontSize="xs" fontWeight="bold" color="blue.700" mb={2} textTransform="uppercase">
                Data Characteristics
              </Text>
              <VStack align="start" gap={1}>
                {category.details.map((detail, detailIndex) => (
                  <Text key={detailIndex} fontSize="sm" color="gray.700">
                    {detail}
                  </Text>
                ))}
              </VStack>
            </Box>

            {/* Database tables - simplified without icons */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={3} textTransform="uppercase">
                Database Tables ({category.tables.length})
              </Text>
              <VStack align="stretch" gap={1}>
                {category.tables.map((table, tableIndex) => (
                  <Box key={tableIndex} p={2} bg="gray.50" borderRadius="md">
                    <Text fontWeight="bold" fontSize="xs" color="gray.800">
                      {table.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {table.description}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default DatabaseStructure;