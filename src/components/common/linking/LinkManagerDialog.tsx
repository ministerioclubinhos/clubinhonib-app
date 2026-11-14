import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LinkOffIcon from "@mui/icons-material/LinkOff";

import { CardActionButton } from "@/components/common/listing";
import type { TestIdProps } from "@/types/testIds";

import type { LinkCardinality, LinkOption, LinkedItem } from "./types";

interface Props extends TestIdProps {
  open: boolean;
  /** Nome do lado que está sendo editado — o professor, o clubinho, o coordenador. */
  subjectName: string;
  title: string;
  cardinality: LinkCardinality;
  linked: LinkedItem[];
  options: LinkOption[];
  optionsLoading?: boolean;
  loading: boolean;
  error?: string;
  /** Sem permissão de escrita a tela mostra os vínculos e esconde os controles. */
  readOnly?: boolean;
  /** Aviso exibido no lugar dos controles quando `readOnly`. */
  readOnlyReason?: string;
  labels: {
    linkedTitle: string;
    emptyLinked: string;
    addLabel: string;
    addPlaceholder?: string;
    addHelper?: string;
    noOptions: string;
    submit: string;
    /** Rótulo do botão principal quando já existe vínculo e ele será trocado. */
    submitReplace?: string;
    unlink: (item: LinkedItem) => string;
  };
  onAdd: (optionId: string) => void;
  onUnlink: (item: LinkedItem) => void;
  onClose: () => void;
}

/**
 * Gerencia os vínculos de um lado só.
 *
 * Desvincular nunca acontece daqui: o evento sobe para a tela, que confirma
 * antes. Perder o vínculo tira o acesso às crianças da turma, e a operação não
 * se desfaz sozinha.
 */
export default function LinkManagerDialog({
  "data-testid": testId = "linking-link-manager-dialog",
  open,
  subjectName,
  title,
  cardinality,
  linked,
  options,
  optionsLoading = false,
  loading,
  error,
  readOnly = false,
  readOnlyReason,
  labels,
  onAdd,
  onUnlink,
  onClose,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [selected, setSelected] = useState<LinkOption | null>(null);

  const isSingle = cardinality === "single";
  const currentId = isSingle ? linked[0]?.id : undefined;

  const linkedIds = useMemo(
    () => new Set(linked.map((item) => item.id)),
    [linked],
  );

  /**
   * No vínculo único o atual continua na lista — ele é o valor selecionado.
   * No múltiplo sai: já está vinculado, e escolhê-lo de novo não faria nada.
   */
  const availableOptions = useMemo(
    () =>
      isSingle
        ? options
        : options.filter((option) => !linkedIds.has(option.id)),
    [isSingle, options, linkedIds],
  );

  useEffect(() => {
    if (!open) {
      setSelected(null);
      return;
    }

    setSelected(
      currentId ? (options.find((o) => o.id === currentId) ?? null) : null,
    );
  }, [open, currentId, options]);

  const isUnchanged = isSingle && !!selected && selected.id === currentId;
  const submitLabel =
    isSingle && currentId && labels.submitReplace
      ? labels.submitReplace
      : labels.submit;

  const hasBlockedOptions = availableOptions.some((o) => !!o.blockedReason);

  return (
    <Dialog data-testid={testId}
      open={open}
      // Fechar durante a gravação deixaria a tela sem saber o resultado.
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isXs && cardinality === "multiple"}
      aria-labelledby="link-manager-title"
    >
      <DialogTitle id="link-manager-title">{title}</DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {readOnly && readOnlyReason ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            {readOnlyReason}
          </Alert>
        ) : null}

        <Stack spacing={2}>
          <Typography sx={{ fontWeight: 700 }} noWrap title={subjectName}>
            {subjectName}
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {labels.linkedTitle}
            </Typography>

            {linked.length === 0 ? (
              <Chip size="small" label={labels.emptyLinked} />
            ) : (
              <List dense disablePadding>
                {linked.map((item) => (
                  <ListItem
                    key={item.id}
                    divider
                    secondaryAction={
                      readOnly ? undefined : (
                        <CardActionButton
                          label={labels.unlink(item)}
                          color="warning"
                          disabled={loading}
                          onClick={() => onUnlink(item)}
                        >
                          <LinkOffIcon fontSize="small" />
                        </CardActionButton>
                      )
                    }
                  >
                    <ListItemText
                      primary={item.primary}
                      secondary={item.secondary}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {readOnly ? null : (
            <Autocomplete
              options={availableOptions}
              value={selected}
              loading={optionsLoading}
              disabled={loading}
              onChange={(_, option) => setSelected(option)}
              getOptionLabel={(option) => option.label}
              getOptionDisabled={(option) => !!option.blockedReason}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={labels.noOptions}
              renderOption={(props, option) => {
                const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & {
                  key: string;
                };

                return (
                  <Box component="li" key={key} {...rest}>
                    <Stack sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap>
                        {option.label}
                      </Typography>
                      {option.blockedReason ? (
                        <Typography variant="caption" color="text.secondary">
                          {option.blockedReason}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={labels.addLabel}
                  placeholder={labels.addPlaceholder}
                  helperText={
                    hasBlockedOptions
                      ? (labels.addHelper ??
                        "Opções indisponíveis aparecem desabilitadas, com o motivo.")
                      : labels.addHelper
                  }
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {optionsLoading ? <CircularProgress size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, md: 3 }, py: 2, gap: 1 }}>
        <Button type="button" onClick={onClose} disabled={loading}>
          Fechar
        </Button>

        {readOnly ? null : (
          <Button
            type="submit"
            variant="contained"
            onClick={() => selected && onAdd(selected.id)}
            disabled={
              loading || !selected || !!selected.blockedReason || isUnchanged
            }
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {submitLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
