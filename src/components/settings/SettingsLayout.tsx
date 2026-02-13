'use client';

import React, { useState } from 'react';
import { Box, Container, Flex, Text, Card } from '@chakra-ui/react';
import SettingsSidebar from './SettingsSidebar';
import ProfileSettings from './ProfileSettings';
import PasswordSettings from './PasswordSettings';
import UsernameSettings from './UsernameSettings';
import AgreementsSettings from './AgreementsSettings';

export type SettingsSection = 'profile' | 'password' | 'username' | 'agreements';

const SETTINGS_SECTIONS = [
  {
    id: 'profile' as const,
    label: 'Profile',
    title: 'Edit Profile',
    description: 'Update your personal information and contact details.',
    component: ProfileSettings,
  },
  {
    id: 'password' as const,
    label: 'Password',
    title: 'Change Password',
    description:
      "Update your account password. Make sure to use a strong password that you don't use elsewhere.",
    component: PasswordSettings,
  },
  {
    id: 'username' as const,
    label: 'Username',
    title: 'Change Username',
    description: 'Update your username. This will affect how others see you on the platform.',
    component: UsernameSettings,
  },
  {
    id: 'agreements' as const,
    label: 'Agreements',
    title: 'Agreements & Compliance',
    description: 'View and manage your signed agreements and compliance documents.',
    component: AgreementsSettings,
  },
];

export default function SettingsLayout() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const currentSection = SETTINGS_SECTIONS.find((section) => section.id === activeSection);
  const ActiveComponent = currentSection?.component || ProfileSettings;

  return (
    <Container maxW="7xl">
      <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
        {/* Sidebar */}
        <Box w={{ base: '100%', lg: '250px' }} flexShrink={0}>
          <SettingsSidebar
            sections={SETTINGS_SECTIONS}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </Box>

        {/* Main Content */}
        <Box flex={1}>
          <Card.Root bg="white" shadow="xs" borderColor="gray.200">
            <Card.Header>
              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900" mb={1}>
                  {currentSection?.title || currentSection?.label}
                </Text>
                <Text fontSize="md" color="gray.600">
                  {currentSection?.description}
                </Text>
              </Box>
            </Card.Header>
            <Card.Body>
              <ActiveComponent />
            </Card.Body>
          </Card.Root>
        </Box>
      </Flex>
    </Container>
  );
}
