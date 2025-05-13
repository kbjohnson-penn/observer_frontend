# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). It diverges in the following ways:

- Release titles do not link to the commits within the release
- This project only strictly adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) for bug fix releases.

## [2.0.0] - 2025-05-13

### Added

- Integrated Chakra UI alongside TailwindCSS for component styling
- Added 'Penn Personalized Care' option

### Changed

- Major layout restructuring with improved responsive design
- Completely refactored file structure for better organization
- Updated interface definitions for improved type safety
- Modernized API integration with latest backend version

### Fixed

- Updated patient and provider ID references in getEncountersByGroup function

## [1.1.0] - 2024-08-01

### Added

- Docker containerization

## [1.0.0] - 2024-07-31

### Added

- Dashboard Page
  - Info Cards
  - Mobile View
  - Playground to filter and export data
  - Charts:
    - Encounter Per Department
    - Encounters Over Time
    - Patient and Provider Satisfaction Score
    - Encounters By Multi Modal Data
    - Ethnic Groups
    - Racial Groups

### Removed

- Home Page
  - Population demographics

## [0.1.0] - 2024-02-19

### Added

- Home Page
  - Table for population demographics
- Dashboard Page
  - EncounterLineChart
  - EncounterBarChart
  - EncounterByMediaBarChart
  - TotalMediaBarChart
