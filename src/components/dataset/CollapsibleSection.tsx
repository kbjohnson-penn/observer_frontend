'use client';

import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  IconButton,
  Collapsible
} from '@chakra-ui/react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import COLORS from '@/constants/colors';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  isOpen,
  onToggle,
  children
}) => {
  return (
    <Box 
      bg="white" 
      borderRadius="lg" 
      boxShadow="sm" 
      overflow="hidden"
    >
      <Flex
        p={4}
        bg={COLORS.ui.activeBg}
        align="center"
        justify="space-between"
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: COLORS.ui.hoverBg }}
        transition="background-color 0.2s"
      >
        <Box>
          <Heading size="md">{title}</Heading>
          {subtitle && (
            <Text fontSize="sm" color="gray.600" mt={1}>
              {subtitle}
            </Text>
          )}
        </Box>
        <IconButton
          aria-label={isOpen ? "Collapse" : "Expand"}
          size="sm"
          variant="ghost"
          colorScheme={COLORS.ui.buttonScheme}
        >
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </IconButton>
      </Flex>
      <Collapsible.Root open={isOpen}>
        <Collapsible.Content>
          {children}
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
};

export default CollapsibleSection;