import { Box, Heading, Text, Grid, VStack } from '@chakra-ui/react';
import { ACCESS_REQUIREMENTS } from '@/constants/dataset.constants';

const DatasetInformation = () => {
  return (
    <Box
      id="access-requirements"
      mb={16}
      py={12}
      bg="white"
      borderRadius="xl"
      border="1px"
      borderColor="gray.200"
    >
      <Heading size="2xl" mb={2} color="blue.700" textAlign="center" fontWeight="bold">
        Access Requirements
      </Heading>

      <Text fontSize="sm" color="gray.600" textAlign="center" mb={6} fontStyle="italic">
        {ACCESS_REQUIREMENTS.updateNote}
      </Text>

      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
        gap={8}
        maxW="6xl"
        mx="auto"
        px={8}
      >
        {ACCESS_REQUIREMENTS.sections.map((section, index) => (
          <Box key={index}>
            <Heading size="md" mb={3} color={section.color} fontWeight="bold">
              {section.title}
            </Heading>
            <VStack align="start" gap={2} fontSize="sm" color="gray.700">
              {section.items.map((item, itemIndex) => (
                <Text key={itemIndex}>{item}</Text>
              ))}
            </VStack>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default DatasetInformation;
