'use client';

import React, { useMemo } from 'react';
import { VStack, HStack, Input, Select, createListCollection } from '@chakra-ui/react';
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
    <VStack gap={2.5} align="stretch">
      {/* Gender Select */}
      <Select.Root
        collection={genderCollection}
        size="sm"
        multiple
        value={values.gender}
        onValueChange={(details) => onChange('gender', details.value)}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Gender">
              {values.gender.length > 0 ? `Gender: ${genderLabels.join(', ')}` : null}
            </Select.ValueText>
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {genderCollection.items.map((gender) => (
              <Select.Item item={gender} key={`${keyPrefix}-gender-${gender.value}`}>
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
        multiple
        value={values.race}
        onValueChange={(details) => onChange('race', details.value)}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Race">
              {values.race.length > 0 ? `Race: ${raceLabels.join(', ')}` : null}
            </Select.ValueText>
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {raceCollection.items.map((race) => (
              <Select.Item item={race} key={`${keyPrefix}-race-${race.value}`}>
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
        multiple
        value={values.ethnicity}
        onValueChange={(details) => onChange('ethnicity', details.value)}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Ethnicity">
              {values.ethnicity.length > 0 ? `Ethnicity: ${ethnicityLabels.join(', ')}` : null}
            </Select.ValueText>
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {ethnicityCollection.items.map((ethnicity) => (
              <Select.Item item={ethnicity} key={`${keyPrefix}-ethnicity-${ethnicity.value}`}>
                {ethnicity.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>

      {/* Age Range Inputs */}
      <HStack gap={2}>
        <Input
          type="number"
          placeholder="Min Age"
          size="sm"
          value={values.ageFrom}
          onChange={(e) => onChange('ageFrom', e.target.value)}
          min={0}
          max={120}
        />
        <Input
          type="number"
          placeholder="Max Age"
          size="sm"
          value={values.ageTo}
          onChange={(e) => onChange('ageTo', e.target.value)}
          min={0}
          max={120}
        />
      </HStack>
    </VStack>
  );
}
