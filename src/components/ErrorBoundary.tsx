'use client';

import React, { ErrorInfo } from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Box, Heading, Text, Button, Flex } from '@chakra-ui/react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// Default error fallback component
const DefaultErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      border="1px"
      borderColor="red.200"
      p={8}
      textAlign="center"
      maxW="md"
      mx="auto"
      mt={8}
    >
      <Flex direction="column" align="center" gap={4}>
        <Box color="red.500" fontSize="3xl">
          <FaExclamationTriangle />
        </Box>

        <Box>
          <Heading size="md" color="red.600" mb={2}>
            Something went wrong
          </Heading>
          <Text color="gray.600" fontSize="sm" mb={4}>
            An unexpected error occurred while loading this component.
          </Text>

          {process.env.NODE_ENV === 'development' && error && (
            <Box
              bg="red.50"
              border="1px"
              borderColor="red.200"
              borderRadius="md"
              p={3}
              mb={4}
              textAlign="left"
            >
              <Text fontSize="xs" fontFamily="mono" color="red.700">
                {error.message}
              </Text>
            </Box>
          )}
        </Box>

        <Button size="sm" colorScheme="blue" variant="outline" onClick={resetErrorBoundary}>
          <FaRedo style={{ marginRight: '8px' }} />
          Try Again
        </Button>
      </Flex>
    </Box>
  );
};

// Modern functional error boundary wrapper
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback: FallbackComponent = DefaultErrorFallback,
  onError,
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Error caught by boundary - could send to error reporting service

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={handleError}
      onReset={() => {
        // Optional: Add any cleanup logic here
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
