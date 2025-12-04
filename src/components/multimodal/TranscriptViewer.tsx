'use client';

import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Flex, Badge, Spinner, Input, Button } from '@chakra-ui/react';
import { FaSearch, FaDownload } from 'react-icons/fa';
import Papa from 'papaparse';
import { COLORS, SCROLLBAR_COLORS } from '@/constants/colors';

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

        // Fetch the CSV file
        const response = await fetch(transcriptSrc);
        if (!response.ok) {
          throw new Error('Failed to load transcript file');
        }

        const csvText = await response.text();

        // Parse CSV using PapaParse
        Papa.parse<Record<string, string>>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const entries: TranscriptEntry[] = results.data
              .map((row) => ({
                timestamp: row.Timestamp || row.timestamp || row.Time || row.time,
                speaker: row.Speaker || row.speaker || row.Role || row.role,
                transcript: row.Transcript || row.transcript || row.Text || row.text || '',
                affect: row.Affect || row.affect || row.Emotion || row.emotion,
                proficiency: row.Proficiency || row.proficiency || row.Skill || row.skill,
              }))
              .filter((entry) => entry.transcript.trim());

            setTranscript(entries);
            setLoading(false);
          },
          error: (parseError: Error) => {
            console.error('CSV Parse Error:', parseError);
            setError(
              `Failed to parse transcript CSV file: ${parseError.message || 'Unknown error'}`
            );
            setLoading(false);
          },
        });
      } catch {
        // Error loading transcript - will show error state to user
        setError('Failed to load transcript. Please check the file format.');
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
    // CSV header
    const header = 'Timestamp,Speaker,Transcript,Affect,Proficiency';

    // CSV rows - escape quotes and wrap fields
    const rows = filteredTranscript.map((entry) => {
      const escapeField = (field: string | undefined): string => {
        if (!field) {
          return '';
        }
        // Escape quotes by doubling them and wrap in quotes if contains comma/quote/newline
        const escaped = field.replace(/"/g, '""');
        return /[,"\n\r]/.test(field) ? `"${escaped}"` : escaped;
      };
      return [
        escapeField(entry.timestamp || 'N/A'),
        escapeField(entry.speaker || 'Unknown'),
        escapeField(entry.transcript),
        escapeField(entry.affect),
        escapeField(entry.proficiency),
      ].join(',');
    });

    const content = [header, ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
            colorPalette="blue"
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
              background: SCROLLBAR_COLORS.track,
              borderRadius: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: SCROLLBAR_COLORS.thumb,
              borderRadius: '6px',
              '&:hover': {
                background: SCROLLBAR_COLORS.thumbHover,
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
                  <Badge colorPalette={getSpeakerColor(entry.speaker)} variant="solid">
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
