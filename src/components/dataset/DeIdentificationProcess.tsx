import { Box, Heading, Text, VStack, Link } from '@chakra-ui/react';

const DeIdentificationProcess = () => {
  return (
    <Box
      id="de-identification"
      mb={16}
      py={12}
      bg="white"
      borderRadius="xl"
      border="1px"
      borderColor="gray.200"
    >
      <Heading size="2xl" mb={6} color="blue.700" textAlign="center" fontWeight="bold">
        De-identification Process
      </Heading>

      <Text color="gray.600" mb={8} fontSize="lg" textAlign="center" maxW="5xl" mx="auto">
        All data in the Observer dataset undergoes rigorous de-identification to ensure compliance
        with HIPAA regulations and protect patient privacy.
      </Text>

      <VStack align="stretch" gap={8} maxW="5xl" mx="auto" px={8}>
        {/* Clinical Encounter Data Section */}
        <Box>
          <Heading size="lg" mb={4} color="blue.700" fontWeight="bold">
            De-identification of clinical encounter data
          </Heading>
          <Text color="gray.700" fontSize="md" lineHeight="tall">
            We utilized{' '}
            <Link
              href="https://doi.org/10.1016/j.jbi.2025.104901"
              target="_blank"
              rel="noopener noreferrer"
              color="blue.600"
              fontWeight="semibold"
              _hover={{ textDecoration: 'underline' }}
            >
              MedVidDeID
            </Link>
            , a comprehensive de-identification pipeline specifically developed for multi-modal
            clinical data. This system removes all Protected Health Information (PHI) to ensure
            compliance with HIPAA regulations. The pipeline processes audio and video through
            multiple stages: extracting transcripts from audio, then de-identifying (removing names,
            dates, locations, etc., and replacing them with placeholders), and the audio is then
            de-identified by replacing PHI with tones and the transformation of voices to prevent
            speaker identification. Video de-identification is achieved through the blurring of the
            frame and the addition of keypoints over the figures. As a final step, the de-identified
            audio and video are re-synchronized to provide a fully de-identified version of the
            recorded clinical encounter. All data run through the pipeline undergo a rigorous manual
            review, where any missed PHI is flagged and then manually de-identified.
          </Text>
        </Box>

        {/* EHR Data Section */}
        <Box>
          <Heading size="lg" mb={4} color="blue.700" fontWeight="bold">
            EHR data de-identification
          </Heading>
          <Text color="gray.700" fontSize="md" lineHeight="tall">
            Any PHI in shared EHR data has been removed using established HIPAA safe harbor methods
            and tools, such as an optimized version of PHIlter developed at the University of
            Pennsylvania, to remove named entities.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default DeIdentificationProcess;
