"use client";

import React, { Suspense } from "react";
import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import LoadingPage from "../components/Loading";

const Home: React.FC = () => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Box bg="gray.50" py={10}>
        <Container>
          <VStack
            bg="white"
            p={6}
            rounded="lg"
            shadow="sm"
            margin={4}
            align="stretch"
          >
            <Text textStyle="4xl" textAlign="center" color="red.600" pb={4}>
              Welcome to the Observer Project
            </Text>
            <Text
              fontSize="sm"
              textAlign="justify"
              px={[4, 8]}
              color="gray.700"
            >
              Welcome to The Observer Repository. We specialize in aggregating
              and curating comprehensive clinic visit data, including video,
              audio, transcript, EHR data, and audit log information, to provide
              an unparalleled view of the dynamics of patient-provider
              interactions. Adhering to the FAIR data management principles, our
              repository is designed for researchers seeking to delve into the
              depths of telemedicine and in-person consultations. Here, we
              invite collaboration, foster innovation, and aim to unlock new
              insights in medical research and pave the way for advancements in
              patient care and healthcare delivery.
            </Text>
            <Text
              fontSize="sm"
              textAlign="justify"
              px={[4, 8]}
              color="gray.700"
            >
              The Observer Repository is a state-of-the-art multimodal platform
              equipped to store a variety of data formats, including MOV and MP4
              for high-quality video, MP3 for audio, TXT for text transcripts,
              and EHR audit log files in formats like .log, .xml, .csv, or .txt.
              This range ensures a detailed capture of clinic visit dynamics,
              providing a rich, multidimensional dataset for exploring the
              complexities of patient-provider interactions, from verbal
              exchanges to non-verbal cues.
            </Text>
          </VStack>
        </Container>
      </Box>
    </Suspense>
  );
};

export default Home;
