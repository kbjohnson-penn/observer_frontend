import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  HStack,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { DATA_TYPES } from '@/constants/homepage.constants';

const DataTypesSection: React.FC = () => (
  <Box mb={16} bg="white" py={12} borderRadius="lg" border="1px" borderColor="gray.200">
    <Container maxW="container.xl">
      <Heading 
        size="2xl" 
        textAlign="center" 
        mb={6} 
        color="blue.700" 
        fontWeight="bold"
      >
        Data Types Available
      </Heading>
      
      <Text 
        textAlign="center" 
        color="blue.600" 
        mb={12} 
        maxW="4xl" 
        mx="auto" 
        fontSize="xl" 
        fontWeight="medium" 
        lineHeight="tall"
      >
        Comprehensive multimodal data from real clinical encounters
      </Text>
      
      <Grid 
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} 
        gap={8} 
        maxW="5xl" 
        mx="auto"
      >
        {DATA_TYPES.map((type, index) => (
          <Box 
            key={index} 
            bg="gray.50" 
            p={6} 
            borderRadius="lg" 
            _hover={{ bg: "gray.100" }} 
            transition="all 0.3s"
          >
            <HStack gap={4} align="start">
              <Icon as={type.icon} color="blue.500" boxSize={8} mt={1} />
              <VStack align="start" gap={2}>
                <Heading size="md" color="gray.700">
                  {type.label}
                </Heading>
                <Text fontSize="sm" color="gray.600" lineHeight="tall">
                  {type.description}
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default DataTypesSection;