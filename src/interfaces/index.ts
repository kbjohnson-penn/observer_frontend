// Re-export all interfaces for easy importing
export * from './homepage';
export * from './dataset';
export * from './encounter';
export * from './patient';
export * from './department';
export * from './mmd';
export * from './research';
export * from './search';

// Explicit re-exports to avoid naming conflicts
export type {
  ProviderDataType,
  PublicProviderDataType,
  Provider as ProviderInterface,
} from './provider';

export type {
  Provider as OMOPProvider,
  Person,
  VisitOccurrence,
  Note,
  ConditionOccurrence,
  DrugExposure,
  ProcedureOccurrence,
  Measurement,
  Observation,
  PatientSurvey,
  ProviderSurvey,
  AuditLogs,
  Concept,
  OMOPTableName,
} from './observer-omop';
