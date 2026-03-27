import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';
import ResultsList from '../ResultsList';
import { EncounterSearchHit } from '@/interfaces/search';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

function renderWithProvider(ui: React.ReactElement) {
  return render(<Provider>{ui}</Provider>);
}

const makeHit = (id: string): EncounterSearchHit => ({
  encounter_id: id,
  visit_source_value: 'clinic',
  visit_source_id: 1,
  visit_date: '2024-01-01',
  department: null,
  patient_gender: 'F',
  patient_race: 'W',
  patient_ethnicity: 'NH',
  patient_year_of_birth: 1970,
  provider_gender: 'M',
  provider_race: 'W',
  provider_ethnicity: 'NH',
  provider_year_of_birth: 1975,
  has_transcript: false,
  has_audio: false,
  has_provider_view: false,
  has_patient_view: false,
  has_room_view: false,
  file_types: [],
  icd_codes: [],
  cpt_codes: [],
  drug_names: [],
  drug_count: 0,
  has_notes: false,
  note_types: [],
  note_count: 0,
  tier_level: 1,
  highlights: {},
  matched_in: [],
});

describe('ResultsList', () => {
  it('shows empty state when hasSearched is false', () => {
    renderWithProvider(
      <ResultsList results={[]} loading={false} totalCount={0} hasSearched={false} />
    );
    expect(screen.getByText('Search encounters')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading=true', () => {
    renderWithProvider(
      <ResultsList results={[]} loading={true} totalCount={0} hasSearched={true} />
    );
    // Skeleton elements rendered — no results header
    expect(screen.queryByText(/encounters found/i)).not.toBeInTheDocument();
  });

  it('shows no encounters found when hasSearched and results empty', () => {
    renderWithProvider(
      <ResultsList results={[]} loading={false} totalCount={0} hasSearched={true} />
    );
    expect(screen.getByText('No encounters found')).toBeInTheDocument();
  });

  it('renders result count header when results present', () => {
    const hits = [makeHit('1'), makeHit('2')];
    renderWithProvider(
      <ResultsList results={hits} loading={false} totalCount={42} hasSearched={true} />
    );
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText(/encounters found/i)).toBeInTheDocument();
  });

  it('shows singular "encounter found" for count=1', () => {
    renderWithProvider(
      <ResultsList results={[makeHit('1')]} loading={false} totalCount={1} hasSearched={true} />
    );
    expect(screen.getByText(/encounter found/i)).toBeInTheDocument();
    expect(screen.queryByText(/encounters found/i)).not.toBeInTheDocument();
  });

  it('renders a ResultCard for each hit', () => {
    const hits = [makeHit('1'), makeHit('2'), makeHit('3')];
    renderWithProvider(
      <ResultsList results={hits} loading={false} totalCount={3} hasSearched={true} />
    );
    // Each card shows Tier 1 badge
    expect(screen.getAllByText('Tier 1')).toHaveLength(3);
  });

  it('shows "sorted by relevance" label', () => {
    renderWithProvider(
      <ResultsList results={[makeHit('1')]} loading={false} totalCount={1} hasSearched={true} />
    );
    expect(screen.getByText('sorted by relevance')).toBeInTheDocument();
  });
});
