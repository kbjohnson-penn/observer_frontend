# Encounter Data Models

## Overview

This file defines the core data models for healthcare encounter data in the Observer system. These models define the structure of patient-provider interaction data.

## Core Interfaces

### EncounterDataType
**Purpose**: Internal system representation of healthcare encounters

**Key Fields:**
- `id`: Unique numeric identifier
- `case_id`: External case reference (nullable)
- `encounter_source`: Reference to data source
- `department`: Medical department identifier
- `provider`: Healthcare provider identifier
- `patient`: Patient identifier
- `encounter_date_and_time`: ISO timestamp of encounter
- `provider_satisfaction`: Numeric satisfaction rating
- `patient_satisfaction`: Numeric satisfaction rating
- `is_deidentified`: Data deidentification status
- `is_restricted`: Access restriction flag
- `type`: Encounter classification
- `encounterfile_ids`: Related file identifiers
- `tier`: Data access tier level

### PublicEncounterDataType
**Purpose**: Public API representation with resolved references

**Key Differences from Internal Type:**
- References resolved to readable strings (e.g., department name instead of ID)
- Flexible field types (number | string) for API compatibility
- Simplified structure for frontend consumption

### EncounterSourceDataType
**Purpose**: Classification of encounter data origins

**Fields:**
- `id`: Unique identifier
- `name`: Human-readable source name (e.g., "Simulation Center", "Clinic")

### EncounterFileDataType
**Purpose**: File attachments and media associated with encounters

**Fields:**
- `id`: Unique file identifier
- `file_type`: Media type classification
- `file_name`: Original filename
- `file_path`: Storage location
- `timestamp`: File creation/upload time
- `encounter`: Parent encounter reference

## Combined Data Types

### NestedCombinedDataType
**Purpose**: Complete encounter data with all related entities

**Structure:**
```typescript
{
  encounter: PublicEncounterDataType,
  patient: PublicPatientDataType,
  provider: PublicProviderDataType,
  multi_modal_data: PublicMultiModalDataType
}
```

### FlattenedCombinedDataType
**Purpose**: Flexible structure for data export and analysis

**Features:**
- Dynamic property access for flexible data handling
- Supports CSV export functionality
- Compatible with data visualization requirements

## Data Relationships

The encounter system uses a relational model where:

1. **Encounters** are central entities linking all other data
2. **Patients** and **Providers** contain demographic information
3. **Departments** organize encounters by medical specialty
4. **Multimodal Data** contains file paths for videos, audio, and documents
5. **Encounter Sources** track data provenance and origin

## Data Model Benefits

- **Structured validation** of data formats
- **Consistent data handling** across the application
- **Clear API contracts** between frontend and backend
- **Reliable data processing** for healthcare information

## Usage in Application

These data models are used throughout the application for:
- API response handling
- Component data requirements
- Data transformation and filtering
- Export functionality
- Chart and visualization data processing