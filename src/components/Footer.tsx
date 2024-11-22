"use client";

import React from "react";
import {
  Box,
  Container,
  Grid,
  GridItem,
  Text,
  Link,
  VStack,
  Icon,
  Group,
  Stack,
} from "@chakra-ui/react";
import { LuPhone, LuMail } from "react-icons/lu";

const Footer = () => (
  <Box
    as="footer"
    bg="brand.penn-dark-blue"
    color="white"
    p={{ base: 4, md: 6, lg: 8 }}
    mt="auto"
  >
    <Container>
      <Grid
        h="200px"
        templateRows="repeat(2, 1fr)"
        templateColumns="repeat(4, 1fr)"
        gap="6"
        mb={2}
      >
        <GridItem rowSpan={2} colSpan={1}>
          <VStack display="grid" alignItems="left">
            <Text textStyle="lg" fontWeight="black">
              Contact Us
            </Text>
            <Text textStyle="md" fontWeight="medium">
              The OBSERVER Project
            </Text>
            <Stack mt={1}>
              <Text textStyle="sm" fontWeight="light" lineHeight="0.8">
                B202 Richards Medical Research Laboratories
              </Text>
              <Text textStyle="sm" fontWeight="light" lineHeight="0.8">
                3700 Hamilton Walk
              </Text>
              <Text textStyle="sm" fontWeight="light" lineHeight="0.8">
                University of Pennsylvania
              </Text>
              <Text textStyle="sm" fontWeight="light" lineHeight="0.8">
                Philadelphia, PA 19104-6116
              </Text>
            </Stack>
            <Stack mt={1}>
              <Group>
                <Icon fontSize="lg">
                  <LuPhone />
                </Icon>
                <Link
                  href="tel:215-573-5707"
                  textStyle="sm"
                  fontWeight="light"
                  color="yellow.400"
                  lineHeight="1"
                >
                  215-573-5707
                </Link>
              </Group>
              <Group>
                <Icon fontSize="lg">
                  <LuMail />
                </Icon>
                <Link
                  href="mailto:observerproject@pennmedicine.upenn.edu"
                  textStyle="sm"
                  fontWeight="light"
                  color="yellow.400"
                  lineHeight="1"
                >
                  Email Us
                </Link>
              </Group>
            </Stack>
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  </Box>
);

export default Footer;
