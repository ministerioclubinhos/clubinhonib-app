import { useCallback, useMemo, useState } from 'react';
import { Alert, Box, Snackbar, Tab, Tabs, Typography } from '@mui/material';

import BackHeader from '@/components/common/header/BackHeader';

import AuditRecordsTable from './components/AuditRecordsTable';
import ObservabilityRecordsTable from './components/ObservabilityRecordsTable';
import RecordDetailsDialog from './components/RecordDetailsDialog';
import { AuditRecordFilters, ObservabilityRecordFilters } from './components/RecordFilters';
import RecordsPagination from './components/RecordsPagination';
import RecordsTableShell from './components/RecordsTableShell';
import RecordsToolbar from './components/RecordsToolbar';
import { OBSERVABILITY_AUDIT_MESSAGES, OBSERVABILITY_AUDIT_TEST_IDS, RecordsTab } from './constants';
import { useAuditPanel, useObservabilityPanel } from './hooks';
import { RecordType } from './types';
import type { AuditRecordResponse, ObservabilityRecordResponse, SelectedRecord } from './types';
import { browserTimeZone } from './utils';

const tabPanelId = (tab: RecordsTab) => `observability-audit-panel-${tab}`;
const tabId = (tab: RecordsTab) => `observability-audit-tab-${tab}`;

/**
 * Uma rota, duas abas: registros técnicos e eventos de auditoria.
 *
 * Somente leitura e mobile first. Cada aba tem a própria toolbar de filtros,
 * paginação numerada com total, loading e erro; as duas consultas ficam
 * montadas o tempo todo, então trocar de aba não recarrega nada e a falha de
 * uma não apaga a outra. Clicar numa linha (ou num card, no celular) abre os
 * detalhes num modal.
 */
