import React, { memo, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  LinearProgress,
  Skeleton,
  useTheme,
  alpha,
  Checkbox,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Badge,
} from '@mui/material';
import {
  Search,
  Clear,
  FilterList,
  Download,
  ViewColumn,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  CheckCircle,
  Cancel,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { visuallyHidden } from '@mui/utils';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  sticky?: boolean;
  format?: (value: any, row: T) => React.ReactNode;
  renderCell?: (row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  getValue?: (row: T) => any;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  getRowId: (row: T) => string;
  title?: string;
  subtitle?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  sorting?: {
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
    onSort: (column: string, order: 'ASC' | 'DESC') => void;
  };
  selection?: {
    selected: string[];
    onSelect: (ids: string[]) => void;
    onSelectAll: (selected: boolean) => void;
  };
  onRowClick?: (row: T) => void;
  onRefresh?: () => void;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  exportable?: boolean;
  onExport?: (format: 'csv' | 'json') => void;
  actions?: React.ReactNode;
  rowActions?: (row: T) => React.ReactNode;
  stickyHeader?: boolean;
  dense?: boolean;
  striped?: boolean;
  hover?: boolean;
  maxHeight?: number | string;
  showRowNumber?: boolean;
  mobileCardRender?: (row: T, index: number) => React.ReactNode;
}

const MotionTableRow = motion.create(TableRow);

function DataTableComponent<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  error,
  emptyMessage = 'Nenhum dado encontrado',
  getRowId,
  title,
  subtitle,
  pagination,
  sorting,
  selection,
  onRowClick,
  onRefresh,
  searchable = true,
  searchValue = '',
  onSearchChange,
  exportable = true,
  onExport,
  actions,
  rowActions,
  stickyHeader = true,
  dense = false,
  striped = true,
  hover = true,
  maxHeight = 600,
  showRowNumber = false,
  mobileCardRender,
}: DataTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter((c) => !c.hidden).map((c) => String(c.id)))
  );
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const visibleColumnsList = useMemo(
    () => columns.filter((c) => visibleColumns.has(String(c.id))),
    [columns, visibleColumns]
  );

  const handleSort = useCallback(
    (columnId: string) => {
      if (!sorting) return;
      const isAsc = sorting.sortBy === columnId && sorting.sortOrder === 'ASC';
      sorting.onSort(columnId, isAsc ? 'DESC' : 'ASC');
    },
    [sorting]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearch(value);
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  const handleSelectAll = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      selection?.onSelectAll(event.target.checked);
    },
    [selection]
  );

  const handleSelectRow = useCallback(
    (id: string) => {
      if (!selection) return;
      const isSelected = selection.selected.includes(id);
      if (isSelected) {
        selection.onSelect(selection.selected.filter((s) => s !== id));
      } else {
        selection.onSelect([...selection.selected, id]);
      }
    },
    [selection]
  );

  const toggleColumn = useCallback((columnId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        if (next.size > 1) next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  }, []);

  const handleExport = useCallback(
    (format: 'csv' | 'json') => {
      setMenuAnchor(null);
      onExport?.(format);
    },
    [onExport]
  );

  // Loading skeleton
  if (loading) {
    return (
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        {title && (
          <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Skeleton variant="text" width="30%" height={28} />
            {subtitle && <Skeleton variant="text" width="50%" height={20} />}
          </Box>
        )}
        <Box sx={{ p: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${theme.palette.error.main}`,
          bgcolor: alpha(theme.palette.error.main, 0.02),
          textAlign: 'center',
        }}
      >
        <Typography color="error" fontWeight={600} gutterBottom>
          Erro ao carregar dados
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </Typography>
        {onRefresh && (
          <Button variant="outlined" color="error" startIcon={<Refresh />} onClick={onRefresh}>
            Tentar novamente
          </Button>
        )}
      </Paper>
    );
  }

  // Mobile card view
  if (isMobile && mobileCardRender) {
    return (
      <Box>
        {/* Mobile Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {title && (
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {title}
            </Typography>
          )}
          {searchable && (
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar..."
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ opacity: 0.5 }} />
                  </InputAdornment>
                ),
                endAdornment: localSearch && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleSearch('')}>
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Paper>

        {/* Mobile Cards */}
        <Stack spacing={1.5}>
          <AnimatePresence>
            {data.length === 0 ? (
              <Paper
                elevation={0}
                sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
              >
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </Paper>
            ) : (
              data.map((row, index) => (
                <motion.div
                  key={getRowId(row)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {mobileCardRender(row, index)}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </Stack>

        {/* Mobile Pagination */}
        {pagination && (
          <Paper
            elevation={0}
            sx={{ mt: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
          >
            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page - 1}
              onPageChange={(_, p) => pagination.onPageChange(p + 1)}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={(e) => pagination.onLimitChange(parseInt(e.target.value, 10))}
              rowsPerPageOptions={[5, 10, 20]}
              labelRowsPerPage="Por pagina:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Paper>
        )}
      </Box>
    );
  }

  // Desktop table view
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      {(title || searchable || actions) && (
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box>
            {title && (
              <Typography variant="h6" fontWeight={700}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {searchable && (
              <TextField
                size="small"
                placeholder="Buscar..."
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{ width: { xs: '100%', sm: 250 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ opacity: 0.5 }} />
                    </InputAdornment>
                  ),
                  endAdornment: localSearch && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleSearch('')}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {actions}

            <Tooltip title="Colunas visiveis">
              <IconButton size="small" onClick={(e) => setColumnMenuAnchor(e.currentTarget)}>
                <Badge badgeContent={columns.length - visibleColumnsList.length} color="primary">
                  <ViewColumn />
                </Badge>
              </IconButton>
            </Tooltip>

            {onRefresh && (
              <Tooltip title="Atualizar">
                <IconButton size="small" onClick={onRefresh}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}

            {exportable && (
              <>
                <Tooltip title="Exportar">
                  <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                    <Download />
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                  <MenuItem onClick={() => handleExport('csv')}>
                    <ListItemText>Exportar CSV</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('json')}>
                    <ListItemText>Exportar JSON</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Column visibility menu */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Colunas Visiveis
        </Typography>
        <Divider />
        {columns.map((column) => (
          <MenuItem key={String(column.id)} onClick={() => toggleColumn(String(column.id))}>
            <ListItemIcon>
              <Checkbox
                checked={visibleColumns.has(String(column.id))}
                size="small"
                disableRipple
              />
            </ListItemIcon>
            <ListItemText>{column.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Table */}
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selection && (
                <TableCell padding="checkbox" sx={{ bgcolor: theme.palette.primary.main }}>
                  <Checkbox
                    indeterminate={selection.selected.length > 0 && selection.selected.length < data.length}
                    checked={data.length > 0 && selection.selected.length === data.length}
                    onChange={handleSelectAll}
                    sx={{ color: 'white' }}
                  />
                </TableCell>
              )}
              {showRowNumber && (
                <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 700, width: 60 }}>
                  #
                </TableCell>
              )}
              {visibleColumnsList.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 700,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    position: column.sticky ? 'sticky' : undefined,
                    left: column.sticky ? 0 : undefined,
                    zIndex: column.sticky ? 3 : undefined,
                  }}
                >
                  {column.sortable && sorting ? (
                    <TableSortLabel
                      active={sorting.sortBy === column.id}
                      direction={sorting.sortBy === column.id ? (sorting.sortOrder.toLowerCase() as 'asc' | 'desc') : 'asc'}
                      onClick={() => handleSort(String(column.id))}
                      sx={{
                        color: 'white !important',
                        '&.Mui-active': { color: 'white !important' },
                        '& .MuiTableSortLabel-icon': { color: 'white !important' },
                      }}
                    >
                      {column.headerRender ? column.headerRender() : column.label}
                    </TableSortLabel>
                  ) : column.headerRender ? (
                    column.headerRender()
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {rowActions && (
                <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 700, width: 80 }} align="center">
                  Acoes
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnsList.length + (selection ? 1 : 0) + (showRowNumber ? 1 : 0) + (rowActions ? 1 : 0)} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">{emptyMessage}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => {
                  const rowId = getRowId(row);
                  const isSelected = selection?.selected.includes(rowId);

                  return (
                    <MotionTableRow
                      key={rowId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.02 }}
                      hover={hover}
                      selected={isSelected}
                      onClick={() => onRowClick?.(row)}
                      sx={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        bgcolor: striped && index % 2 === 1 ? alpha(theme.palette.primary.main, 0.02) : undefined,
                        '&:hover': hover
                          ? { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                          : undefined,
                      }}
                    >
                      {selection && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectRow(rowId);
                            }}
                          />
                        </TableCell>
                      )}
                      {showRowNumber && (
                        <TableCell>
                          <Typography fontWeight={600} color="text.secondary">
                            {pagination ? (pagination.page - 1) * pagination.limit + index + 1 : index + 1}
                          </Typography>
                        </TableCell>
                      )}
                      {visibleColumnsList.map((column) => (
                        <TableCell
                          key={String(column.id)}
                          align={column.align || 'left'}
                          sx={{
                            position: column.sticky ? 'sticky' : undefined,
                            left: column.sticky ? 0 : undefined,
                            bgcolor: column.sticky ? theme.palette.background.paper : undefined,
                            zIndex: column.sticky ? 1 : undefined,
                          }}
                        >
                          {column.renderCell
                            ? column.renderCell(row, index)
                            : column.format
                            ? column.format(column.getValue ? column.getValue(row) : row[column.id as keyof T], row)
                            : String(column.getValue ? column.getValue(row) : row[column.id as keyof T] ?? '-')}
                        </TableCell>
                      ))}
                      {rowActions && (
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          {rowActions(row)}
                        </TableCell>
                      )}
                    </MotionTableRow>
                  );
                })
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={(_, p) => pagination.onPageChange(p + 1)}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={(e) => pagination.onLimitChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Itens por pagina:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}
    </Paper>
  );
}

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;

export default DataTable;
