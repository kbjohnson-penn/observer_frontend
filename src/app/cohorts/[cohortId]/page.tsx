'use client';

import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Badge, Spinner, Center } from '@chakra-ui/react';
import { HealthcareDataBrowser } from '@/components/healthcare-browser';
import ErrorBoundary from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { AxiosError } from 'axios';
import { CohortDataAPIResponse } from '@/interfaces/observer-omop';
import { useAuth } from '@/contexts/AuthContext';

interface CohortMetadata {
  name: string;
  description?: string;
  visit_count: number;
  created_at: string;
}

interface CohortViewPageProps {
  params: Promise<{
    cohortId: string;
  }>;
}

const CohortViewPage = ({ params }: CohortViewPageProps) => {
  const [cohortId, setCohortId] = React.useState<string>('');

  React.useEffect(() => {
    // Unwrap params Promise
    params.then((p) => setCohortId(p.cohortId));
  }, [params]);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cohort, setCohort] = useState<CohortMetadata | null>(null);
  const [cohortData, setCohortData] = useState<CohortDataAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!cohortId || authLoading || !isAuthenticated) {
      return; // Wait for cohortId and auth to be ready
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch cohort metadata
        const cohortResponse = await apiClient.get(`/accounts/cohorts/${cohortId}/`);

        if (!cohortResponse.data) {
          router.push('/404');
          return;
        }

        setCohort(cohortResponse.data);

        // Fetch cohort OMOP data
        const dataResponse = await apiClient.get(`/research/private/cohorts/${cohortId}/data/`);
        setCohortData(dataResponse.data);
      } catch (err: unknown) {
        logger.error('Error fetching cohort:', err);
        if (err instanceof AxiosError && err.response?.status === 404) {
          router.push('/404');
        } else {
          setError('Failed to load cohort data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cohortId, router, authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !cohort) {
    return (
      <Center h="50vh">
        <Text color="red.500">{error || 'Cohort not found'}</Text>
      </Center>
    );
  }

  // Format date
  const createdDate = new Date(cohort.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box maxW="6xl" mx="auto" py={8} px={{ base: 4, md: 6 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={12}>
        <Heading
          as="h1"
          fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
          color="blue.700"
          mb={4}
          fontWeight="bold"
          lineHeight="shorter"
        >
          {cohort.name}
        </Heading>

        {cohort.description && (
          <Text fontSize="lg" color="gray.600" maxW="4xl" mx="auto" mb={6} lineHeight="tall">
            {cohort.description}
          </Text>
        )}

        {/* Cohort Metadata */}
        <HStack justify="center" gap={6} flexWrap="wrap">
          <HStack>
            <Badge size="lg" colorPalette="blue" px={3} py={1}>
              {cohort.visit_count.toLocaleString()} visits
            </Badge>
          </HStack>

          <Text fontSize="md" color="gray.500">
            Created {createdDate}
          </Text>
        </HStack>
      </Box>

      {/* Healthcare Data Browser */}
      <VStack gap={8} align="stretch">
        <ErrorBoundary componentName="HealthcareDataBrowser">
          <HealthcareDataBrowser cohortData={cohortData} cohortId={Number(cohortId)} />
        </ErrorBoundary>
      </VStack>
    </Box>
  );
};

export default CohortViewPage;
