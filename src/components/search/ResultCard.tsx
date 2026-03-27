'use client';

import { Box, Card, HStack, VStack, Text, Badge, Checkbox } from '@chakra-ui/react';
import { EncounterSearchHit } from '@/interfaces/search';
import { COLORS } from '@/constants/colors';
import {
  GENDER_LABELS,
  RACE_LABELS,
  ETHNICITY_LABELS,
  labelDemographic,
} from '@/constants/demographicLabels';
import DOMPurify from 'dompurify';
import { TierBadge } from './TierBadge';

interface ResultCardProps {
  hit: EncounterSearchHit;
  onSelect?: (hit: EncounterSearchHit) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (encounterId: string) => void;
}

function sanitizeHighlight(html: string): string {
  const stripped = html.replace(/<(?!\/?mark\b)[^>]+>/gi, '');
  return DOMPurify.sanitize(stripped, { ALLOWED_TAGS: ['mark'], ALLOWED_ATTR: [] });
}

export default function ResultCard({
  hit,
  onSelect,
  selectionMode,
  isSelected,
  onToggleSelect,
}: ResultCardProps) {
  const visitDate = hit.visit_date
    ? new Date(`${hit.visit_date}T00:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const uniqueIcds = [...new Set(hit.icd_codes)];
  const visibleIcds = uniqueIcds.slice(0, 3);
  const extraIcds = uniqueIcds.length - 3;

  const icdHighlight = hit.highlights?.['icd_codes.text']?.[0];
  const drugHighlight = hit.highlights?.['drug_names.text']?.[0];

  // Only show active multimodal capabilities
  const activeCapabilities: string[] = [];
  if (hit.has_transcript) {
    activeCapabilities.push('Transcript');
  }
  if (hit.has_audio) {
    activeCapabilities.push('Audio');
  }
  if (hit.has_provider_view) {
    activeCapabilities.push('Provider View');
  }
  if (hit.has_patient_view) {
    activeCapabilities.push('Patient View');
  }
  if (hit.has_room_view) {
    activeCapabilities.push('Room View');
  }

  const handleCardClick = () => {
    if (selectionMode) {
      onToggleSelect?.(hit.encounter_id);
    } else {
      onSelect?.(hit);
    }
  };

  return (
    <Card.Root
      bg={isSelected ? 'blue.50' : 'white'}
      border="1px"
      borderColor={isSelected ? 'blue.400' : 'gray.200'}
      borderRadius="lg"
      shadow="sm"
      cursor="pointer"
      onClick={handleCardClick}
      _hover={{
        borderColor: isSelected ? 'blue.500' : 'gray.400',
        shadow: 'md',
        transform: COLORS.animation.cardHoverLift,
      }}
      transition="all 0.2s"
    >
      <Card.Body p={4}>
        <HStack align="stretch" gap={3}>
          {selectionMode && (
            <Box display="flex" alignItems="center" pt={1}>
              <Checkbox.Root
                checked={isSelected}
                onCheckedChange={() => onToggleSelect?.(hit.encounter_id)}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                colorPalette="blue"
                size="md"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
              </Checkbox.Root>
            </Box>
          )}
          <VStack align="stretch" gap={3} flex={1}>
            {/* Header: demographics + tier + date */}
            <HStack justify="space-between" align="flex-start">
              <VStack align="flex-start" gap={1}>
                {/* Patient */}
                <HStack gap={1} flexWrap="wrap">
                  <Text fontSize="xs" color="gray.400">
                    Person:
                  </Text>
                  {hit.patient_gender && (
                    <Badge colorPalette={COLORS.patientBadges.gender} variant="subtle" size="sm">
                      {labelDemographic(GENDER_LABELS, hit.patient_gender)}
                    </Badge>
                  )}
                  {hit.patient_race && (
                    <Badge colorPalette={COLORS.patientBadges.race} variant="subtle" size="sm">
                      {labelDemographic(RACE_LABELS, hit.patient_race)}
                    </Badge>
                  )}
                  {hit.patient_ethnicity && (
                    <Badge colorPalette={COLORS.patientBadges.ethnicity} variant="subtle" size="sm">
                      {labelDemographic(ETHNICITY_LABELS, hit.patient_ethnicity)}
                    </Badge>
                  )}
                  {hit.patient_year_of_birth && (
                    <Text fontSize="xs" color="gray.500">
                      b.&nbsp;{hit.patient_year_of_birth}
                    </Text>
                  )}
                </HStack>
                {/* Provider */}
                {(hit.provider_gender || hit.provider_race) && (
                  <HStack gap={1} flexWrap="wrap">
                    <Text fontSize="xs" color="gray.400">
                      Provider:
                    </Text>
                    {hit.provider_gender && (
                      <Badge colorPalette={COLORS.providerBadges.gender} variant="subtle" size="sm">
                        {labelDemographic(GENDER_LABELS, hit.provider_gender)}
                      </Badge>
                    )}
                    {hit.provider_race && (
                      <Badge colorPalette={COLORS.providerBadges.race} variant="subtle" size="sm">
                        {labelDemographic(RACE_LABELS, hit.provider_race)}
                      </Badge>
                    )}
                    {hit.provider_year_of_birth && (
                      <Text fontSize="xs" color="gray.500">
                        b.&nbsp;{hit.provider_year_of_birth}
                      </Text>
                    )}
                  </HStack>
                )}
              </VStack>
              <VStack align="flex-end" gap={1} flexShrink={0}>
                <TierBadge tier={hit.tier_level} />
                {hit.encounter_id && (
                  <Text fontSize="xs" color="gray.400" fontFamily="mono">
                    #{hit.encounter_id}
                  </Text>
                )}
                {visitDate && (
                  <Text fontSize="xs" color="gray.500">
                    {visitDate}
                  </Text>
                )}
                {hit.department && (
                  <Badge colorPalette="orange" variant="subtle" size="sm">
                    {hit.department}
                  </Badge>
                )}
              </VStack>
            </HStack>

            {/* Active multimodal capabilities */}
            {activeCapabilities.length > 0 && (
              <HStack gap={1} flexWrap="wrap">
                {activeCapabilities.map((cap) => (
                  <Badge
                    key={cap}
                    colorPalette="gray"
                    variant="subtle"
                    size="xs"
                    borderRadius="full"
                  >
                    {cap}
                  </Badge>
                ))}
              </HStack>
            )}

            {/* Match source */}
            {hit.matched_in && hit.matched_in.length > 0 && (
              <HStack gap={1} flexWrap="wrap">
                <Text fontSize="xs" color="gray.400">
                  Matched in:
                </Text>
                {hit.matched_in.map((source) => (
                  <Badge
                    key={source}
                    colorPalette="blue"
                    variant="subtle"
                    size="xs"
                    borderRadius="full"
                  >
                    {source}
                  </Badge>
                ))}
              </HStack>
            )}

            {/* Clinical summary */}
            {(hit.drug_count > 0 || hit.note_count > 0 || uniqueIcds.length > 0) && (
              <HStack
                gap={2}
                flexWrap="wrap"
                align="center"
                borderTop="1px"
                borderColor="gray.100"
                pt={1.5}
              >
                {hit.drug_count > 0 &&
                  (drugHighlight ? (
                    <Badge colorPalette="gray" size="sm">
                      <span
                        dangerouslySetInnerHTML={{ __html: sanitizeHighlight(drugHighlight) }}
                      />
                    </Badge>
                  ) : (
                    <Badge colorPalette="gray" size="sm">
                      {hit.drug_count} drug{hit.drug_count !== 1 ? 's' : ''}
                    </Badge>
                  ))}
                {hit.note_count > 0 && (
                  <Badge colorPalette="gray" size="sm">
                    {hit.note_count} note{hit.note_count !== 1 ? 's' : ''}
                  </Badge>
                )}
                {icdHighlight ? (
                  <Box bg="gray.100" px={1.5} py={0.5} borderRadius="sm">
                    <Text fontSize="xs" fontFamily="mono" color="gray.600">
                      <span dangerouslySetInnerHTML={{ __html: sanitizeHighlight(icdHighlight) }} />
                    </Text>
                  </Box>
                ) : (
                  visibleIcds.map((code) => (
                    <Box key={code} bg="gray.100" px={1.5} py={0.5} borderRadius="sm">
                      <Text fontSize="xs" fontFamily="mono" color="gray.600">
                        {code}
                      </Text>
                    </Box>
                  ))
                )}
                {extraIcds > 0 && (
                  <Text fontSize="xs" color="gray.400">
                    +{extraIcds} more
                  </Text>
                )}
              </HStack>
            )}
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
