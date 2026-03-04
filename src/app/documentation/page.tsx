'use client';

import {
  Box,
  Badge,
  Heading,
  HStack,
  Link as ChakraLink,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaClipboardList, FaDownload, FaInfoCircle, FaSearch, FaVideo } from 'react-icons/fa';
import {
  CORE_CLINICAL_TABLES,
  MULTIMEDIA_TABLE,
  SURVEY_TABLES,
  AUDIT_VOCABULARY_TABLES,
  DOCUMENTATION_NOTES,
  TableDefinition,
} from '@/constants/dataset-documentation.constants';

// --- Type badge color mapping ---
const TYPE_COLORS: Record<string, string> = {
  INTEGER: 'blue',
  TEXT: 'green',
  REAL: 'orange',
};

// --- Reusable Components ---

function TableSchema({ table }: { table: TableDefinition }) {
  return (
    <Box
      bg="white"
      border="1px"
      borderColor="gray.200"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
    >
      <Box px={6} py={4} borderBottom="1px" borderColor="gray.100">
        <Heading as="h4" size="md" color="blue.700" fontFamily="mono" fontWeight="bold">
          {table.name}
        </Heading>
        <Text fontSize="sm" color="gray.600" mt={1}>
          {table.description}
        </Text>
      </Box>

      {table.columns.length > 0 ? (
        <Box overflowX="auto">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="gray.50">
                <Table.ColumnHeader pl={6} fontWeight="semibold" color="gray.700" minW="180px">
                  Column
                </Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="semibold" color="gray.700" minW="100px">
                  Type
                </Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="semibold" color="gray.700">
                  Description
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {table.columns.map((col) => (
                <Table.Row key={col.name} _hover={{ bg: 'gray.50' }}>
                  <Table.Cell pl={6}>
                    <Text fontFamily="mono" fontSize="sm" color="blue.700" fontWeight="medium">
                      {col.name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      size="sm"
                      colorPalette={TYPE_COLORS[col.type] || 'gray'}
                      variant="subtle"
                    >
                      {col.type}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm" color="gray.600">
                      {col.description}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      ) : (
        <Box px={6} py={5} bg="blue.50">
          <HStack gap={2} align="start">
            <Box color="blue.500" mt={0.5}>
              <FaInfoCircle />
            </Box>
            <Text fontSize="sm" color="blue.700">
              Survey columns contain numerous coded response fields. Refer to the PDF documentation
              for full column definitions.
            </Text>
          </HStack>
        </Box>
      )}
    </Box>
  );
}

function TableGroup({
  id,
  title,
  icon,
  tables,
  subtitle,
}: {
  id: string;
  title: string;
  icon?: React.ReactNode;
  tables: TableDefinition[];
  subtitle?: string;
}) {
  return (
    <Box id={id} mb={16} py={12} bg="white" borderRadius="xl" border="1px" borderColor="gray.200">
      <HStack justify="center" gap={3} mb={2}>
        {icon && <Box color="blue.600">{icon}</Box>}
        <Heading size="2xl" color="blue.700" textAlign="center" fontWeight="bold">
          {title}
        </Heading>
        <Badge colorPalette="blue" variant="subtle" fontSize="sm" px={2}>
          {tables.length} {tables.length === 1 ? 'table' : 'tables'}
        </Badge>
      </HStack>

      {subtitle && (
        <Text color="gray.600" fontSize="lg" textAlign="center" maxW="5xl" mx="auto" mb={8}>
          {subtitle}
        </Text>
      )}

      <VStack gap={6} align="stretch" maxW="5xl" mx="auto" px={8} mt={subtitle ? 0 : 8}>
        {tables.map((table) => (
          <TableSchema key={table.name} table={table} />
        ))}
      </VStack>
    </Box>
  );
}

// --- Main Page ---

export default function DatasetDocumentationPage() {
  return (
    <Box maxW="6xl" mx="auto" py={8} px={{ base: 4, md: 6 }}>
      {/* Header */}
      <Box textAlign="center" mb={12}>
        <Heading
          as="h1"
          fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
          color="blue.700"
          mb={4}
          fontWeight="bold"
          lineHeight="shorter"
        >
          Dataset Documentation
        </Heading>
        <Text fontSize="lg" color="gray.600" maxW="4xl" mx="auto" mb={8} lineHeight="tall">
          Complete schema reference for the Observer Repository Dataset, covering all 13
          OMOP-inspired tables with column definitions. For an overview of the dataset, see the{' '}
          <Link href="/dataset" style={{ color: 'var(--chakra-colors-blue-600)' }}>
            Dataset page
          </Link>
          .
        </Text>

        <ChakraLink
          href="/docs/Observer%20Dataset%20Documentation.pdf"
          download
          _hover={{ textDecoration: 'none' }}
        >
          <HStack
            display="inline-flex"
            bg="blue.500"
            color="white"
            px={6}
            py={3}
            borderRadius="lg"
            _hover={{ bg: 'blue.600' }}
            transition="all 0.2s"
            cursor="pointer"
            gap={2}
          >
            <FaDownload />
            <Text fontWeight="medium">Download PDF Documentation</Text>
          </HStack>
        </ChakraLink>
      </Box>

      {/* Core Clinical Tables */}
      <TableGroup
        id="core-tables"
        title="Core Clinical Tables"
        icon={<FaClipboardList />}
        tables={CORE_CLINICAL_TABLES}
        subtitle="The foundational tables capturing patient demographics, visits, diagnoses, medications, procedures, and measurements."
      />

      {/* Multimedia Reference Table */}
      <TableGroup
        id="multimedia-table"
        title="Multimedia Reference"
        icon={<FaVideo />}
        tables={[MULTIMEDIA_TABLE]}
        subtitle="File references to multimedia and derived artifacts associated with visits."
      />

      {/* Survey Tables */}
      <TableGroup
        id="survey-tables"
        title="Survey Tables"
        icon={<FaClipboardList />}
        tables={SURVEY_TABLES}
        subtitle="Patient-reported outcomes and provider perspectives on visit quality and communication."
      />

      {/* Audit and Vocabulary Tables */}
      <TableGroup
        id="audit-vocabulary"
        title="Audit & Vocabulary Tables"
        icon={<FaSearch />}
        tables={AUDIT_VOCABULARY_TABLES}
        subtitle="Access tracking and standardized clinical concept definitions."
      />

      {/* Notes */}
      <Box
        id="notes"
        mb={12}
        py={8}
        px={8}
        bg="blue.50"
        borderRadius="xl"
        border="1px"
        borderColor="blue.200"
      >
        <HStack justify="center" gap={3} mb={6}>
          <Box color="blue.600">
            <FaInfoCircle />
          </Box>
          <Heading size="xl" color="blue.700" textAlign="center" fontWeight="bold">
            Important Notes
          </Heading>
        </HStack>

        <VStack gap={3} maxW="4xl" mx="auto">
          {DOCUMENTATION_NOTES.map((note, i) => (
            <HStack
              key={i}
              gap={3}
              bg="white"
              px={5}
              py={3}
              borderRadius="lg"
              w="100%"
              border="1px"
              borderColor="blue.100"
            >
              <Badge colorPalette="blue" variant="solid" size="sm" borderRadius="full" px={2}>
                {i + 1}
              </Badge>
              <Text color="gray.700" fontSize="sm" lineHeight="tall">
                {note}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}
