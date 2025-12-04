'use client';

import React from 'react';
import { HStack, Button, Text } from '@chakra-ui/react';
import { COLORS } from '@/constants/colors';

interface PaginationControlsProps {
  currentPage: number;
  totalCount: number;
  pageSize?: number;
  hasNext: boolean;
  hasPrevious: boolean;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalCount,
  pageSize = 20,
  hasNext,
  hasPrevious,
  loading,
  onPageChange,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  // Don't show pagination if there's only one page
  if (totalCount <= pageSize) {
    return null;
  }

  // Generate page numbers to display (first, last, current +/- 2)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2
  );

  return (
    <HStack justify="center" mt={4} align="center">
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious || loading}
        colorPalette="gray"
        px={4}
        py={2}
        _hover={{ bg: 'gray.100' }}
      >
        Previous
      </Button>

      {/* Page Numbers */}
      <HStack gap={2}>
        {pageNumbers.map((page, index, array) => (
          <React.Fragment key={page}>
            {/* Show ellipsis if there's a gap */}
            {index > 0 && array[index - 1] !== page - 1 && <Text color="gray.400">...</Text>}

            {/* Page Button */}
            <Button
              size="sm"
              variant={currentPage === page ? 'solid' : 'outline'}
              colorPalette={currentPage === page ? 'blue' : 'gray'}
              bg={
                currentPage === page
                  ? COLORS.researchTab.pagination.activeBackground
                  : COLORS.researchTab.pagination.inactiveBackground
              }
              color={
                currentPage === page
                  ? COLORS.researchTab.pagination.activeText
                  : COLORS.researchTab.pagination.inactiveText
              }
              borderColor={
                currentPage === page ? undefined : COLORS.researchTab.pagination.buttonBorder
              }
              onClick={() => onPageChange(page)}
              disabled={loading}
              _hover={
                currentPage === page
                  ? { bg: COLORS.researchTab.pagination.hoverActiveBackground }
                  : { bg: COLORS.researchTab.pagination.hoverInactiveBackground }
              }
            >
              {page}
            </Button>
          </React.Fragment>
        ))}
      </HStack>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext || loading}
        colorPalette="gray"
        px={4}
        py={2}
        _hover={{ bg: 'gray.100' }}
      >
        Next
      </Button>
    </HStack>
  );
}
