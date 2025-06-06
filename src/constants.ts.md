# Application Constants - Healthcare Data Configuration

## Overview

This file contains essential constants that define healthcare data categories, visualization settings, and application configuration for the Observer platform.

## Healthcare Data Categories

### Racial Categories (RACIAL_CATEGORIES)
Standard healthcare demographic classifications:
- **AI**: American Indian or Alaska Native
- **A**: Asian
- **NHPI**: Native Hawaiian or Other Pacific Islander
- **W**: White
- **B**: Black or African American
- **M**: More than One Race
- **UN**: Unknown

### Ethnic Categories (ETHNIC_CATEGORIES)
Ethnicity classifications following healthcare standards:
- **NH**: Not Hispanic or Latino
- **H**: Hispanic or Latino
- **UN**: Unknown or Not Reported Ethnicity

### Gender Categories (GENDER_CATEGORIES)
Gender identity options:
- **M**: Male
- **F**: Female
- **UN**: Unknown or Not Reported

## Visualization Configuration

### Department Colors (DEPARTMENT_COLORS)
Consistent color scheme for medical departments:
- **SimCenter**: #8ED081 (light green)
- **Oncology**: #B4D2BA (sage green)
- **Primary Care**: #DCE2AA (light yellow-green)
- **Neurology**: #FFD700 (gold)
- **Family Medicine**: #B57F50 (brown)
- **Cardiology**: #FFC0CB (pink)
- **Orthopedics**: #4B543B (dark olive)

### Multimodal Data Colors (MULTI_MODAL_DATA_PATHS_COLORS)
Color coding for different data types in charts:
- **provider_view**: #0088FE (blue)
- **patient_view**: #00C49F (teal)
- **room_view**: #FFBB28 (orange)
- **audio**: #D84315 (red)
- **transcript**: #6A1B9A (purple)
- **patient_survey**: #00838F (dark teal)
- **provider_survey**: #3E2723 (dark brown)
- **patient_annotation**: #FFD600 (yellow)
- **provider_annotation**: #FF6D00 (orange-red)

### Node Colors (NODE_COLORS)
Graph visualization node colors:
- **MultiModalDataPathNode**: #9d82ca (lavender)
- **ProviderNode**: #EC7063 (salmon)
- **EncounterNode**: #2ECC71 (green)
- **PatientNode**: #3498DB (blue)
- **DepartmentNode**: #F1C40F (yellow)

## Filter and Selection Options

### Source Options (SOURCE_OPTIONS)
Available encounter sources:
- **Simcenter**: Simulation Center
- **Clinic**: Clinical settings
- **Pennpersonalizedcare**: Penn Personalized Care

### Data Export Options (EXPORT_OPTIONS)
Supported export formats:
- **CSV**: Comma-separated values
- **JSON**: JavaScript Object Notation

### Multimodal Data Options (MULTI_MODAL_DATA_OPTIONS)
Available data types for filtering:
- Video perspectives (provider, patient, room view)
- Audio recordings
- Text transcripts
- Survey responses
- Annotation data

## Data Export Configuration

### CSV Column Order (CSV_COLUMN_ORDER)
Standardized column sequence for data exports:

**Core Fields:**
- id, provider_id, patient_id
- encounter_source, department
- encounter_date_and_time

**Satisfaction Metrics:**
- patient_satisfaction, provider_satisfaction

**Access Control:**
- is_deidentified, is_restricted

**Demographics:**
- Patient: year_of_birth, sex, race, ethnicity
- Provider: year_of_birth, sex, race, ethnicity

**Multimodal Data:**
- provider_view, patient_view, room_view
- audio, transcript
- patient_survey, provider_survey
- patient_annotation, provider_annotation

## Usage Throughout Application

These constants ensure:
- **Consistent data categorization** across all components
- **Standardized visualization colors** for better user experience
- **Uniform export formats** for research compatibility
- **Healthcare compliance** with standard demographic categories
- **Maintainable configuration** through centralized definitions

## Healthcare Compliance

The demographic categories follow standard healthcare data collection guidelines, ensuring compatibility with:
- Electronic Health Record (EHR) systems
- Healthcare research databases
- Clinical data exchange standards
- Regulatory reporting requirements