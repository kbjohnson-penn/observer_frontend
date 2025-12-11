/**
 * CSV Export Utility
 *
 * Handles exporting table data to CSV format with proper escaping
 * Supports exporting single table or all tables as a ZIP
 */

import { OMOPTableData, OMOPTableName } from '@/interfaces/observer-omop';
import { expandDemographic } from './utils';

/**
 * Escapes a value for CSV format
 * - Wraps in quotes if contains comma, quote, or newline
 * - Doubles any quotes inside
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // If contains special characters, wrap in quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Expands demographic codes for export (same logic as display)
 */
const DEMOGRAPHIC_COLUMNS: Record<string, 'gender' | 'race' | 'ethnicity'> = {
  gender_source_value: 'gender',
  race_source_value: 'race',
  ethnicity_source_value: 'ethnicity',
};

function formatValueForExport(value: unknown, columnId: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  const demographicType = DEMOGRAPHIC_COLUMNS[columnId];
  if (demographicType) {
    return expandDemographic(String(value), demographicType);
  }

  return String(value);
}

interface ExportOptions {
  /** Filename without extension */
  filename: string;
  /** Column labels for documentation generation only (not used in CSV headers) */
  columnLabels?: Record<string, string>;
}

/**
 * Generates CSV content from table data
 */
function generateCSVContent<T extends OMOPTableData>(
  data: T[],
  options: Omit<ExportOptions, 'filename'>
): string {
  // Handle empty data - try to get headers from columnLabels if available
  if (!data || data.length === 0) {
    if (options.columnLabels && Object.keys(options.columnLabels).length > 0) {
      // Return just headers for empty tables
      const headers = Object.keys(options.columnLabels).map((col) => escapeCSVValue(col));
      return headers.join(',');
    }
    return '';
  }

  // Get ALL columns from the data
  const sampleRow = data[0];
  const columnsToExport = Object.keys(sampleRow);

  // Build header row with field names (not display labels)
  // This maintains data integrity and compatibility with analysis tools
  const headers = columnsToExport.map((col) => escapeCSVValue(col));

  // Build data rows
  const rows = data.map((row) => {
    return columnsToExport
      .map((col) => {
        const value = row[col as keyof T];
        const formatted = formatValueForExport(value, col);
        return escapeCSVValue(formatted);
      })
      .join(',');
  });

  // Combine into CSV content
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Exports a single table to CSV and triggers download
 */
export function exportTableToCSV<T extends OMOPTableData>(data: T[], options: ExportOptions): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const { filename } = options;
  const csvContent = generateCSVContent(data, options);

  if (!csvContent) {
    console.warn('Generated empty CSV content');
    return;
  }

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Table data with metadata for multi-table export
 */
export interface TableExportData {
  tableName: OMOPTableName;
  displayName: string;
  data: OMOPTableData[];
  columnLabels?: Record<string, string>;
}

/**
 * Exports multiple tables as a ZIP file
 * Uses JSZip library which should be installed: npm install jszip
 */
export async function exportAllTablesToZip(
  tables: TableExportData[],
  zipFilename: string = 'observer-data-export'
): Promise<void> {
  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add each table as a CSV file to the ZIP
    for (const table of tables) {
      // Don't skip tables - include even if empty (headers only)
      const csvContent = generateCSVContent(table.data || [], {
        columnLabels: table.columnLabels,
      });

      if (csvContent) {
        const filename = `${table.tableName.toLowerCase()}.csv`;
        zip.file(filename, csvContent);
      }
    }

    // Generate ZIP blob and trigger download
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${zipFilename}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting tables to ZIP:', error);
    throw new Error('Failed to export tables. Please try again.');
  }
}

/**
 * Documentation metadata for a table export
 */
export interface TableDocumentation {
  tableName: OMOPTableName;
  displayName: string;
  description: string;
  category: string;
  columns: ColumnDocumentation[];
  relationships?: RelationshipDocumentation[];
  recordCount: number;
  exportDate: string;
}

