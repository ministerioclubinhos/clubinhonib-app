import {
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { AUDIT_TABLE_MIN_WIDTH, OBSERVABILITY_AUDIT_MESSAGES, OBSERVABILITY_AUDIT_TEST_IDS } from '../constants';
import type { AuditRecordResponse } from '../types';
import {
  actionTypeLabel,
  describeActor,
  formatDateTime,
  formatDuration,
  formatHttp,
  outcomeColor,
  outcomeLabel,
  truncateText,
  valueOrPlaceholder,
} from '../utils';
import RecordCard from './RecordCard';
import TruncatedId from './TruncatedId';

interface AuditRecordsTableProps {
  items: AuditRecordResponse[];
  onCopy: (value: string) => void;
  /** Abre o modal de detalhes da linha. */
  onSelect: (item: AuditRecordResponse) => void;
}

const rowTestId = (item: AuditRecordResponse) => `${OBSERVABILITY_AUDIT_TEST_IDS.auditRow}-${item.eventId}`;
const rowLabel = (item: AuditRecordResponse) =>
  `${OBSERVABILITY_AUDIT_MESSAGES.detailsOpenHint}: ${formatDateTime(item.occurredAt)}`;

/** Eventos de auditoria; cards no celular, tabela de `sm` para cima. */
export default function AuditRecordsTable({ items, onCopy, onSelect }: AuditRecordsTableProps) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (mobile) {
    return (
      <Stack data-testid={OBSERVABILITY_AUDIT_TEST_IDS.auditTable} spacing={1} role="list" aria-label="Eventos de auditoria">
        {items.map((item) => (
          <RecordCard
            key={item.eventId}
            testId={rowTestId(item)}
            ariaLabel={rowLabel(item)}
            heading={formatDateTime(item.occurredAt)}
            chip={{ label: outcomeLabel(item.outcome), color: outcomeColor(item.outcome) }}
            title={truncateText(item.actionName, 72)}
            lines={[
              { label: 'Ator', value: describeActor(item.actorType, item.actorRole) },
              {
                label: 'Recurso',
                value: item.resourceType ? `${item.resourceType}${item.resourceId ? ` · ${item.resourceId}` : ''}` : valueOrPlaceholder(null),
                monospace: Boolean(item.resourceId),
              },
              { label: 'HTTP', value: `${formatHttp(item.httpMethod, item.statusCode)} · ${formatDuration(item.durationMs)}` },
            ]}
            footer={
              <>
                <TruncatedId value={item.requestId} kind="requisição" onCopy={onCopy} />
                <TruncatedId value={item.actorId} kind="ator" onCopy={onCopy} />
              </>
            }
            onSelect={() => onSelect(item)}
          />
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer data-testid={OBSERVABILITY_AUDIT_TEST_IDS.auditTable} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
      <Table size="small" stickyHeader sx={{ minWidth: AUDIT_TABLE_MIN_WIDTH }}>
        <caption style={{ captionSide: 'top', textAlign: 'left', padding: 0, height: 0, overflow: 'hidden' }}>
          Eventos de auditoria
        </caption>
        <TableHead>
          <TableRow>
            <TableCell scope="col">Data/hora</TableCell>
            <TableCell scope="col">Ator</TableCell>
            <TableCell scope="col">Ação</TableCell>
            <TableCell scope="col">Recurso</TableCell>
            <TableCell scope="col">Resultado</TableCell>
            <TableCell scope="col">HTTP</TableCell>
            <TableCell scope="col">Duração</TableCell>
            <TableCell scope="col">Requisição</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.eventId}
              data-testid={rowTestId(item)}
              hover
              tabIndex={0}
              role="button"
              aria-label={rowLabel(item)}
              onClick={() => onSelect(item)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(item);
                }
              }}
              sx={{ cursor: 'pointer', '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' } }}
            >
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <time dateTime={item.occurredAt}>{formatDateTime(item.occurredAt)}</time>
              </TableCell>
              <TableCell>
                <Typography variant="body2" component="span" display="block">
                  {describeActor(item.actorType, item.actorRole)}
                </Typography>
                <TruncatedId value={item.actorId} kind="ator" onCopy={onCopy} />
              </TableCell>
              <TableCell sx={{ minWidth: 240, maxWidth: 340 }}>
                <Tooltip title={item.actionName}>
                  <Typography variant="body2" component="span" fontFamily="monospace" sx={{ display: 'block', wordBreak: 'break-all' }}>
                    {truncateText(item.actionName, 72)}
                  </Typography>
                </Tooltip>
                <Typography variant="caption" color="text.secondary">
                  {actionTypeLabel(item.actionType)}
                  {item.jobName ? ` · ${item.jobName}` : ''}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" component="span" display="block">
                  {valueOrPlaceholder(item.resourceType)}
                </Typography>
                <TruncatedId value={item.resourceId} kind="recurso" onCopy={onCopy} />
              </TableCell>
              <TableCell>
                <Chip size="small" label={outcomeLabel(item.outcome)} color={outcomeColor(item.outcome)} />
                {item.errorCode && (
                  <Typography variant="caption" color="text.secondary" display="block" fontFamily="monospace">
                    {item.errorCode}
                  </Typography>
                )}
                {item.occurrenceCount > 1 && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {item.occurrenceCount} ocorrências
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {formatHttp(item.httpMethod, item.statusCode)}
                {item.routeTemplate && (
                  <Typography variant="caption" color="text.secondary" display="block" fontFamily="monospace">
                    {item.routeTemplate}
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDuration(item.durationMs)}</TableCell>
              <TableCell>
                <TruncatedId value={item.requestId} kind="requisição" onCopy={onCopy} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
