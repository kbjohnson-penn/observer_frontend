/**
 * Table Registry
 *
 * Central registry for all OMOP table configurations.
 * Provides type-safe access to table configs and API mappings.
 */

import { OMOPTableName, SampleDataAPIResponse, OMOPTableData } from '@/interfaces/observer-omop';
import {
  TableConfig,
  TableCategory,
  ApiKeyMapping,
  DEFAULT_FEATURES,
  DEFAULT_PAGINATION,
  FeatureConfig,
  TableState,
} from './types';

// Import all table configs
import { personConfig } from './configs/person.config';
import { providerConfig } from './configs/provider.config';
import { visitOccurrenceConfig } from './configs/visit-occurrence.config';
import { noteConfig } from './configs/note.config';
import { conditionOccurrenceConfig } from './configs/condition-occurrence.config';
import { drugExposureConfig } from './configs/drug-exposure.config';
import { procedureOccurrenceConfig } from './configs/procedure-occurrence.config';
import { measurementConfig } from './configs/measurement.config';
import { observationConfig } from './configs/observation.config';
import { patientSurveyConfig } from './configs/patient-survey.config';
import { providerSurveyConfig } from './configs/provider-survey.config';
import { auditLogsConfig } from './configs/audit-logs.config';
import { conceptConfig } from './configs/concept.config';

/**
 * Table Registry Class
 *
 * Manages all table configurations and provides utilities for:
 * - Accessing individual table configs
 * - Getting tables by category
 * - Mapping API response keys to table names
 * - Creating initial table states
 */
class TableRegistry {
  private configs: Map<OMOPTableName, TableConfig> = new Map();

  /**
   * Register a table configuration
   */
  register<TData extends OMOPTableData>(config: TableConfig<TData>): void {
    this.configs.set(config.id, config as TableConfig);
  }

  /**
   * Get a table configuration by ID
   */
  get(tableId: OMOPTableName): TableConfig | undefined {
    return this.configs.get(tableId);
  }

  /**
   * Get a table configuration by ID (throws if not found)
   */
  getRequired(tableId: OMOPTableName): TableConfig {
    const config = this.configs.get(tableId);
    if (!config) {
      throw new Error(`Table config not found for: ${tableId}`);
    }
    return config;
  }

  /**
   * Get all registered table configurations
   */
  getAll(): TableConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Get all table IDs
   */
  getAllIds(): OMOPTableName[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Get tables by category
   */
  getByCategory(category: TableCategory): TableConfig[] {
    return this.getAll().filter((config) => config.display.category === category);
  }

  /**
   * Get API key mapping for all tables
   * Used to map API response keys to table names
   */
  getApiKeyMapping(): ApiKeyMapping {
    const mapping: Partial<ApiKeyMapping> = {};
    this.configs.forEach((config) => {
      mapping[config.id] = config.apiKey;
    });
    return mapping as ApiKeyMapping;
  }

  /**
   * Get table data from API response by table ID
   */
  getTableData<TData extends OMOPTableData>(
    tableId: OMOPTableName,
    apiResponse: SampleDataAPIResponse
  ): TData[] {
    const config = this.get(tableId);
    if (!config) {
      return [];
    }
    return (apiResponse[config.apiKey] || []) as TData[];
  }

  /**
   * Get display name for a table
   */
  getDisplayName(tableId: OMOPTableName): string {
    return this.get(tableId)?.display.name || tableId;
  }

  /**
   * Get color for a table
   */
  getColor(tableId: OMOPTableName): string {
    return this.get(tableId)?.display.color || 'gray';
  }

  /**
   * Get icon for a table
   */
  getIcon(tableId: OMOPTableName): TableConfig['display']['icon'] | null {
    return this.get(tableId)?.display.icon || null;
  }

  /**
   * Get features with defaults applied
   */
  getFeatures(tableId: OMOPTableName): Required<FeatureConfig> {
    const config = this.get(tableId);
    return {
      ...DEFAULT_FEATURES,
      ...config?.features,
    };
  }

  /**
   * Create initial table state from config
   */
  createInitialTableState(tableId: OMOPTableName): TableState {
    const config = this.get(tableId);
    if (!config) {
      return {
        columnVisibility: {},
        globalFilter: '',
        sorting: [],
        pagination: {
          pageIndex: 0,
          pageSize: DEFAULT_PAGINATION.defaultPageSize,
        },
      };
    }

    // Create visibility state: all columns visible by default, then apply defaultVisible
    const columnVisibility: Record<string, boolean> = {};

    // Default: all columns in defaultVisible are true, others could be false
    // For now, show all columns by default since we don't know all column names upfront
    // The hook will handle this based on actual data

    // Default sorting from config
    const sorting = (config.sorting.defaultSort || []).map((s) => ({
      id: s.column,
      desc: s.direction === 'desc',
    }));

    return {
      columnVisibility,
      globalFilter: '',
      sorting,
      pagination: {
        pageIndex: 0,
        pageSize: config.pagination.defaultPageSize,
      },
    };
  }

  /**
   * Create initial states for all tables
   */
  createAllInitialTableStates(): Record<OMOPTableName, TableState> {
    const states: Partial<Record<OMOPTableName, TableState>> = {};
    this.configs.forEach((_, tableId) => {
      states[tableId] = this.createInitialTableState(tableId);
    });
    return states as Record<OMOPTableName, TableState>;
  }

  /**
   * Get number of registered tables
   */
  get size(): number {
    return this.configs.size;
  }
}

// Create singleton instance
export const tableRegistry = new TableRegistry();

// Register all 13 OMOP tables
tableRegistry.register(personConfig);
tableRegistry.register(providerConfig);
tableRegistry.register(visitOccurrenceConfig);
tableRegistry.register(noteConfig);
tableRegistry.register(conditionOccurrenceConfig);
tableRegistry.register(drugExposureConfig);
tableRegistry.register(procedureOccurrenceConfig);
tableRegistry.register(measurementConfig);
tableRegistry.register(observationConfig);
tableRegistry.register(patientSurveyConfig);
tableRegistry.register(providerSurveyConfig);
tableRegistry.register(auditLogsConfig);
tableRegistry.register(conceptConfig);

export default tableRegistry;
