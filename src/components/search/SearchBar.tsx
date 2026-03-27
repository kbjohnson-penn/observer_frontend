'use client';

import React from 'react';
import { Box, Input, IconButton, HStack, Text, Badge } from '@chakra-ui/react';
import { HiSearch, HiX } from 'react-icons/hi';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalCount?: number;
  hasSearched?: boolean;
  activeFilterCount?: number;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search by ICD code, drug name, procedure, diagnosis…',
  totalCount,
  hasSearched,
  activeFilterCount,
}: SearchBarProps) {
  return (
    <Box>
      <HStack gap={3} w="100%">
        <Box position="relative" flex={1}>
          <Box
            position="absolute"
            left={3}
            top="50%"
            transform="translateY(-50%)"
            color="gray.400"
            pointerEvents="none"
            zIndex={1}
          >
            <HiSearch size={20} />
          </Box>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            pl={10}
            pr={value ? 10 : 4}
            size="lg"
            borderColor="gray.300"
            bg="gray.50"
            _hover={{ borderColor: 'gray.400', bg: 'white' }}
            _focus={{
              borderColor: 'blue.500',
              bg: 'white',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
            transition="all 0.15s"
          />
          {value && (
            <IconButton
              aria-label="Clear search"
              position="absolute"
              right={2}
              top="50%"
              transform="translateY(-50%)"
              size="sm"
              variant="ghost"
              colorPalette="gray"
              onClick={() => onChange('')}
              zIndex={1}
            >
              <HiX />
            </IconButton>
          )}
        </Box>
        {hasSearched && totalCount !== undefined && (
          <Badge
            colorPalette="blue"
            variant="subtle"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
            whiteSpace="nowrap"
          >
            <Text fontWeight="semibold">{totalCount.toLocaleString()} results</Text>
          </Badge>
        )}
      </HStack>
      {hasSearched && activeFilterCount !== undefined && activeFilterCount > 0 && (
        <HStack mt={2} gap={1.5}>
          <Text fontSize="xs" color="gray.500">
            Active filters:
          </Text>
          <Badge colorPalette="blue" size="sm" borderRadius="full">
            {activeFilterCount}
          </Badge>
        </HStack>
      )}
    </Box>
  );
}
