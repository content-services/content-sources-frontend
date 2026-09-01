import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import { STAGES } from '../constants';
import type { Vulnerability } from '../types';
import { getVulnerabilityColumnValue } from '../utils/vulnerabilityTableColumns';
import type { BeaconPdfColumn, BeaconPdfData } from './beaconPdf';
import { formatBeaconPdfGeneratedAt, shouldUseLandscapePdf } from './beaconPdf';

const COLUMN_PERCENT_WIDTH: Record<string, string> = {
  vulnerabilityId: '12%',
  component: '18%',
  lastUpdated: '10%',
  stage: '10%',
  severity: '8%',
  cvss: '5%',
  cvssVector: '16%',
  repository: '8%',
  batch: '10%',
  age: '10%',
  flags: '8%',
  title: '18%',
  customerPriority: '10%',
};

const DEFAULT_COLUMN_WIDTH = '10%';

function columnWidth(key: string): string {
  return COLUMN_PERCENT_WIDTH[key] ?? DEFAULT_COLUMN_WIDTH;
}

const colors = {
  text: '#151515',
  muted: '#6a6e73',
  red: '#c9190b',
  headerBg: '#f0f0f0',
  border: '#d2d2d2',
  stripeBg: '#fafafa',
  white: '#ffffff',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 28,
  },
  header: {
    position: 'absolute',
    top: 16,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: 600,
  },
  headerDate: {
    fontSize: 9,
    fontStyle: 'italic',
    color: colors.muted,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: colors.muted,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.red,
    marginBottom: 8,
  },
  meta: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    marginTop: 16,
    marginBottom: 28,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
  },
  statValueCritical: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.red,
  },
  statLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 28,
    marginBottom: 12,
  },
  pipeline: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 4,
  },
  pipelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stageCard: {
    flex: 1,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: '8 6',
  },
  stageLabel: {
    fontWeight: 700,
    fontSize: 10,
    marginBottom: 4,
  },
  stageCount: {
    fontSize: 20,
    fontWeight: 700,
  },
  pipelineArrow: {
    fontSize: 10,
    color: colors.muted,
    paddingHorizontal: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.headerBg,
  },
  tableHeaderCell: {
    fontWeight: 700,
    fontSize: 9,
    padding: '6 6 4 6',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableRowStripe: {
    flexDirection: 'row',
    backgroundColor: colors.stripeBg,
  },
  tableCell: {
    fontSize: 8,
    padding: '4 6',
  },
});

export function computeBeaconMeta(vulnerabilities: Vulnerability[]): BeaconPdfData['meta'] {
  const stageCounts: Record<string, number> = {};
  let criticalCount = 0;
  for (const v of vulnerabilities) {
    stageCounts[v.stage] = (stageCounts[v.stage] ?? 0) + 1;
    if (v.severity === 'Critical') criticalCount++;
  }
  return {
    count: vulnerabilities.length,
    criticalCount,
    stageCounts,
  };
}

type BeaconPdfDocumentProps = {
  data: BeaconPdfData;
  columns: BeaconPdfColumn[];
  customerId: string;
  generatedAt?: string;
};

function PageHeader({ generatedAt }: { generatedAt: string }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerBrand}>Lightwell</Text>
      <Text style={styles.headerDate}>Prepared: {generatedAt}</Text>
    </View>
  );
}

function PageFooter() {
  return (
    <Text
      style={styles.footer}
      fixed
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
    />
  );
}

function SummarySection({
  meta,
  customerId,
  generatedAt,
  stageCounts,
}: {
  meta: BeaconPdfData['meta'];
  customerId: string;
  generatedAt: string;
  stageCounts: Record<string, number>;
}) {
  return (
    <>
      <Text style={styles.title}>Lightwell Vulnerability Report</Text>
      <Text style={styles.meta}>
        Customer ID: {customerId} &middot; Generated: {generatedAt}
      </Text>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{meta.count}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValueCritical}>{meta.criticalCount}</Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>By Stage</Text>
      <View style={styles.pipeline}>
        {STAGES.map((stage, idx) => (
          <View key={stage} style={styles.pipelineItem}>
            <View style={styles.stageCard}>
              <Text style={styles.stageLabel}>{stage}</Text>
              <Text style={styles.stageCount}>{stageCounts[stage] ?? 0}</Text>
            </View>
            {idx < STAGES.length - 1 ? (
              <Text style={styles.pipelineArrow}>{'\u25B6'}</Text>
            ) : null}
          </View>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Vulnerabilities</Text>
    </>
  );
}

function VulnerabilityTable({
  vulnerabilities,
  columns,
}: {
  vulnerabilities: Vulnerability[];
  columns: BeaconPdfColumn[];
}) {
  return (
    <View>
      <View style={styles.tableHeaderRow} fixed>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[styles.tableHeaderCell, { width: columnWidth(col.key) }]}
          >
            {col.title}
          </Text>
        ))}
      </View>
      {vulnerabilities.map((vuln, idx) => (
        <View
          key={vuln.uuid}
          style={idx % 2 === 1 ? styles.tableRowStripe : styles.tableRow}
          wrap={false}
        >
          {columns.map((col) => (
            <Text
              key={col.key}
              style={[styles.tableCell, { width: columnWidth(col.key) }]}
            >
              {getVulnerabilityColumnValue(col.key, vuln)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function BeaconPdfDocument({
  data,
  columns,
  customerId,
  generatedAt = formatBeaconPdfGeneratedAt(),
}: BeaconPdfDocumentProps) {
  const landscape = shouldUseLandscapePdf(columns);
  const stageCounts = data.meta?.stageCounts ?? {};

  return (
    <Document>
      <Page
        size='A4'
        orientation={landscape ? 'landscape' : 'portrait'}
        style={styles.page}
      >
        <PageHeader generatedAt={generatedAt} />
        <SummarySection
          meta={data.meta}
          customerId={customerId}
          generatedAt={generatedAt}
          stageCounts={stageCounts}
        />
        <VulnerabilityTable
          vulnerabilities={data.vulnerabilities}
          columns={columns}
        />
        <PageFooter />
      </Page>
    </Document>
  );
}
