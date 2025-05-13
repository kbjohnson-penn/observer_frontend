"use client";

import React from "react";
import {
  Box,
  Container,
  Flex,
  Text,
  VStack,
  Image,
  Button,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const Home: React.FC = () => {
  const router = useRouter();

  const navigateToDashboard = () => {
    router.push("/dashboard-public");
  };

  return (
    <Box py={8} className="min-h-[calc(100vh-120px)]">
      <Container maxW="container.xl">
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          gap={8}
        >
          <VStack
            flex="1"
            bg="white"
            p={8}
            rounded="lg"
            shadow="md"
            gap={3}
            align="stretch"
          >
            <Text
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="bold"
              textAlign="center"
              color="blue.600"
              pb={4}
            >
              Welcome to the Observer Project
            </Text>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              textAlign="justify"
              color="gray.700"
              lineHeight="1.7"
            >
              The Observer Repository specializes in aggregating and curating
              comprehensive clinic visit data, including video, audio,
              transcript, EHR data, and audit log information, to provide an
              unparalleled view of patient-provider interactions. Adhering to
              the FAIR data management principles, our repository is designed
              for researchers seeking to explore telemedicine and in-person
              consultations.
            </Text>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              textAlign="justify"
              color="gray.700"
              lineHeight="1.7"
            >
              This state-of-the-art multimodal platform stores a variety of data
              formats, including video (MOV/MP4), audio (MP3), text transcripts,
              and EHR audit log files. This ensures detailed capture of clinic
              visit dynamics, providing a rich dataset for exploring the
              complexities of patient-provider interactions.
            </Text>

            <Button
              mt={4}
              size="lg"
              colorScheme="blue"
              onClick={navigateToDashboard}
            >
              Explore Public Dashboard
            </Button>
          </VStack>

          <Box
            flex="1"
            display={{ base: "none", lg: "block" }}
            position="relative"
            h="400px"
          >
            <Box
              position="absolute"
              bg="blue.50"
              borderRadius="full"
              w="400px"
              h="400px"
              opacity="0.7"
              right="20px"
              zIndex="0"
            />
            <Image
              src="/ObserverLogoLightBackground.svg"
              alt="Observer Project"
              width={450}
              height={450}
              style={{
                objectFit: "contain",
                position: "relative",
                zIndex: "1",
              }}
            />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Home;
