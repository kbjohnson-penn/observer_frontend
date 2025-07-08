import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { RESEARCH_APPLICATIONS } from '@/constants/homepage.constants';

const ResearchApplicationsSection: React.FC = () => (
  <Box mb={16} bg="gray.50" py={12} borderRadius="lg">
    <Container maxW="container.xl">
      <Heading 
        size="2xl" 
        textAlign="center" 
        mb={6} 
        color="blue.700" 
        fontWeight="bold"
      >
        Research Applications
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
        Observer enables transformative research across multiple domains of healthcare innovation
      </Text>
      
      <Grid 
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
        gap={8} 
        maxW="6xl" 
        mx="auto"
      >
        {RESEARCH_APPLICATIONS.map((app, index) => (
          <Box 
            key={index} 
            bg="white" 
            p={6} 
            borderRadius="lg" 
            boxShadow="sm" 
            // _hover={{ boxShadow: "md", transform: "translateY(-2px)" }} 
            transition="all 0.3s" 
            border="1px" 
            borderColor="gray.200"
          >
            <VStack align="center" gap={4}>
              <Icon as={app.icon} color="blue.500" boxSize={12} />
              <Heading size="md" color="gray.700" textAlign="center">
                {app.label}
              </Heading>
              <Text fontSize="sm" color="gray.600" textAlign="center" lineHeight="tall">
                {app.description}
              </Text>
            </VStack>
          </Box>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default ResearchApplicationsSection;