export default function ObservabilityAuditPage() {
  const timeZone = useMemo(() => browserTimeZone(), []);
  const [tab, setTab] = useState<RecordsTab>(RecordsTab.Observability);
  const [selected, setSelected] = useState<SelectedRecord | null>(null);
  const [notice, setNotice] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const observability = useObservabilityPanel();
  const audit = useAuditPanel();

  const copyId = useCallback((value: string) => {
    void navigator.clipboard
      .writeText(value)
      .then(() => setNotice({ message: OBSERVABILITY_AUDIT_MESSAGES.copied, severity: 'success' }))
      .catch(() => setNotice({ message: OBSERVABILITY_AUDIT_MESSAGES.copyFailed, severity: 'error' }));
  }, []);

  const selectObservability = useCallback(
    (item: ObservabilityRecordResponse) => setSelected({ kind: RecordType.Observability, item }),
    [],
  );
  const selectAudit = useCallback((item: AuditRecordResponse) => setSelected({ kind: RecordType.Audit, item }), []);
  const closeDetails = useCallback(() => setSelected(null), []);

  const announceDeleted = useCallback((count: number | null) => {
    if (count === null) return;
    setNotice({ message: OBSERVABILITY_AUDIT_MESSAGES.deleted(count), severity: 'success' });
  }, []);

  const deleteSelected = useCallback(
    async (record: SelectedRecord) => {
      const count =
        record.kind === RecordType.Observability
          ? await observability.removeOne(record.item)
          : await audit.removeOne(record.item);
      if (count !== null) {
        announceDeleted(count);
        setSelected(null);
      }
    },
    [observability, audit, announceDeleted],
  );

  const deleteObservabilityRange = useCallback(async () => {
    announceDeleted(await observability.removeRange());
  }, [observability, announceDeleted]);
  const deleteAuditRange = useCallback(async () => {
    announceDeleted(await audit.removeRange());
  }, [audit, announceDeleted]);

  return (
    <Box data-testid={OBSERVABILITY_AUDIT_TEST_IDS.page} sx={{ minWidth: 0, maxWidth: '100%', overflowX: 'hidden', px: { xs: 1, sm: 0 }, boxSizing: 'border-box' }}>
      <BackHeader title={OBSERVABILITY_AUDIT_MESSAGES.pageTitle} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {OBSERVABILITY_AUDIT_MESSAGES.pageDescription}
      </Typography>

      <Tabs
        data-testid={OBSERVABILITY_AUDIT_TEST_IDS.tabs}
        value={tab}
        onChange={(_event, next: RecordsTab) => setTab(next)}
        aria-label="Fluxos de registros"
        variant="fullWidth"
        sx={{ mb: 2, minHeight: 48 }}
      >
        <Tab
          data-testid={OBSERVABILITY_AUDIT_TEST_IDS.tabObservability}
          id={tabId(RecordsTab.Observability)}
          aria-controls={tabPanelId(RecordsTab.Observability)}
          value={RecordsTab.Observability}
          label={OBSERVABILITY_AUDIT_MESSAGES.observabilityTitle}
          sx={{ minHeight: 48 }}
        />
        <Tab
          data-testid={OBSERVABILITY_AUDIT_TEST_IDS.tabAudit}
          id={tabId(RecordsTab.Audit)}
          aria-controls={tabPanelId(RecordsTab.Audit)}
          value={RecordsTab.Audit}
          label={OBSERVABILITY_AUDIT_MESSAGES.auditTitle}
          sx={{ minHeight: 48 }}
        />
      </Tabs>

      <Box
        role="tabpanel"
        id={tabPanelId(RecordsTab.Observability)}
        aria-labelledby={tabId(RecordsTab.Observability)}
        hidden={tab !== RecordsTab.Observability}
        sx={{ minWidth: 0 }}
      >
        <RecordsTableShell
          title={OBSERVABILITY_AUDIT_MESSAGES.observabilityTitle}
          description={OBSERVABILITY_AUDIT_MESSAGES.observabilityDescription}
          rules={OBSERVABILITY_AUDIT_MESSAGES.observabilityRules}
          total={observability.total}
          testIds={{
            panel: OBSERVABILITY_AUDIT_TEST_IDS.observabilityPanel,
            loading: OBSERVABILITY_AUDIT_TEST_IDS.observabilityLoading,
            empty: OBSERVABILITY_AUDIT_TEST_IDS.observabilityEmpty,
            error: OBSERVABILITY_AUDIT_TEST_IDS.observabilityError,
            unavailable: OBSERVABILITY_AUDIT_TEST_IDS.observabilityUnavailable,
          }}
          loading={observability.loading}
          initialLoading={observability.initialLoading}
          error={observability.error}
          actionError={observability.actionError}
          onDismissActionError={() => observability.setActionError('')}
          unavailable={observability.unavailable}
          isEmpty={observability.items.length === 0}
          onRetry={observability.retry}
          toolbar={
            <RecordsToolbar
              idPrefix="observability"
              testIds={{
                toolbar: OBSERVABILITY_AUDIT_TEST_IDS.observabilityToolbar,
                refresh: OBSERVABILITY_AUDIT_TEST_IDS.observabilityRefresh,
                periodError: OBSERVABILITY_AUDIT_TEST_IDS.observabilityPeriodError,
                deleteRange: OBSERVABILITY_AUDIT_TEST_IDS.observabilityDeleteRange,
              }}
              base={observability.base}
              period={observability.period}
              timeZone={timeZone}
              refreshing={observability.loading}
              activeFilters={observability.activeFilters}
              onBaseChange={observability.setBase}
              onRefresh={observability.refresh}
              onClear={observability.clearFilters}
              onDeleteRange={deleteObservabilityRange}
              deleting={observability.deleting}
              canDelete={!observability.unavailable}
            >
              <ObservabilityRecordFilters filters={observability.specific} onChange={observability.setSpecific} />
            </RecordsToolbar>
          }
          pagination={
            <RecordsPagination
              testId={OBSERVABILITY_AUDIT_TEST_IDS.observabilityPagination}
              label="Paginação de observabilidade"
              page={observability.page}
              pageCount={observability.pageCount}
              total={observability.total}
              limit={observability.base.limit}
              appliedLimit={observability.appliedLimit}
              loading={observability.loading}
              onPageChange={observability.setPage}
              onLimitChange={observability.setLimit}
            />
          }
        >
          <ObservabilityRecordsTable items={observability.items} onCopy={copyId} onSelect={selectObservability} />
        </RecordsTableShell>
      </Box>

      <Box
        role="tabpanel"
        id={tabPanelId(RecordsTab.Audit)}
        aria-labelledby={tabId(RecordsTab.Audit)}
        hidden={tab !== RecordsTab.Audit}
        sx={{ minWidth: 0 }}
      >
        <RecordsTableShell
          title={OBSERVABILITY_AUDIT_MESSAGES.auditTitle}
          description={OBSERVABILITY_AUDIT_MESSAGES.auditDescription}
          rules={OBSERVABILITY_AUDIT_MESSAGES.auditRules}
          total={audit.total}
          testIds={{
            panel: OBSERVABILITY_AUDIT_TEST_IDS.auditPanel,
            loading: OBSERVABILITY_AUDIT_TEST_IDS.auditLoading,
            empty: OBSERVABILITY_AUDIT_TEST_IDS.auditEmpty,
            error: OBSERVABILITY_AUDIT_TEST_IDS.auditError,
            unavailable: OBSERVABILITY_AUDIT_TEST_IDS.auditUnavailable,
          }}
          loading={audit.loading}
          initialLoading={audit.initialLoading}
          error={audit.error}
          actionError={audit.actionError}
          onDismissActionError={() => audit.setActionError('')}
          unavailable={audit.unavailable}
          isEmpty={audit.items.length === 0}
          onRetry={audit.retry}
          toolbar={
            <RecordsToolbar
              idPrefix="audit"
              testIds={{
                toolbar: OBSERVABILITY_AUDIT_TEST_IDS.auditToolbar,
                refresh: OBSERVABILITY_AUDIT_TEST_IDS.auditRefresh,
                periodError: OBSERVABILITY_AUDIT_TEST_IDS.auditPeriodError,
                deleteRange: OBSERVABILITY_AUDIT_TEST_IDS.auditDeleteRange,
              }}
              base={audit.base}
              period={audit.period}
              timeZone={timeZone}
              refreshing={audit.loading}
              activeFilters={audit.activeFilters}
              onBaseChange={audit.setBase}
              onRefresh={audit.refresh}
              onClear={audit.clearFilters}
              onDeleteRange={deleteAuditRange}
              deleting={audit.deleting}
              canDelete={!audit.unavailable}
            >
              <AuditRecordFilters filters={audit.specific} onChange={audit.setSpecific} />
            </RecordsToolbar>
          }
          pagination={
            <RecordsPagination
              testId={OBSERVABILITY_AUDIT_TEST_IDS.auditPagination}
              label="Paginação de auditoria"
              page={audit.page}
              pageCount={audit.pageCount}
              total={audit.total}
              limit={audit.base.limit}
              appliedLimit={audit.appliedLimit}
              loading={audit.loading}
              onPageChange={audit.setPage}
              onLimitChange={audit.setLimit}
            />
          }
        >
          <AuditRecordsTable items={audit.items} onCopy={copyId} onSelect={selectAudit} />
        </RecordsTableShell>
      </Box>

      <RecordDetailsDialog
        selected={selected}
        onClose={closeDetails}
        onCopy={copyId}
        onDelete={deleteSelected}
        deleting={observability.deleting || audit.deleting}
      />

      <Snackbar
        open={notice !== null}
        autoHideDuration={3000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notice?.severity ?? 'success'} onClose={() => setNotice(null)} variant="filled">
          {notice?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