export interface ColumnDocumentation {
  fieldName: string;
  displayName: string;
  description: string;
  dataType?: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export interface RelationshipDocumentation {
  field: string;
  referencesTable: string;
  referencesField: string;
  relationshipType: 'one-to-many' | 'many-to-one' | 'one-to-one';
}

/**
 * Generates README.txt content for export documentation
 */
function generateReadmeContent(
  tables: TableDocumentation[],
  exportType: 'single' | 'multiple'
): string {
  const timestamp = new Date().toISOString();
  const lines: string[] = [];

  lines.push('='.repeat(80));
  lines.push('OBSERVER HEALTHCARE DATA EXPORT');
  lines.push('='.repeat(80));
  lines.push('');
  lines.push(`Export Date: ${timestamp}`);
  lines.push(`Export Type: ${exportType === 'single' ? 'Single Table' : 'Multiple Tables'}`);
  lines.push(`Number of Tables: ${tables.length}`);
  lines.push('');
  lines.push('CONTENTS');
  lines.push('-'.repeat(80));
  lines.push('');

  if (exportType === 'single') {
    const table = tables[0];
    lines.push(`1. ${table.tableName.toLowerCase()}.csv - ${table.displayName}`);
    lines.push(`   ${table.description}`);
    lines.push(`   Records: ${table.recordCount}`);
    lines.push('');
    lines.push(`2. data-dictionary.csv - Column Descriptions`);
    lines.push(`   Detailed information about all ${table.columns.length} columns`);
    lines.push('');
  } else {
    tables.forEach((table, index) => {
      lines.push(`${index + 1}. ${table.tableName.toLowerCase()}.csv - ${table.displayName}`);
      lines.push(`   ${table.description}`);
      lines.push(`   Category: ${table.category}`);
      lines.push(`   Records: ${table.recordCount}`);
      lines.push('');
    });
    lines.push(`${tables.length + 1}. data-dictionary.csv - Column Descriptions`);
    lines.push(`   Comprehensive data dictionary for all tables`);
    lines.push('');
    lines.push(`${tables.length + 2}. table-metadata.csv - Table Information`);
    lines.push(`   Summary of all exported tables`);
    lines.push('');
  }

  lines.push('DATA FORMAT');
  lines.push('-'.repeat(80));
  lines.push('');
  lines.push('- All data files are in CSV (Comma-Separated Values) format');
  lines.push('- Character encoding: UTF-8');
  lines.push('- Date format: ISO 8601 (YYYY-MM-DD)');
  lines.push('- Time format: HH:MM:SS');
  lines.push('- Missing values: Empty strings or null values');
  lines.push('- Boolean values: true/false (lowercase)');
  lines.push('');
  lines.push('DATA MODEL');
  lines.push('-'.repeat(80));
  lines.push('');
  lines.push('This export follows the OMOP (Observational Medical Outcomes Partnership)');
  lines.push('Common Data Model standard for healthcare data interoperability.');
  lines.push('');
  lines.push('For more information about OMOP CDM:');
  lines.push('https://www.ohdsi.org/data-standardization/');
  lines.push('');
  lines.push('USAGE NOTES');
  lines.push('-'.repeat(80));
  lines.push('');
  lines.push('1. Review data-dictionary.csv to understand column definitions');
  lines.push('2. Refer to OMOP CDM documentation for detailed specifications');
  lines.push('');
  lines.push('PRIVACY & COMPLIANCE');
  lines.push('-'.repeat(80));
  lines.push('');
  lines.push('- This export may contain Protected Health Information (PHI)');
  lines.push('- Handle in accordance with HIPAA and institutional policies');
  lines.push('- Do not share without proper authorization');
  lines.push('- Store securely and dispose of properly when no longer needed');
  lines.push('');
  lines.push('='.repeat(80));

  return lines.join('\n');
}

/**
 * Generates data dictionary CSV content
 */
function generateDataDictionaryCSV(tables: TableDocumentation[]): string {
  const headers = [
    'Table Name',
    'Table Display Name',
    'Column Name',
    'Display Name',
    'Description',
    'Data Type',
    'Primary Key',
    'Foreign Key',
  ];

  const rows: string[] = [headers.map(escapeCSVValue).join(',')];

  for (const table of tables) {
    for (const column of table.columns) {
      const row = [
        table.tableName,
        table.displayName,
        column.fieldName,
        column.displayName,
        column.description || '',
        column.dataType || 'VARCHAR',
        column.isPrimaryKey ? 'Yes' : 'No',
        column.isForeignKey ? 'Yes' : 'No',
      ];
      rows.push(row.map(escapeCSVValue).join(','));
    }
  }

  return rows.join('\n');
}

/**
 * Generates table metadata CSV for multi-table exports
 */
function generateTableMetadataCSV(tables: TableDocumentation[]): string {
  const headers = [
    'Table Name',
    'Display Name',
    'Description',
    'Category',
    'Column Count',
    'Record Count',
    'Has Relationships',
  ];

  const rows: string[] = [headers.map(escapeCSVValue).join(',')];

  for (const table of tables) {
    const row = [
      table.tableName,
      table.displayName,
      table.description,
      table.category,
      table.columns.length.toString(),
      table.recordCount.toString(),
      table.relationships && table.relationships.length > 0 ? 'Yes' : 'No',
    ];
    rows.push(row.map(escapeCSVValue).join(','));
  }

  return rows.join('\n');
}

/**
 * Infers data type from sample data
 */
function inferDataType(data: OMOPTableData[], fieldName: string): string {
  if (data.length === 0) {
    return 'VARCHAR';
  }

  const sampleValue: unknown = data[0][fieldName as keyof OMOPTableData];

  // Handle null/undefined
  if (sampleValue === null || sampleValue === undefined) {
    return 'VARCHAR';
  }

  if (typeof sampleValue === 'number') {
    return Number.isInteger(sampleValue) ? 'INTEGER' : 'DECIMAL';
  }
  if (typeof sampleValue === 'boolean') {
    return 'BOOLEAN';
  }
  if (sampleValue instanceof Date) {
    return 'DATETIME';
  }
  if (typeof sampleValue === 'string') {
    // Check if it looks like a date
    if (/^\d{4}-\d{2}-\d{2}/.test(sampleValue)) {
      return sampleValue.includes('T') ? 'DATETIME' : 'DATE';
    }
    // Check if it looks like a time
    if (/^\d{2}:\d{2}:\d{2}/.test(sampleValue)) {
      return 'TIME';
    }
  }

  return 'VARCHAR';
}

/**
 * Builds table documentation from table config and data
 */
export function buildTableDocumentation(
  tableId: OMOPTableName,
  tableConfig: any,
  data: OMOPTableData[]
): TableDocumentation {
  const columns: ColumnDocumentation[] = [];
  // Always use all columns from actual data
  const allDataColumns = data.length > 0 ? Object.keys(data[0]) : [];
  const columnsToDocument =
    allDataColumns.length > 0
      ? allDataColumns
      : Object.keys(tableConfig.columns?.columnLabels || {});

  for (const fieldName of columnsToDocument) {
    const labelDef = tableConfig.columns?.columnLabels?.[fieldName];
    const isPK = fieldName === 'id';
    const isForeignKey = tableConfig.relationships?.some((rel: any) => rel.field === fieldName);

    columns.push({
      fieldName,
      displayName: labelDef?.label || fieldName.replace(/_/g, ' '),
      description: labelDef?.description || '',
      dataType: inferDataType(data, fieldName),
      isPrimaryKey: isPK,
      isForeignKey: isForeignKey,
    });
  }

  const relationships: RelationshipDocumentation[] | undefined = tableConfig.relationships?.map(
    (rel: any) => ({
      field: rel.field,
      referencesTable: rel.referencesTable,
      referencesField: rel.referencesField,
      relationshipType: 'many-to-one' as const,
    })
  );

  return {
    tableName: tableId,
    displayName: tableConfig.display.name,
    description: tableConfig.display.description,
    category: tableConfig.display.category,
    columns,
    relationships,
    recordCount: data.length,
    exportDate: new Date().toISOString(),
  };
}

/**
 * Exports a single table with documentation as ZIP
 */
export async function exportTableWithDocumentation<T extends OMOPTableData>(
  data: T[],
  options: ExportOptions,
  documentation: TableDocumentation
): Promise<void> {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add main data CSV
    const csvContent = generateCSVContent(data, options);
    if (csvContent) {
      zip.file(`${options.filename}.csv`, csvContent);
    }

    // Add documentation files
    const readmeContent = generateReadmeContent([documentation], 'single');
    zip.file('README.txt', readmeContent);

    const dataDictionary = generateDataDictionaryCSV([documentation]);
    zip.file('data-dictionary.csv', dataDictionary);

    // Generate and download ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${options.filename}-with-docs.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting table with documentation:', error);
    throw new Error('Failed to export table with documentation. Please try again.');
  }
}

