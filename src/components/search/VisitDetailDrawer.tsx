'use client';

import { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Badge, Spinner, Center, Tabs } from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/apiClient';
import { TierBadge } from './TierBadge';

interface VisitInfo {
  id: number;
  visit_start_date: string | null;
  visit_source_value: string | null;
  visit_source_id: number | null;
  department: string | null;
  tier_level: number;
  person_id: number | null;
  provider_id: number | null;
}

interface Condition {
  id: number;
  concept_code: string | null;
  condition_source_value: string | null;
  is_primary_dx: boolean;
}

interface Drug {
  id: number;
  description: string | null;
  drug_ordering_date: string | null;
  quantity: number | null;
}

interface Procedure {
  id: number;
  name: string | null;
  description: string | null;
  procedure_ordering_date: string | null;
}

interface Note {
  id: number;
  note_date: string | null;
  note_type: string | null;
  note_text: string | null;
}

interface Observation {
  id: number;
  file_type: string | null;
  observation_date: string | null;
}

interface Measurement {
  id: number;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  weight_lb: number | null;
  height: number | null;
  pulse: number | null;
  phys_spo2: number | null;
}

interface DataSection<T> {
  count: number;
  results: T[];
}

interface VisitDetailResponse {
  visit: VisitInfo;
  conditions: DataSection<Condition>;
  drugs: DataSection<Drug>;
  procedures: DataSection<Procedure>;
  notes: DataSection<Note>;
  observations: DataSection<Observation>;
  measurements: DataSection<Measurement>;
}

interface VisitDetail {
  visit: VisitInfo;
  conditions: Condition[];
  conditionCount: number;
  drugs: Drug[];
  drugCount: number;
  procedures: Procedure[];
  procedureCount: number;
  notes: Note[];
  noteCount: number;
  observations: Observation[];
  observationCount: number;
  measurements: Measurement[];
  measurementCount: number;
}

