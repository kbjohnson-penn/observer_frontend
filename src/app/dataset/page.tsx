'use client';

import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';

// Import modular components
import DatasetHeader from '@/components/dataset/DatasetHeader';
import DatabaseStructure from '@/components/dataset/DatabaseStructure';
import DatasetInformation from '@/components/dataset/DatasetInformation';
import CitationUsage from '@/components/dataset/CitationUsage';
import CitationModal from '@/components/dataset/CitationModal';

const DatasetPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Box maxW="6xl" mx="auto" py={8} px={{ base: 4, md: 6 }}>
      <DatasetHeader />
      <DatabaseStructure />
      <DatasetInformation />
      <CitationUsage onOpenModal={() => setIsModalOpen(true)} />
      <CitationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Box>
  );
};

export default DatasetPage;
