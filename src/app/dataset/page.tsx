'use client';

import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';

// Import modular components
import DatasetHeader from '@/components/dataset/DatasetHeader';
import DatabaseStructure from '@/components/dataset/DatabaseStructure';
import DatasetInformation from '@/components/dataset/DatasetInformation';
import DeIdentificationProcess from '@/components/dataset/DeIdentificationProcess';
import TierComparisonTable from '@/components/dataset/TierComparisonTable';
import CitationUsage from '@/components/dataset/CitationUsage';
import CitationModal from '@/components/dataset/CitationModal';

const DatasetPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Scroll to hash anchor after page renders (needed for client-side navigation)
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      // Small delay to ensure DOM elements are rendered
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  return (
    <Box maxW="6xl" mx="auto" py={8} px={{ base: 4, md: 6 }}>
      <DatasetHeader />
      <DatabaseStructure />
      <DatasetInformation />
      <DeIdentificationProcess />
      <TierComparisonTable />
      <CitationUsage onOpenModal={() => setIsModalOpen(true)} />
      <CitationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Box>
  );
};

export default DatasetPage;
