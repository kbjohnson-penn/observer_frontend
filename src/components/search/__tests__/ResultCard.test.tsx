import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';
import ResultCard from '../ResultCard';
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

const baseHit: EncounterSearchHit = {
  encounter_id: '42',
  visit_source_value: 'clinic',
  visit_source_id: 1,
  visit_date: '2024-03-15',
  department: 'Internal Medicine',
  patient_gender: 'M',
  patient_race: 'B',
  patient_ethnicity: 'NH',
  patient_year_of_birth: 1965,
  provider_gender: 'F',
  provider_race: 'W',
  provider_ethnicity: 'NH',
  provider_year_of_birth: 1980,
  has_transcript: true,
  has_audio: false,
  has_provider_view: false,
  has_patient_view: false,
  has_room_view: false,
  file_types: ['transcript'],
  icd_codes: ['Z00.00', 'I10', 'Z00.00'], // duplicate to test dedup
  cpt_codes: [],
  drug_names: ['metformin'],
  drug_count: 1,
  has_notes: true,
  note_types: ['Progress Notes'],
  note_count: 2,
  tier_level: 1,
  highlights: {},
  matched_in: [],
};

describe('ResultCard', () => {
  it('renders patient gender label "Male" for code "M"', () => {
    renderWithProvider(<ResultCard hit={baseHit} />);
    expect(screen.getByText('Male')).toBeInTheDocument();
  });

  it('renders patient race label "Black" for code "B"', () => {
    renderWithProvider(<ResultCard hit={baseHit} />);
    expect(screen.getByText('Black')).toBeInTheDocument();
  });

  it('renders patient ethnicity label "Not Hispanic" for code "NH"', () => {
    renderWithProvider(<ResultCard hit={baseHit} />);
    // patient ethnicity NH → Not Hispanic
    const badges = screen.getAllByText('Not Hispanic');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('renders tier badge', () => {
    renderWithProvider(<ResultCard hit={baseHit} />);
    expect(screen.getByText('Tier 1')).toBeInTheDocument();
  });

  it('renders visit date formatted', () => {
    renderWithProvider(<ResultCard hit={baseHit} />);
    expect(screen.getByText(/Mar 15, 2024/i)).toBeInTheDocument();
  });

  it('deduplicates ICD codes — shows Z00.00 once and I10', () => {
    renderWithProvider(<ResultCard hit={baseHit} />);
    const z00 = screen.getAllByText('Z00.00');
    expect(z00).toHaveLength(1);
    expect(screen.getByText('I10')).toBeInTheDocument();
  });

  it('shows Transcript badge when has_transcript is true', () => {
    renderWithProvider(<ResultCard hit={baseHit} />);
    expect(screen.getByText('Transcript')).toBeInTheDocument();
  });

  it('does not show Audio badge when has_audio is false', () => {
    renderWithProvider(<ResultCard hit={baseHit} />);
    expect(screen.queryByText('Audio')).not.toBeInTheDocument();
  });

  it('shows no multimodal badges when all flags false', () => {
    const hit: EncounterSearchHit = {
      ...baseHit,
      has_transcript: false,
      has_audio: false,
      has_provider_view: false,
      has_patient_view: false,
      has_room_view: false,
    };
    renderWithProvider(<ResultCard hit={hit} />);
    expect(screen.queryByText('Transcript')).not.toBeInTheDocument();
    expect(screen.queryByText('Audio')).not.toBeInTheDocument();
  });

  it('calls onSelect with the hit when clicked', () => {
    const onSelect = jest.fn();
    renderWithProvider(<ResultCard hit={baseHit} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Tier 1').closest('[data-testid]') ?? document.body);
    // Click the card itself
    const card = screen.getByText('Male').closest('div[class]')!;
    fireEvent.click(card);
    expect(onSelect).toHaveBeenCalledWith(baseHit);
  });

  it('renders department badge when department is present', () => {
    renderWithProvider(<ResultCard hit={baseHit} />);
    expect(screen.getByText('Internal Medicine')).toBeInTheDocument();
  });

  it('does not render department badge when department is null', () => {
    const hit: EncounterSearchHit = { ...baseHit, department: null };
    renderWithProvider(<ResultCard hit={hit} />);
    expect(screen.queryByText('Internal Medicine')).not.toBeInTheDocument();
  });

  it('shows drug count badge', () => {
    renderWithProvider(<ResultCard hit={baseHit} />);
    expect(screen.getByText('1 drug')).toBeInTheDocument();
  });

  it('shows note count badge', () => {
    renderWithProvider(<ResultCard hit={baseHit} />);
    expect(screen.getByText('2 notes')).toBeInTheDocument();
  });
});