/**
 * Exports multiple tables with documentation as ZIP
 */
export async function exportAllTablesWithDocumentation(
  tables: TableExportData[],
  documentations: TableDocumentation[],
  zipFilename: string = 'observer-data-export'
): Promise<void> {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Create data directory for CSV files
    const dataFolder = zip.folder('data');
    if (!dataFolder) {
      throw new Error('Failed to create data folder');
    }

    // Add each table CSV to data folder
    for (const table of tables) {
      // Don't skip tables - include even if empty (headers only)
      const csvContent = generateCSVContent(table.data || [], {
        columnLabels: table.columnLabels,
      });

      if (csvContent) {
        dataFolder.file(`${table.tableName.toLowerCase()}.csv`, csvContent);
      }
    }

    // Add documentation files to root
    const readmeContent = generateReadmeContent(documentations, 'multiple');
    zip.file('README.txt', readmeContent);

    const dataDictionary = generateDataDictionaryCSV(documentations);
    zip.file('data-dictionary.csv', dataDictionary);

    const tableMetadata = generateTableMetadataCSV(documentations);
    zip.file('table-metadata.csv', tableMetadata);

    // Generate and download ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${zipFilename}-with-docs.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting tables with documentation:', error);
    throw new Error('Failed to export tables with documentation. Please try again.');
  }
}
