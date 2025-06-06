# Public Dashboard - Healthcare Analytics

## Overview

The Public Dashboard is the core functionality of the Observer Frontend, providing interactive visualizations of healthcare encounter data. This server-side rendered page fetches and displays multimodal clinical data for research analysis.

## Data Sources

The dashboard aggregates data from multiple backend endpoints:

### Patient Data (`/public/patients/`)
- Patient demographics and identification
- Supports research on patient population patterns

### Provider Data (`/public/providers/`)
- Healthcare provider information
- Enables provider-patient interaction analysis

### Department Data (`/public/departments/`)
- Hospital/clinic department organization
- Facilitates departmental encounter analysis

### Encounter Data (`/public/encounters/`)
- Core patient-provider interaction records
- Links patients, providers, and multimodal data

### Multimodal Data (`/public/mmdata/`)
- Video, audio, transcript, and survey data paths
- Enables comprehensive interaction analysis

### Encounter Sources (`/public/encountersources/`)
- Data source classification
- Supports data provenance tracking

## Architecture

### Data Processing
- Department color mapping for visualization consistency
- Error handling for failed API requests
- Structured data interfaces

### Component Structure
- Dashboard serves as the main container
- Interactive playground for data exploration
- Chart components for various visualizations
- Filter panels for data refinement
- Statistics cards for key metrics

## Key Features

- **Interactive Charts**: Multiple visualization types for healthcare data
- **Filtering Capabilities**: Department, date, demographic filters
- **Real-time Analytics**: Dynamic data exploration
- **Responsive Design**: Optimized for various screen sizes
- **Export Functionality**: Data export for further analysis

## Error Handling

Each data fetch includes error handling that:
- Logs errors to console for debugging
- Returns empty arrays to prevent application crashes
- Allows partial dashboard functionality if some data sources fail