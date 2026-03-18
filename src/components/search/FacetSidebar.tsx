'use client';

import React from 'react';
import {
  Box,
  VStack,
  Text,
  Input,
  Checkbox,
  Collapsible,
  HStack,
  Badge,
  Card,
} from '@chakra-ui/react';
import {
  FaCalendar,
  FaUsers,
  FaUserMd,
  FaVideo,
  FaFileMedical,
  FaChevronDown,
  FaHospital,
} from 'react-icons/fa';
import { EncounterSearchFilters, SearchAggregations } from '@/interfaces/search';
import {
  GENDER_LABELS,
  RACE_LABELS,
  ETHNICITY_LABELS,
  labelDemographic,
} from '@/constants/demographicLabels';

interface FacetSidebarProps {
  filters: EncounterSearchFilters;
  aggregations: SearchAggregations | null;
  onChange: (filters: EncounterSearchFilters) => void;
}

function SectionHeader({
  icon,
  title,
  activeCount,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  activeCount: number;
  iconColor: string;
}) {
  return (
    <HStack justify="space-between" w="100%">
      <HStack gap={2}>
        <Box color={iconColor}>{icon}</Box>
        <Text fontWeight="semibold" fontSize="sm" color="gray.700">
          {title}
        </Text>
      </HStack>
      <HStack gap={1}>
        {activeCount > 0 && (
          <Badge colorPalette="blue" size="sm" borderRadius="full">
            {activeCount}
          </Badge>
        )}
        <Box color="gray.400">
          <FaChevronDown size={10} />
        </Box>
      </HStack>
    </HStack>
  );
}

function AggCheckboxList({
  buckets,
  selected,
  onToggle,
  labelMap,
}: {
  buckets: { key: string; count: number }[];
  selected: string[] | undefined;
  onToggle: (value: string) => void;
  labelMap?: Record<string, string>;
}) {
  const validBuckets = buckets.filter((b) => b.key !== '');
  if (!validBuckets.length) {
    return null;
  }
  return (
    <VStack align="stretch" gap={1}>
      {validBuckets.map((b) => (
        <Checkbox.Root
          key={b.key}
          checked={selected?.includes(b.key) ?? false}
          onCheckedChange={() => onToggle(b.key)}
          size="sm"
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>
            <HStack gap={1}>
              <Text fontSize="sm">
                {labelMap ? (labelDemographic(labelMap, b.key) ?? b.key) : b.key}
              </Text>
              <Badge size="sm" colorPalette="gray" variant="subtle">
                {b.count}
              </Badge>
            </HStack>
          </Checkbox.Label>
        </Checkbox.Root>
      ))}
    </VStack>
  );
}

