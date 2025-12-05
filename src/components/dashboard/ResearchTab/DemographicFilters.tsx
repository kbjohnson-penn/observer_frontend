'use client';

import React, { useMemo } from 'react';
import { VStack, HStack, Input, Select, createListCollection, Text } from '@chakra-ui/react';
import { expandDemographic } from '@/lib/utils/utils';
import { DemographicFilterValues } from '@/interfaces/researchTab';

interface DemographicFiltersProps {
  values: DemographicFilterValues;
  onChange: (key: keyof DemographicFilterValues, value: string | string[]) => void;
  availableOptions: {
    genders: string[];
    races: string[];
    ethnicities: string[];
  };
  keyPrefix?: string; // For unique keys when rendering multiple instances
}

export default function DemographicFilters({
  values,
  onChange,
  availableOptions,
  keyPrefix = '',
}: DemographicFiltersProps) {
  // Memoize collections to prevent recreating on every render
  const genderCollection = useMemo(
    () =>
      createListCollection({
        items: availableOptions.genders.map((g) => ({
          label: expandDemographic(g, 'gender'),
          value: g,
        })),
      }),
    [availableOptions.genders]
  );

  const raceCollection = useMemo(
    () =>
      createListCollection({
        items: availableOptions.races.map((r) => ({
          label: expandDemographic(r, 'race'),
          value: r,
        })),
      }),
    [availableOptions.races]
  );

  const ethnicityCollection = useMemo(
    () =>
      createListCollection({
        items: availableOptions.ethnicities.map((e) => ({
          label: expandDemographic(e, 'ethnicity'),
          value: e,
        })),
      }),
    [availableOptions.ethnicities]
  );

  // Memoize expanded labels for selected values
  const genderLabels = useMemo(
    () => values.gender.map((g) => expandDemographic(g, 'gender')),
    [values.gender]
  );

  const raceLabels = useMemo(
    () => values.race.map((r) => expandDemographic(r, 'race')),
    [values.race]
  );

  const ethnicityLabels = useMemo(
    () => values.ethnicity.map((e) => expandDemographic(e, 'ethnicity')),
    [values.ethnicity]
  );

  return (
    <VStack gap={2} align="stretch">
      {/* Gender Select */}
      <Select.Root
        collection={genderCollection}
        size="sm"
        variant="outline"
        multiple
        value={values.gender}
        onValueChange={(details) => onChange('gender', details.value)}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger borderColor="gray.300" bg="white" _hover={{ borderColor: 'gray.400' }}>
            <Select.ValueText placeholder="Gender" fontSize="sm">
              {values.gender.length > 0 ? (
                <Text as="span" fontSize="sm">
                  <Text as="span" color="gray.500" fontWeight="normal" fontSize="sm">
                    Gender:{' '}
                  </Text>
                  <Text as="span" fontWeight="semibold" color="gray.800" fontSize="sm">
                    {values.gender.length === 1
                      ? genderLabels[0]
                      : `${values.gender.length} selected`}
                  </Text>
                </Text>
              ) : null}
            </Select.ValueText>
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {genderCollection.items.map((gender) => (
              <Select.Item item={gender} key={`${keyPrefix}-gender-${gender.value}`} fontSize="sm">
                {gender.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>

      {/* Race Select */}
      <Select.Root
        collection={raceCollection}
        size="sm"
        variant="outline"
        multiple
        value={values.race}
        onValueChange={(details) => onChange('race', details.value)}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger borderColor="gray.300" bg="white" _hover={{ borderColor: 'gray.400' }}>
            <Select.ValueText placeholder="Race" fontSize="sm">
              {values.race.length > 0 ? (
                <Text as="span" fontSize="sm">
                  <Text as="span" color="gray.500" fontWeight="normal" fontSize="sm">
                    Race:{' '}
                  </Text>
                  <Text as="span" fontWeight="semibold" color="gray.800" fontSize="sm">
                    {values.race.length === 1 ? raceLabels[0] : `${values.race.length} selected`}
                  </Text>
                </Text>
              ) : null}
            </Select.ValueText>
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {raceCollection.items.map((race) => (
              <Select.Item item={race} key={`${keyPrefix}-race-${race.value}`} fontSize="sm">
                {race.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>

      {/* Ethnicity Select */}
      <Select.Root
        collection={ethnicityCollection}
        size="sm"
        variant="outline"
        multiple
        value={values.ethnicity}
        onValueChange={(details) => onChange('ethnicity', details.value)}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger borderColor="gray.300" bg="white" _hover={{ borderColor: 'gray.400' }}>
            <Select.ValueText placeholder="Ethnicity" fontSize="sm">
              {values.ethnicity.length > 0 ? (
                <Text as="span" fontSize="sm">
                  <Text as="span" color="gray.500" fontWeight="normal" fontSize="sm">
                    Ethnicity:{' '}
                  </Text>
                  <Text as="span" fontWeight="semibold" color="gray.800" fontSize="sm">
                    {values.ethnicity.length === 1
                      ? ethnicityLabels[0]
                      : `${values.ethnicity.length} selected`}
                  </Text>
                </Text>
              ) : null}
            </Select.ValueText>
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {ethnicityCollection.items.map((ethnicity) => (
              <Select.Item
                item={ethnicity}
                key={`${keyPrefix}-ethnicity-${ethnicity.value}`}
                fontSize="sm"
              >
                {ethnicity.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>

      {/* Age Range Inputs */}
      <VStack gap={2} align="stretch">
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          Age Range
        </Text>
        <HStack gap={2}>
          <Input
            type="number"
            placeholder="Min"
            size="sm"
            fontSize="sm"
            value={values.ageFrom}
            onChange={(e) => onChange('ageFrom', e.target.value)}
            padding={2}
            min={0}
            max={values.ageTo ? Number(values.ageTo) : 120}
            aria-label="Minimum age"
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: 'gray.400' }}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
            _placeholder={{ fontSize: 'sm', color: 'gray.400' }}
          />
          <Text fontSize="sm" color="gray.500">
            to
          </Text>
          <Input
            type="number"
            placeholder="Max"
            size="sm"
            fontSize="sm"
            value={values.ageTo}
            onChange={(e) => onChange('ageTo', e.target.value)}
            padding={2}
            min={values.ageFrom ? Number(values.ageFrom) : 0}
            max={120}
            aria-label="Maximum age"
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: 'gray.400' }}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
            _placeholder={{ fontSize: 'sm', color: 'gray.400' }}
          />
        </HStack>
      </VStack>
    </VStack>
  );
}
