'use client';

import React from 'react';
import { VStack, Button, Card } from '@chakra-ui/react';
import { SettingsSection } from './SettingsLayout';

interface SidebarSection {
  id: SettingsSection;
  label: string;
  component: React.ComponentType;
}

interface SettingsSidebarProps {
  sections: SidebarSection[];
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

export default function SettingsSidebar({
  sections,
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <Card.Root bg="white" shadow="xs" border="1px" borderColor="gray.200">
      <Card.Body p={0}>
        <VStack gap={0} align="stretch">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              justifyContent="flex-start"
              py={3}
              px={4}
              borderRadius={0}
              fontWeight="normal"
              color={activeSection === section.id ? 'blue.600' : 'gray.700'}
              bg={activeSection === section.id ? 'blue.50' : 'transparent'}
              borderLeft={activeSection === section.id ? '3px solid' : '3px solid transparent'}
              borderLeftColor={activeSection === section.id ? 'blue.600' : 'transparent'}
              _hover={{
                bg: activeSection === section.id ? 'blue.50' : 'gray.50',
                color: activeSection === section.id ? 'blue.600' : 'gray.900',
              }}
              onClick={() => onSectionChange(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