function CollapsibleSection({
  children,
  activeBg,
  activeHoverBg,
  activeBorderColor,
  isActive,
  header,
}: {
  children: React.ReactNode;
  activeBg: string;
  activeHoverBg: string;
  activeBorderColor: string;
  isActive: boolean;
  header: React.ReactNode;
}) {
  return (
    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger
        w="100%"
        textAlign="left"
        px={4}
        py={3}
        bg={isActive ? activeBg : 'gray.50'}
        borderLeft="3px solid"
        borderLeftColor={isActive ? activeBorderColor : 'transparent'}
        _hover={{ bg: isActive ? activeHoverBg : 'gray.100' }}
        transition="all 0.15s"
      >
        {header}
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Box borderBottom="1px" borderColor="gray.100">
          {children}
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export default function FacetSidebar({ filters, aggregations, onChange }: FacetSidebarProps) {
  function update(patch: Partial<EncounterSearchFilters>) {
    onChange({ ...filters, ...patch });
  }

  function toggleArrayValue(field: keyof EncounterSearchFilters, value: string) {
    const current = (filters[field] as string[] | undefined) ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update({ [field]: next.length ? next : undefined });
  }

  function toggleBool(field: keyof EncounterSearchFilters, current?: boolean) {
    update({ [field]: current === true ? undefined : true });
  }

  const departmentBuckets = aggregations?.departments ?? [];
  const patientGenderBuckets = aggregations?.patient_genders ?? [];
  const patientRaceBuckets = aggregations?.patient_races ?? [];
  const patientEthnicityBuckets = aggregations?.patient_ethnicities ?? [];
  const providerGenderBuckets = aggregations?.provider_genders ?? [];
  const providerRaceBuckets = aggregations?.provider_races ?? [];
  const providerEthnicityBuckets = aggregations?.provider_ethnicities ?? [];
  const noteTypeBuckets = aggregations?.note_types ?? [];

  const departmentActiveCount = filters.department?.length ?? 0;
  const dateActiveCount = [filters.date_from, filters.date_to].filter(Boolean).length;
  const demographicActiveCount = [
    ...(filters.patient_gender ?? []),
    ...(filters.patient_race ?? []),
    ...(filters.patient_ethnicity ?? []),
    ...(filters.provider_gender ?? []),
    ...(filters.provider_race ?? []),
    ...(filters.provider_ethnicity ?? []),
  ].length;
  const multimodalActiveCount = [
    filters.has_transcript,
    filters.has_audio,
    filters.has_provider_view,
    filters.has_patient_view,
    filters.has_room_view,
  ].filter(Boolean).length;
  const clinicalActiveCount =
    (filters.has_notes ? 1 : 0) +
    (filters.note_types?.length ?? 0) +
    (filters.drug_names?.length ?? 0) +
    (filters.icd_codes?.length ?? 0) +
    (filters.cpt_codes?.length ?? 0);

  return (
    <Card.Root
      w="300px"
      flexShrink={0}
      shadow="sm"
      border="1px"
      borderColor="gray.200"
      bg="white"
      overflow="hidden"
    >
      <Card.Body p={0}>
        <Box px={4} py={3} borderBottom="1px" borderColor="gray.100">
          <Text
            fontWeight="bold"
            fontSize="xs"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Filters
          </Text>
        </Box>

        <VStack gap={0} align="stretch">
          <CollapsibleSection
            activeBg="blue.50"
            activeHoverBg="blue.100"
            activeBorderColor="blue.500"
            isActive={dateActiveCount > 0}
            header={
              <SectionHeader
                icon={<FaCalendar size={12} />}
                title="Date Range"
                activeCount={dateActiveCount}
                iconColor="blue.500"
              />
            }
          >
            <VStack gap={3} px={4} py={3} align="stretch">
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                  From
                </Text>
                <Input
                  type="date"
                  size="sm"
                  value={filters.date_from ?? ''}
                  onChange={(e) => update({ date_from: e.target.value || undefined })}
                  borderColor="gray.300"
                  _focus={{ borderColor: 'blue.500' }}
                />
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                  To
                </Text>
                <Input
                  type="date"
                  size="sm"
                  value={filters.date_to ?? ''}
                  onChange={(e) => update({ date_to: e.target.value || undefined })}
                  borderColor="gray.300"
                  _focus={{ borderColor: 'blue.500' }}
                />
              </Box>
            </VStack>
          </CollapsibleSection>

          <CollapsibleSection
            activeBg="orange.50"
            activeHoverBg="orange.100"
            activeBorderColor="orange.500"
            isActive={departmentActiveCount > 0}
            header={
              <SectionHeader
                icon={<FaHospital size={12} />}
                title="Department"
                activeCount={departmentActiveCount}
                iconColor="orange.500"
              />
            }
          >
            <VStack gap={3} px={4} py={3} align="stretch">
              <AggCheckboxList
                buckets={departmentBuckets}
                selected={filters.department}
                onToggle={(val) => toggleArrayValue('department', val)}
              />
            </VStack>
          </CollapsibleSection>

          <CollapsibleSection
            activeBg="green.50"
            activeHoverBg="green.100"
            activeBorderColor="green.500"
            isActive={demographicActiveCount > 0}
            header={
              <SectionHeader
                icon={<FaUsers size={12} />}
                title="Demographics"
                activeCount={demographicActiveCount}
                iconColor="green.500"
              />
            }
          >
            <VStack gap={3} px={4} py={3} align="stretch">
              {patientGenderBuckets.length > 0 && (
                <Box>
                  <HStack gap={1} mb={1}>
                    <Box color="green.500">
                      <FaUsers size={9} />
                    </Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      Patient Gender
                    </Text>
                  </HStack>
                  <AggCheckboxList
                    buckets={patientGenderBuckets}
                    selected={filters.patient_gender}
                    onToggle={(v) => toggleArrayValue('patient_gender', v)}
                    labelMap={GENDER_LABELS}
                  />
                </Box>
              )}
              {patientRaceBuckets.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                    Patient Race
                  </Text>
                  <AggCheckboxList
                    buckets={patientRaceBuckets}
                    selected={filters.patient_race}
                    onToggle={(v) => toggleArrayValue('patient_race', v)}
                    labelMap={RACE_LABELS}
                  />
                </Box>
              )}
              {patientEthnicityBuckets.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                    Patient Ethnicity
                  </Text>
                  <AggCheckboxList
                    buckets={patientEthnicityBuckets}
                    selected={filters.patient_ethnicity}
                    onToggle={(v) => toggleArrayValue('patient_ethnicity', v)}
                    labelMap={ETHNICITY_LABELS}
                  />
                </Box>
              )}
              {providerGenderBuckets.length > 0 && (
                <Box>
                  <HStack gap={1} mb={1}>
                    <Box color="purple.500">
                      <FaUserMd size={9} />
                    </Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      Provider Gender
                    </Text>
                  </HStack>
                  <AggCheckboxList
                    buckets={providerGenderBuckets}
                    selected={filters.provider_gender}
                    onToggle={(v) => toggleArrayValue('provider_gender', v)}
                    labelMap={GENDER_LABELS}
                  />
                </Box>
              )}
              {providerRaceBuckets.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                    Provider Race
                  </Text>
                  <AggCheckboxList
                    buckets={providerRaceBuckets}
                    selected={filters.provider_race}
                    onToggle={(v) => toggleArrayValue('provider_race', v)}
                    labelMap={RACE_LABELS}
                  />
                </Box>
              )}
              {providerEthnicityBuckets.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                    Provider Ethnicity
                  </Text>
                  <AggCheckboxList
                    buckets={providerEthnicityBuckets}
                    selected={filters.provider_ethnicity}
                    onToggle={(v) => toggleArrayValue('provider_ethnicity', v)}
                    labelMap={ETHNICITY_LABELS}
                  />
                </Box>
              )}
            </VStack>
          </CollapsibleSection>

          <CollapsibleSection
            activeBg="teal.50"
            activeHoverBg="teal.100"
            activeBorderColor="teal.500"
            isActive={multimodalActiveCount > 0}
            header={
              <SectionHeader
                icon={<FaVideo size={12} />}
                title="Multimodal Data"
                activeCount={multimodalActiveCount}
                iconColor="teal.500"
              />
            }
          >
            <VStack gap={2} px={4} py={3} align="stretch">
              {(
                [
                  { field: 'has_transcript', label: 'Transcript' },
                  { field: 'has_audio', label: 'Audio' },
                  { field: 'has_provider_view', label: 'Provider View' },
                  { field: 'has_patient_view', label: 'Patient View' },
                  { field: 'has_room_view', label: 'Room View' },
                ] as { field: keyof EncounterSearchFilters; label: string }[]
              ).map(({ field, label }) => (
                <Checkbox.Root
                  key={field}
                  checked={filters[field] === true}
                  onCheckedChange={() => toggleBool(field, filters[field] as boolean | undefined)}
                  size="sm"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>
                    <Text fontSize="sm">{label}</Text>
                  </Checkbox.Label>
                </Checkbox.Root>
              ))}
            </VStack>
          </CollapsibleSection>

          <CollapsibleSection
            activeBg="purple.50"
            activeHoverBg="purple.100"
            activeBorderColor="purple.500"
            isActive={clinicalActiveCount > 0}
            header={
              <SectionHeader
                icon={<FaFileMedical size={12} />}
                title="Clinical Data"
                activeCount={clinicalActiveCount}
                iconColor="purple.500"
              />
            }
          >
            <VStack gap={3} px={4} py={3} align="stretch">
              <Checkbox.Root
                checked={filters.has_notes === true}
                onCheckedChange={() => toggleBool('has_notes', filters.has_notes)}
                size="sm"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>
                  <Text fontSize="sm">Has Clinical Notes</Text>
                </Checkbox.Label>
              </Checkbox.Root>

              {noteTypeBuckets.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                    Note Types
                  </Text>
                  <AggCheckboxList
                    buckets={noteTypeBuckets}
                    selected={filters.note_types}
                    onToggle={(v) => toggleArrayValue('note_types', v)}
                  />
                </Box>
              )}

              <Box>
                <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                  Drug Name
                </Text>
                <Input
                  size="sm"
                  placeholder="e.g. metformin"
                  value={filters.drug_names?.[0] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    update({ drug_names: val ? [val] : undefined });
                  }}
                  borderColor="gray.300"
                  _focus={{ borderColor: 'purple.500' }}
                />
              </Box>

              <Box>
                <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                  ICD Code
                </Text>
                <Input
                  size="sm"
                  placeholder="e.g. Z00.00"
                  value={filters.icd_codes?.[0] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    update({ icd_codes: val ? [val] : undefined });
                  }}
                  borderColor="gray.300"
                  _focus={{ borderColor: 'purple.500' }}
                />
              </Box>

              <Box>
                <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                  CPT Code / Procedure
                </Text>
                <Input
                  size="sm"
                  placeholder="e.g. 99213"
                  value={filters.cpt_codes?.[0] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    update({ cpt_codes: val ? [val] : undefined });
                  }}
                  borderColor="gray.300"
                  _focus={{ borderColor: 'purple.500' }}
                />
              </Box>
            </VStack>
          </CollapsibleSection>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
