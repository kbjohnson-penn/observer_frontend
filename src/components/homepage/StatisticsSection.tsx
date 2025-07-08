import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
} from '@chakra-ui/react';
import { STATISTICS } from '@/constants/homepage.constants';

const StatisticsSection: React.FC = () => (
  <Box mb={16} py={12} bg="blue.50" borderRadius="xl">
    <Container maxW="container.xl">
      <Heading size="2xl" 
        textAlign="center" 
        mb={6} 
        color="blue.700" 
        fontWeight="bold"
      >
        Research Impact
      </Heading>
      
      <Grid 
        templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} 
        gap={8}
        maxW="5xl"
        mx="auto"
      >
        {STATISTICS.map((stat, index) => (
          <Box key={index} textAlign="center">
            <Text 
              fontSize={{ base: "3xl", md: "4xl" }} 
              fontWeight="bold" 
              color={stat.color} 
              mb={2}
            >
              {stat.value}
            </Text>
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color="gray.600" 
              textTransform="uppercase" 
              letterSpacing="wider"
            >
              {stat.label}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {stat.description}
            </Text>
          </Box>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default StatisticsSection;