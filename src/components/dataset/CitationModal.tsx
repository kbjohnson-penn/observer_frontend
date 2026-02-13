import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Dialog,
  Portal,
  CloseButton,
} from '@chakra-ui/react';
import { FaCopy, FaQuoteLeft, FaCheck } from 'react-icons/fa';
import { USAGE_ETHICS } from '@/constants/usage-ethics.constants';
import type { CitationModalProps } from '@/interfaces/dataset';

const CitationModal = ({ isOpen, onClose }: CitationModalProps) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    });
  };

  const citationFormats = {
    apa: USAGE_ETHICS.citation.apa,
    mla: USAGE_ETHICS.citation.mla,
    chicago: USAGE_ETHICS.citation.chicago,
    harvard: USAGE_ETHICS.citation.harvard,
    vancouver: USAGE_ETHICS.citation.vancouver,
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.500" />
        <Dialog.Positioner>
          <Dialog.Content maxW="4xl" bg="white" borderRadius="md" boxShadow="lg" p={6}>
            <Dialog.Header>
              <Dialog.Title>
                <HStack>
                  <Box color="blue.500">
                    <FaQuoteLeft />
                  </Box>
                  <Text fontWeight="bold" color="blue.500">
                    Citation Formats
                  </Text>
                </HStack>
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={2} align="stretch">
                {Object.entries(citationFormats).map(([format, citation]) => (
                  <Box key={format}>
                    <Heading size="md" mb={3} color="blue.600" textTransform="uppercase">
                      {format}
                    </Heading>
                    <Box bg="gray.50" p={2} borderRadius="md" position="relative">
                      <Text fontSize="sm" lineHeight="tall" fontFamily="serif" pr={10}>
                        {citation}
                      </Text>
                      <IconButton
                        aria-label={`Copy ${format.toUpperCase()} citation`}
                        size="sm"
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={() => copyToClipboard(citation, format.toUpperCase())}
                        bg={copiedFormat === format.toUpperCase() ? 'green.100' : 'transparent'}
                        color={copiedFormat === format.toUpperCase() ? 'green.600' : 'blue.500'}
                        _hover={{
                          bg: copiedFormat === format.toUpperCase() ? 'green.200' : 'blue.100',
                          color: copiedFormat === format.toUpperCase() ? 'green.700' : 'blue.600',
                        }}
                        variant="ghost"
                      >
                        {copiedFormat === format.toUpperCase() ? <FaCheck /> : <FaCopy />}
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </VStack>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CitationModal;
