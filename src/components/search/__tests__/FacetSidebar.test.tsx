import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '@/components/ui/provider';
import FacetSidebar from '../FacetSidebar';
import { EncounterSearchFilters, SearchAggregations } from '@/interfaces/search';

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

const emptyAggregations: SearchAggregations = {
  departments: [],
  patient_genders: [],
  patient_races: [],
  patient_ethnicities: [],
  provider_genders: [],
  provider_races: [],
  provider_ethnicities: [],
  tier_distribution: [],
  note_types: [],
  file_types: [],
};

const aggregationsWithData: SearchAggregations = {
  ...emptyAggregations,
  departments: [{ key: 'Internal Medicine', count: 15 }],
  patient_genders: [
    { key: 'F', count: 47 },
    { key: 'M', count: 40 },
  ],
  patient_races: [
    { key: 'B', count: 42 },
    { key: 'W', count: 34 },
  ],
  note_types: [{ key: 'Progress Notes', count: 20 }],
};

describe('FacetSidebar', () => {
  it('renders section headers', () => {
    renderWithProvider(
      <FacetSidebar filters={{}} aggregations={emptyAggregations} onChange={jest.fn()} />
    );
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Demographics')).toBeInTheDocument();
    expect(screen.getByText('Multimodal Data')).toBeInTheDocument();
    expect(screen.getByText('Clinical Data')).toBeInTheDocument();
  });

  it('renders date range inputs', () => {
    renderWithProvider(
      <FacetSidebar filters={{}} aggregations={emptyAggregations} onChange={jest.fn()} />
    );
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
  });

  it('renders patient gender checkboxes from aggregations', () => {
    renderWithProvider(
      <FacetSidebar filters={{}} aggregations={aggregationsWithData} onChange={jest.fn()} />
    );
    expect(screen.getByText('Female')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
  });

  it('does not render gender checkboxes when aggregations empty', () => {
    renderWithProvider(
      <FacetSidebar filters={{}} aggregations={emptyAggregations} onChange={jest.fn()} />
    );
    expect(screen.queryByText('Female')).not.toBeInTheDocument();
    expect(screen.queryByText('Male')).not.toBeInTheDocument();
  });

  it('calls onChange with patient_gender filter when checkbox clicked', async () => {
    const onChange = jest.fn();
    renderWithProvider(
      <FacetSidebar filters={{}} aggregations={aggregationsWithData} onChange={onChange} />
    );
    await userEvent.click(screen.getByText('Female'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ patient_gender: ['F'] }));
  });

  it('removes filter when checked item is clicked again', async () => {
    const onChange = jest.fn();
    renderWithProvider(
      <FacetSidebar
        filters={{ patient_gender: ['F'] }}
        aggregations={aggregationsWithData}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByText('Female'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ patient_gender: undefined }));
  });

  it('renders multimodal checkboxes', () => {
    renderWithProvider(
      <FacetSidebar filters={{}} aggregations={emptyAggregations} onChange={jest.fn()} />
    );
    expect(screen.getByText('Transcript')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
  });

  it('calls onChange with has_transcript=true when Transcript checkbox clicked', async () => {
    const onChange = jest.fn();
    renderWithProvider(
      <FacetSidebar filters={{}} aggregations={emptyAggregations} onChange={onChange} />
    );
    await userEvent.click(screen.getByText('Transcript'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ has_transcript: true }));
  });

  it('updates drug_names filter when drug name input changed', () => {
    const onChange = jest.fn();
    renderWithProvider(
      <FacetSidebar filters={{}} aggregations={emptyAggregations} onChange={onChange} />
    );
    fireEvent.change(screen.getByPlaceholderText('e.g. metformin'), {
      target: { value: 'lisinopril' },
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ drug_names: ['lisinopril'] }));
  });

  it('renders department checkboxes from aggregations', () => {
    renderWithProvider(
      <FacetSidebar filters={{}} aggregations={aggregationsWithData} onChange={jest.fn()} />
    );
    expect(screen.getByText('Internal Medicine')).toBeInTheDocument();
  });

  it('calls onChange with department filter when checkbox clicked', async () => {
    const onChange = jest.fn();
    renderWithProvider(
      <FacetSidebar filters={{}} aggregations={aggregationsWithData} onChange={onChange} />
    );
    await userEvent.click(screen.getByText('Internal Medicine'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ department: ['Internal Medicine'] })
    );
  });

  it('renders note types from aggregations', () => {
    renderWithProvider(
      <FacetSidebar filters={{}} aggregations={aggregationsWithData} onChange={jest.fn()} />
    );
    expect(screen.getByText('Progress Notes')).toBeInTheDocument();
  });
});
