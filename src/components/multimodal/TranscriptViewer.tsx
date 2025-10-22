'use client';

import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Flex, Badge, Spinner, Input, Button } from '@chakra-ui/react';
import { FaSearch, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { COLORS } from '@/constants/colors';

interface TranscriptEntry {
  timestamp?: string;
  speaker?: string;
  transcript: string;
  affect?: string;
  proficiency?: string;
}

interface TranscriptViewerProps {
  transcriptSrc?: string;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ transcriptSrc }) => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!transcriptSrc) {
      setLoading(false);
      setError('No transcript file specified');
      return;
    }

    const loadTranscript = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the Excel file
        const response = await fetch(transcriptSrc);
        if (!response.ok) {
          throw new Error('Failed to load transcript file');
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Find header row (looking for common column names)
        let headerRowIndex = -1;
        const possibleHeaders = ['timestamp', 'speaker', 'transcript', 'affect', 'proficiency'];

        for (let i = 0; i < Math.min(data.length, 5); i++) {
          const row = data[i];
          if (
            row &&
            row.some(
              (cell) =>
                typeof cell === 'string' &&
                possibleHeaders.some((header) => cell.toLowerCase().includes(header))
            )
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          // If no header found, assume first row is header
          headerRowIndex = 0;
        }

        const headers = data[headerRowIndex].map((h) => h?.toString().toLowerCase() || '');

        // Map column indices
        const colMap = {
          timestamp: headers.findIndex((h) => h.includes('timestamp') || h.includes('time')),
          speaker: headers.findIndex((h) => h.includes('speaker') || h.includes('role')),
          transcript: headers.findIndex((h) => h.includes('transcript') || h.includes('text')),
          affect: headers.findIndex((h) => h.includes('affect') || h.includes('emotion')),
          proficiency: headers.findIndex((h) => h.includes('proficiency') || h.includes('skill')),
        };

        // Parse data rows
        const entries: TranscriptEntry[] = [];
        for (let i = headerRowIndex + 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) {
            continue;
          }

          const entry: TranscriptEntry = {
            timestamp: colMap.timestamp >= 0 ? row[colMap.timestamp]?.toString() : undefined,
            speaker: colMap.speaker >= 0 ? row[colMap.speaker]?.toString() : undefined,
            transcript:
              colMap.transcript >= 0
                ? row[colMap.transcript]?.toString() || ''
                : row[0]?.toString() || '',
            affect: colMap.affect >= 0 ? row[colMap.affect]?.toString() : undefined,
            proficiency: colMap.proficiency >= 0 ? row[colMap.proficiency]?.toString() : undefined,
          };

          // Only add entries with actual transcript content
          if (entry.transcript.trim()) {
            entries.push(entry);
          }
        }

        setTranscript(entries);
      } catch {
        // Error loading transcript - will show error state to user
        setError('Failed to load transcript. Please check the file format.');
      } finally {
        setLoading(false);
      }
    };

    loadTranscript();
  }, [transcriptSrc]);

  const filteredTranscript = transcript.filter(
    (entry) =>
      searchTerm === '' ||
      entry.transcript.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.speaker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.affect?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.proficiency?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightText = (text: string) => {
    if (!searchTerm) {
      return text;
    }

    // Escape special regex characters to prevent injection
    const escapedSearchTerm = escapeRegExp(searchTerm);
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getSpeakerColor = (speaker?: string) => {
    const speakerLower = speaker?.toLowerCase() || '';
    if (
      speakerLower.includes('doctor') ||
      speakerLower.includes('provider') ||
      speakerLower.includes('clinician')
    ) {
      return COLORS.semantic.doctor;
    } else if (speakerLower.includes('patient') || speakerLower.includes('subject')) {
      return COLORS.semantic.patient;
    } else if (speakerLower.includes('nurse')) {
      return COLORS.semantic.nurse;
    }
    return COLORS.semantic.unknown;
  };

  const exportTranscript = () => {
    const content = filteredTranscript
      .map(
        (entry) =>
          `[${entry.timestamp || 'N/A'}] ${entry.speaker || 'Unknown'}: ${entry.transcript}`
      )
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box bg="white" borderRadius="md" border="1px" borderColor="gray.200" p={6}>
        <Flex direction="column" align="center" justify="center" py={8}>
          <Spinner size="lg" mb={4} />
          <Text>Loading transcript...</Text>
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="white" borderRadius="md" border="1px" borderColor="gray.200" p={6}>
        <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={4}>
          <Text color="red.600">{error}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden">
      {/* Header Section */}
      <Box p={6} pb={4} borderBottom="1px" borderColor="gray.200" bg="blue.50">
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading size="lg" color="blue.900" mb={2} fontWeight="bold">
              Conversation Transcript
            </Heading>
            <Text color="gray.700" fontSize="md">
              Interactive transcript with search and highlighting
            </Text>
          </Box>
          <Button
            size="md"
            colorScheme="blue"
            variant="outline"
            onClick={exportTranscript}
            disabled={transcript.length === 0}
            _hover={{ bg: 'gray.50', borderColor: 'blue.400' }}
          >
            <FaDownload style={{ marginRight: '8px', color: '#2563eb' }} />
            Export
          </Button>
        </Flex>
      </Box>

      {/* Content Section */}
      <Box p={6} pt={4}>
        {/* Search Section */}
        <Flex align="center" justify="space-between" wrap="wrap" gap={4} mb={6}>
          <Box position="relative" w={{ base: '100%', md: '350px' }}>
            <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" zIndex={1}>
              <FaSearch color="#3b82f6" size="14px" />
            </Box>
            <Input
              placeholder="Search transcript content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
              bg="white"
              borderColor="gray.300"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              paddingLeft="10"
            />
          </Box>

          <Text fontSize="sm" color="gray.600">
            <Text as="span" fontWeight="bold">
              {filteredTranscript.length}
            </Text>{' '}
            of{' '}
            <Text as="span" fontWeight="bold">
              {transcript.length}
            </Text>{' '}
            entries
            {searchTerm && (
              <Text as="span" ml={2} fontStyle="italic">
                matching &ldquo;{searchTerm}&rdquo;
              </Text>
            )}
          </Text>
        </Flex>
        <Box
          maxH="400px"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '12px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f5f9',
              borderRadius: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#2563eb',
              borderRadius: '6px',
              '&:hover': {
                background: '#1d4ed8',
              },
            },
          }}
        >
          {filteredTranscript.length === 0 && transcript.length > 0 ? (
            <Box textAlign="center" py={4}>
              <Text color="gray.500">No results found for &quot;{searchTerm}&quot;</Text>
            </Box>
          ) : filteredTranscript.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Text color="gray.500">No transcript data available</Text>
            </Box>
          ) : (
            filteredTranscript.map((entry, index) => (
              <Box
                key={index}
                p={4}
                bg={`${getSpeakerColor(entry.speaker)}.50`}
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor={`${getSpeakerColor(entry.speaker)}.500`}
                mb={4}
                transition="all 0.2s"
                _hover={{
                  bg: `${getSpeakerColor(entry.speaker)}.100`,
                  transform: 'translateX(2px)',
                }}
              >
                <Flex justify="space-between" mb={3}>
                  <Badge colorScheme={getSpeakerColor(entry.speaker)} variant="solid">
                    {entry.speaker || 'Unknown'}
                  </Badge>
                  {entry.timestamp && (
                    <Text fontSize="sm" color="gray.500" fontFamily="mono" fontWeight="bold">
                      {entry.timestamp}
                    </Text>
                  )}
                </Flex>

                <Text fontSize="sm" lineHeight="tall" mb={3}>
                  {searchTerm ? highlightText(entry.transcript) : entry.transcript}
                </Text>

                {(entry.affect || entry.proficiency) && (
                  <Box mt={3} pt={3} borderTop="1px" borderColor="gray.200">
                    {entry.affect && (
                      <Box mb={2}>
                        <Text fontSize="xs" color="gray.600" fontWeight="bold" mb={1}>
                          Affect:
                        </Text>
                        <Text fontSize="xs" color="gray.700">
                          {entry.affect}
                        </Text>
                      </Box>
                    )}
                    {entry.proficiency && (
                      <Box>
                        <Text fontSize="xs" color="gray.600" fontWeight="bold" mb={1}>
                          Proficiency:
                        </Text>
                        <Text fontSize="xs" color="gray.700">
                          {entry.proficiency}
                        </Text>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TranscriptViewer;
