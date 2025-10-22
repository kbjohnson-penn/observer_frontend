'use client';

import React from 'react';
import { HStack, Button, Text } from '@chakra-ui/react';

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
    <HStack justify="space-between" mt={4} align="center">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious || loading}
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
              bg={currentPage === page ? 'blue.500' : 'white'}
              color={currentPage === page ? 'white' : 'gray.700'}
              onClick={() => onPageChange(page)}
              disabled={loading}
              _hover={currentPage === page ? { bg: 'blue.600' } : { bg: 'gray.50' }}
            >
              {page}
            </Button>
          </React.Fragment>
        ))}
      </HStack>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext || loading}
      >
        Next
      </Button>
    </HStack>
  );
}