interface VisitDetailDrawerProps {
  visitSourceId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

function EmptyRow({ label }: { label: string }) {
  return (
    <Center py={8}>
      <Text fontSize="sm" color="gray.400" fontStyle="italic">
        No {label} recorded
      </Text>
    </Center>
  );
}

function formatDate(dateStr: string | null, long = false) {
  if (!dateStr) {
    return '—';
  }
  return new Date(dateStr).toLocaleDateString(
    'en-US',
    long
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' }
  );
}

export default function VisitDetailDrawer({
  visitSourceId,
  isOpen,
  onClose,
}: VisitDetailDrawerProps) {
  type ResultState =
    | { key: null }
    | { key: number; status: 'error'; message: string }
    | { key: number; status: 'success'; data: VisitDetail };

  const [result, setResult] = useState<ResultState>({ key: null });

  const fetchKey = isOpen && visitSourceId !== null ? visitSourceId : null;

  useEffect(() => {
    if (fetchKey === null) {
      return;
    }

    let cancelled = false;

    apiClient
      .get<VisitDetailResponse>(`/research/private/visits/${fetchKey}/detail-data/`)
      .then((res) => {
        if (cancelled) {
          return;
        }
        const d = res.data;
        setResult({
          key: fetchKey,
          status: 'success',
          data: {
            visit: d.visit,
            conditions: d.conditions.results,
            conditionCount: d.conditions.count,
            drugs: d.drugs.results,
            drugCount: d.drugs.count,
            procedures: d.procedures.results,
            procedureCount: d.procedures.count,
            notes: d.notes.results,
            noteCount: d.notes.count,
            observations: d.observations.results,
            observationCount: d.observations.count,
            measurements: d.measurements.results,
            measurementCount: d.measurements.count,
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key: fetchKey, status: 'error', message: 'Failed to load visit details.' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const loading = fetchKey !== null && result.key !== fetchKey;
  const settled = !loading && result.key !== null && result.key === fetchKey;
  const error = settled && 'message' in result ? result.message : null;
  const detail = settled && 'data' in result ? result.data : null;

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => {
        if (!e.open) {
          onClose();
        }
      }}
      size="xl"
    >
      <DialogContent maxH="90vh" overflowY="auto">
        {/* Header */}
        <DialogHeader bg="gray.50" borderBottom="1px" borderColor="gray.200" px={6} py={4}>
          <HStack justify="space-between" pr={8}>
            <VStack align="flex-start" gap={2}>
              <DialogTitle fontSize="xl" fontWeight="bold" color="gray.800">
                Visit Detail
              </DialogTitle>
              {detail && (
                <HStack gap={3} flexWrap="wrap">
                  <TierBadge tier={detail.visit.tier_level} />
                  <HStack gap={1}>
                    <Text fontSize="xs" color="gray.400">
                      Visit ID
                    </Text>
                    <Text fontSize="xs" fontFamily="mono" color="gray.600" fontWeight="medium">
                      {detail.visit.id}
                    </Text>
                  </HStack>
                  {detail.visit.visit_source_value && (
                    <HStack gap={1}>
                      <Text fontSize="xs" color="gray.400">
                        Type
                      </Text>
                      <Badge variant="outline" size="sm" colorPalette="gray">
                        {detail.visit.visit_source_value}
                      </Badge>
                    </HStack>
                  )}
                  {detail.visit.visit_start_date && (
                    <HStack gap={1}>
                      <Text fontSize="xs" color="gray.400">
                        Date
                      </Text>
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                        {formatDate(detail.visit.visit_start_date)}
                      </Text>
                    </HStack>
                  )}
                  {detail.visit.department && (
                    <Badge colorPalette="orange" variant="subtle" size="sm">
                      {detail.visit.department}
                    </Badge>
                  )}
                </HStack>
              )}
            </VStack>
          </HStack>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody py={5} px={6}>
          {loading && (
            <Center py={16}>
              <VStack gap={3}>
                <Spinner size="lg" color="blue.500" />
                <Text fontSize="sm" color="gray.500">
                  Loading visit data…
                </Text>
              </VStack>
            </Center>
          )}

          {error && (
            <Center py={12}>
              <Text color="red.500">{error}</Text>
            </Center>
          )}

          {detail && !loading && (
            <Tabs.Root defaultValue="conditions" variant="line" colorPalette="blue">
              <Tabs.List mb={5} borderBottom="2px" borderColor="gray.100" gap={1}>
                <Tabs.Trigger value="conditions" px={3}>
                  Conditions
                  {detail.conditionCount > 0 && (
                    <Badge
                      ml={1.5}
                      size="sm"
                      colorPalette="gray"
                      variant="solid"
                      borderRadius="full"
                    >
                      {detail.conditionCount}
                    </Badge>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="drugs" px={3}>
                  Drugs
                  {detail.drugCount > 0 && (
                    <Badge
                      ml={1.5}
                      size="sm"
                      colorPalette="gray"
                      variant="solid"
                      borderRadius="full"
                    >
                      {detail.drugCount}
                    </Badge>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="procedures" px={3}>
                  Procedures
                  {detail.procedureCount > 0 && (
                    <Badge
                      ml={1.5}
                      size="sm"
                      colorPalette="gray"
                      variant="solid"
                      borderRadius="full"
                    >
                      {detail.procedureCount}
                    </Badge>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="notes" px={3}>
                  Notes
                  {detail.noteCount > 0 && (
                    <Badge
                      ml={1.5}
                      size="sm"
                      colorPalette="gray"
                      variant="solid"
                      borderRadius="full"
                    >
                      {detail.noteCount}
                    </Badge>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="observations" px={3}>
                  Observations
                  {detail.observationCount > 0 && (
                    <Badge
                      ml={1.5}
                      size="sm"
                      colorPalette="gray"
                      variant="solid"
                      borderRadius="full"
                    >
                      {detail.observationCount}
                    </Badge>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="vitals" px={3}>
                  Vitals
                  {detail.measurementCount > 0 && (
                    <Badge
                      ml={1.5}
                      size="sm"
                      colorPalette="gray"
                      variant="solid"
                      borderRadius="full"
                    >
                      {detail.measurementCount}
                    </Badge>
                  )}
                </Tabs.Trigger>
              </Tabs.List>

              {/* Conditions */}
              <Tabs.Content value="conditions">
                {detail.conditions.length === 0 ? (
                  <EmptyRow label="conditions" />
                ) : (
                  <VStack align="stretch" gap={2}>
                    {detail.conditions.map((c) => (
                      <HStack
                        key={c.id}
                        gap={3}
                        p={3}
                        bg="gray.50"
                        borderRadius="md"
                        border="1px"
                        borderColor="gray.100"
                      >
                        {c.concept_code && (
                          <Badge
                            colorPalette="orange"
                            variant="outline"
                            size="sm"
                            fontFamily="mono"
                            flexShrink={0}
                          >
                            {c.concept_code}
                          </Badge>
                        )}
                        {c.is_primary_dx && (
                          <Badge colorPalette="red" variant="solid" size="sm" flexShrink={0}>
                            Primary
                          </Badge>
                        )}
                        <Text fontSize="sm" color="gray.700">
                          {c.condition_source_value ?? '—'}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Tabs.Content>

              {/* Drugs */}
              <Tabs.Content value="drugs">
                {detail.drugs.length === 0 ? (
                  <EmptyRow label="drugs" />
                ) : (
                  <VStack align="stretch" gap={2}>
                    {detail.drugs.map((d) => (
                      <HStack
                        key={d.id}
                        gap={3}
                        p={3}
                        bg="gray.50"
                        borderRadius="md"
                        border="1px"
                        borderColor="gray.100"
                        justify="space-between"
                      >
                        <Text fontSize="sm" color="gray.700">
                          {d.description ?? '—'}
                        </Text>
                        <HStack gap={3} flexShrink={0}>
                          {d.quantity !== null && (
                            <Text fontSize="xs" color="gray.500">
                              qty: {d.quantity}
                            </Text>
                          )}
                          {d.drug_ordering_date && (
                            <Text fontSize="xs" color="gray.400">
                              {d.drug_ordering_date}
                            </Text>
                          )}
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Tabs.Content>

              {/* Procedures */}
              <Tabs.Content value="procedures">
                {detail.procedures.length === 0 ? (
                  <EmptyRow label="procedures" />
                ) : (
                  <VStack align="stretch" gap={2}>
                    {detail.procedures.map((p) => (
                      <Box
                        key={p.id}
                        p={3}
                        bg="gray.50"
                        borderRadius="md"
                        border="1px"
                        borderColor="gray.100"
                      >
                        <HStack justify="space-between" mb={p.description ? 1 : 0}>
                          <Text fontSize="sm" fontWeight="medium" color="gray.800">
                            {p.name ?? '—'}
                          </Text>
                          {p.procedure_ordering_date && (
                            <Text fontSize="xs" color="gray.400" flexShrink={0}>
                              {p.procedure_ordering_date}
                            </Text>
                          )}
                        </HStack>
                        {p.description && (
                          <Text fontSize="xs" color="gray.500">
                            {p.description}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                )}
              </Tabs.Content>

              {/* Notes */}
              <Tabs.Content value="notes">
                {detail.notes.length === 0 ? (
                  <EmptyRow label="notes" />
                ) : (
                  <VStack align="stretch" gap={3}>
                    {detail.notes.map((n) => (
                      <Box
                        key={n.id}
                        p={4}
                        bg="gray.50"
                        borderRadius="md"
                        borderLeft="3px solid"
                        borderLeftColor="gray.300"
                      >
                        <HStack justify="space-between" mb={2}>
                          {n.note_type && (
                            <Badge colorPalette="gray" variant="subtle" size="sm">
                              {n.note_type}
                            </Badge>
                          )}
                          {n.note_date && (
                            <Text fontSize="xs" color="gray.400">
                              {n.note_date}
                            </Text>
                          )}
                        </HStack>
                        <Text
                          fontSize="sm"
                          whiteSpace="pre-wrap"
                          overflowWrap="break-word"
                          color="gray.700"
                          lineHeight={1.6}
                        >
                          {n.note_text ?? '—'}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Tabs.Content>

              {/* Observations */}
              <Tabs.Content value="observations">
                {detail.observations.length === 0 ? (
                  <EmptyRow label="observations" />
                ) : (
                  <VStack align="stretch" gap={2}>
                    {detail.observations.map((o) => (
                      <HStack
                        key={o.id}
                        gap={3}
                        p={3}
                        bg="gray.50"
                        borderRadius="md"
                        border="1px"
                        borderColor="gray.100"
                      >
                        {o.file_type && (
                          <Badge colorPalette="gray" variant="subtle" size="sm">
                            {o.file_type}
                          </Badge>
                        )}
                        {o.observation_date && (
                          <Text fontSize="xs" color="gray.400">
                            {o.observation_date}
                          </Text>
                        )}
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Tabs.Content>

              {/* Vitals */}
              <Tabs.Content value="vitals">
                {detail.measurements.length === 0 ? (
                  <EmptyRow label="vitals" />
                ) : (
                  <VStack align="stretch" gap={3}>
                    {detail.measurements.map((m) => (
                      <Box
                        key={m.id}
                        p={4}
                        bg="gray.50"
                        borderRadius="lg"
                        border="1px"
                        borderColor="gray.200"
                      >
                        <HStack gap={8} flexWrap="wrap">
                          {m.bp_systolic !== null && m.bp_diastolic !== null && (
                            <VStack gap={0} align="center">
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Blood Pressure
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                {m.bp_systolic}/{m.bp_diastolic}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                mmHg
                              </Text>
                            </VStack>
                          )}
                          {m.pulse !== null && (
                            <VStack gap={0} align="center">
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Pulse
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                {m.pulse}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                bpm
                              </Text>
                            </VStack>
                          )}
                          {m.weight_lb !== null && (
                            <VStack gap={0} align="center">
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Weight
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                {m.weight_lb}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                lb
                              </Text>
                            </VStack>
                          )}
                          {m.height !== null && (
                            <VStack gap={0} align="center">
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Height
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                {m.height}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                in
                              </Text>
                            </VStack>
                          )}
                          {m.phys_spo2 !== null && (
                            <VStack gap={0} align="center">
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                SpO2
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                {m.phys_spo2}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                %
                              </Text>
                            </VStack>
                          )}
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Tabs.Content>
            </Tabs.Root>
          )}
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
