/**
 * Table Registry Module
 *
 * Central export point for all table configuration related functionality.
 */

export { tableRegistry, default } from './table-registry';
export type {
  TableConfig,
  TableCategory,
  ColumnConfig,
  ColumnFormatter,
  PaginationConfig,
  SortingConfig,
  DisplayConfig,
  FeatureConfig,
  ForeignKeyConfig,
  ApiKeyMapping,
  TableState,
  DataBrowserState,
} from './types';
export { DEFAULT_FEATURES, DEFAULT_PAGINATION } from './types';

// Re-export individual configs for direct access if needed
export { personConfig } from './configs/person.config';
export { providerConfig } from './configs/provider.config';
export { visitOccurrenceConfig } from './configs/visit-occurrence.config';
export { noteConfig } from './configs/note.config';
export { conditionOccurrenceConfig } from './configs/condition-occurrence.config';
export { drugExposureConfig } from './configs/drug-exposure.config';
export { procedureOccurrenceConfig } from './configs/procedure-occurrence.config';
export { measurementConfig } from './configs/measurement.config';
export { observationConfig } from './configs/observation.config';
export { patientSurveyConfig } from './configs/patient-survey.config';
export { providerSurveyConfig } from './configs/provider-survey.config';
export { auditLogsConfig } from './configs/audit-logs.config';
export { conceptConfig } from './configs/concept.config';
