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

import { OBSERVABILITY_AUDIT_MESSAGES, OBSERVABILITY_AUDIT_TEST_IDS, OBSERVABILITY_TABLE_MIN_WIDTH } from '../constants';
import type { ObservabilityRecordResponse } from '../types';
import {
  formatDateTime,
  formatHttp,
  levelColor,
  levelLabel,
  sourceTypeLabel,
  truncateText,
  valueOrPlaceholder,
} from '../utils';
import RecordCard from './RecordCard';
import TruncatedId from './TruncatedId';

interface ObservabilityRecordsTableProps {
  items: ObservabilityRecordResponse[];
  onCopy: (value: string) => void;
  /** Abre o modal de detalhes da linha. */
  onSelect: (item: ObservabilityRecordResponse) => void;
}

const rowTestId = (item: ObservabilityRecordResponse) =>
  `${OBSERVABILITY_AUDIT_TEST_IDS.observabilityRow}-${item.eventId}`;
const rowLabel = (item: ObservabilityRecordResponse) =>
  `${OBSERVABILITY_AUDIT_MESSAGES.detailsOpenHint}: ${formatDateTime(item.occurredAt)}`;

/**
 * Registros técnicos. Conhece só o próprio DTO: nada de URL, autorização ou
 * storage. No celular vira uma lista de cards; de `sm` para cima, tabela com
 * rolagem horizontal contida no contêiner.
 */
export default function ObservabilityRecordsTable({ items, onCopy, onSelect }: ObservabilityRecordsTableProps) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (mobile) {
    return (
      <Stack data-testid={OBSERVABILITY_AUDIT_TEST_IDS.observabilityTable} spacing={1} role="list" aria-label="Registros técnicos de observabilidade">
        {items.map((item) => (
          <RecordCard
            key={item.eventId}
            testId={rowTestId(item)}
            ariaLabel={rowLabel(item)}
            heading={formatDateTime(item.occurredAt)}
            chip={{ label: levelLabel(item.level), color: levelColor(item.level) }}
            title={truncateText(item.message, 120)}
            lines={[
              { label: 'Erro', value: valueOrPlaceholder(item.errorCode), monospace: true },
              { label: 'Origem', value: `${valueOrPlaceholder(item.context)} · ${sourceTypeLabel(item.sourceType)}` },
              { label: 'HTTP', value: formatHttp(item.httpMethod, item.statusCode) },
            ]}
            footer={<TruncatedId value={item.requestId} kind="requisição" onCopy={onCopy} />}
            onSelect={() => onSelect(item)}
          />
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer data-testid={OBSERVABILITY_AUDIT_TEST_IDS.observabilityTable} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
      <Table size="small" stickyHeader sx={{ minWidth: OBSERVABILITY_TABLE_MIN_WIDTH }}>
        <caption style={{ captionSide: 'top', textAlign: 'left', padding: 0, height: 0, overflow: 'hidden' }}>
          Registros técnicos de observabilidade
        </caption>
        <TableHead>
          <TableRow>
            <TableCell scope="col">Data/hora</TableCell>
            <TableCell scope="col">Nível</TableCell>
            <TableCell scope="col">Origem</TableCell>
            <TableCell scope="col">Operação</TableCell>
            <TableCell scope="col">Erro</TableCell>
            <TableCell scope="col">Mensagem</TableCell>
            <TableCell scope="col">Requisição</TableCell>
            <TableCell scope="col">HTTP</TableCell>
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
                <Chip size="small" label={levelLabel(item.level)} color={levelColor(item.level)} />
              </TableCell>
              <TableCell>
                <Typography variant="body2" component="span" display="block">
                  {valueOrPlaceholder(item.context)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {sourceTypeLabel(item.sourceType)} · {valueOrPlaceholder(item.moduleName)}
                </Typography>
              </TableCell>
              <TableCell>{valueOrPlaceholder(item.operation ?? item.jobName)}</TableCell>
              <TableCell>
                <Typography variant="body2" component="span" display="block" fontFamily="monospace">
                  {valueOrPlaceholder(item.errorCode)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {valueOrPlaceholder(item.errorName)}
                </Typography>
              </TableCell>
              <TableCell sx={{ maxWidth: 360 }}>
                <Tooltip title={item.errorMessage ?? item.message}>
                  <Typography variant="body2" component="span" sx={{ display: 'block', wordBreak: 'break-word' }}>
                    {truncateText(item.message)}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <TruncatedId value={item.requestId} kind="requisição" onCopy={onCopy} />
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {formatHttp(item.httpMethod, item.statusCode)}
                {item.routeTemplate && (
                  <Typography variant="caption" color="text.secondary" display="block" fontFamily="monospace">
                    {item.routeTemplate}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
