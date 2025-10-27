'use client';

import React, { useState } from 'react';
import { Box, Container, Heading, Text, Tabs } from '@chakra-ui/react';
import ResearchTab from '@/components/dashboard/ResearchTab';
import CohortTab from '@/components/dashboard/CohortTab';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('research');

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Heading size="lg" color="gray.900">
          Research Dashboard
        </Heading>
        <Text color="gray.600">Explore datasets and manage research cohorts</Text>
      </Box>

      <Tabs.Root
        defaultValue="research"
        variant="line"
        value={activeTab}
        onValueChange={(e) => setActiveTab(e.value)}
      >
        <Tabs.List>
          <Tabs.Trigger value="research">Research Data</Tabs.Trigger>
          <Tabs.Trigger value="cohorts">Cohorts</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="research" mt={6}>
          <ResearchTab />
        </Tabs.Content>

        <Tabs.Content value="cohorts" mt={6}>
          {/* Remount CohortTab when switching to it to reload cohorts */}
          <CohortTab key={activeTab === 'cohorts' ? `cohorts-${Date.now()}` : 'cohorts-inactive'} />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}
