"use client";

import React from "react";
import { Box, Container, Heading, Text, Tabs } from "@chakra-ui/react";
import ResearchTab from "@/components/dashboard/ResearchTab";
import CohortTab from "@/components/dashboard/CohortTab";

export default function DashboardPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Heading size="lg" color="gray.900">Research Dashboard</Heading>
        <Text color="gray.600">Explore datasets and manage research cohorts</Text>
      </Box>

      <Tabs.Root defaultValue="research" variant="line">
        <Tabs.List>
          <Tabs.Trigger value="research">Research Data</Tabs.Trigger>
          <Tabs.Trigger value="cohorts">Cohorts</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="research" mt={6}>
          <ResearchTab />
        </Tabs.Content>

        <Tabs.Content value="cohorts" mt={6}>
          <CohortTab />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}