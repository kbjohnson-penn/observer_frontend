# Observer Backend Documentation

## Overview

This guide provides detailed instructions on how to use the Observer backend to manage data entries through the Django Admin interface. The Observer backend is a web-based application designed to store and manage data related to patient encounters, including patient information, provider details, and multimodal data paths.

## Data Entry Workflow

### Step 1: Authentication
1. Navigate to the backend login page
2. Enter username and password credentials
3. Access the Django Admin dashboard

### Step 2: Data Entry Forms

#### 2.1 Encounter Source Form
**Purpose**: Define the origin/source of encounter data

**Required Fields:**
- **Name**: Unique identifier for the encounter source (mandatory)

#### 2.2 Department Form
**Purpose**: Organize encounters by hospital/clinic departments

**Required Fields:**
- **Name**: Unique department name (mandatory)

#### 2.3 Patient Form
**Purpose**: Store patient demographic and identification data

**Fields:**
- **Patient ID**: Unique identifier (mandatory)
- **First Name**: Optional
- **Last Name**: Optional
- **Date of Birth**: Optional, date picker available
- **Sex**: Optional, predefined choices
- **Race**: Optional, predefined choices
- **Ethnicity**: Optional, predefined choices

#### 2.4 Provider Form
**Purpose**: Store healthcare provider information

**Fields:**
- **Provider ID**: Unique identifier (mandatory)
- **First Name**: Optional
- **Last Name**: Optional
- **Date of Birth**: Optional
- **Sex**: Optional, predefined choices
- **Race**: Optional, predefined choices
- **Ethnicity**: Optional, predefined choices

#### 2.5 Multimodal Data Path Form
**Purpose**: Define file paths and URLs for various data types

**Fields:**
- **Multi Modal Data ID**: Unique identifier (mandatory)
- **Provider View**: Video URL (optional)
- **Patient View**: Video URL (optional)
- **Room View**: Video URL (optional)
- **Audio**: Audio file URL (optional)
- **Transcript**: Text transcript URL (optional)
- **Patient Survey**: Survey URL (optional)
- **Provider Survey**: Survey URL (optional)
- **RIAS Transcript**: RIAS analysis transcript URL (optional)
- **RIAS Codes**: RIAS coding data URL (optional)

#### 2.6 Encounter Form
**Purpose**: Core record linking all data elements for a patient-provider interaction

**Required Fields:**
- **Case ID**: Unique encounter identifier
- **Encounter Source**: Reference to encounter source
- **Department**: Reference to department
- **Provider**: Reference to provider
- **Patient**: Reference to patient
- **Multi Modal Data**: Reference to multimodal data paths
- **Encounter Date and Time**: When the encounter occurred

**Optional Fields:**
- **Provider Satisfaction**: Numeric rating (default: 0)
- **Patient Satisfaction**: Numeric rating (default: 0)
- **Is Deidentified**: Boolean flag (default: False)
- **Is Restricted**: Boolean flag (default: True)

### Step 3: Data Review
Review all entered information for accuracy and completeness before saving each form. Ensure all mandatory fields are populated and relationships between entities are correct.

### Step 4: Secure Logout
After completing data entry, log out securely to protect credentials and data access.

## Data Relationships

The Observer system uses a relational model where:
- **Encounters** are the central entity linking all other data
- **Patients** and **Providers** have demographic information
- **Departments** organize encounters by medical specialty
- **Multimodal Data** contains file paths for media and documents
- **Encounter Sources** track data provenance

## Security Considerations

- All encounters default to **restricted access** (Is Restricted = True)
- Data is **not deidentified** by default (Is Deidentified = False)
- Proper authentication required for all data access
- Audit trails maintained for data modifications