import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import FormHelperText from "@mui/material/FormHelperText";
import { apiFetchSimpleClubs } from "@/features/clubs/api";

export type SimpleClubResponseDto = {
  id: string;
  detalhe: string;
  coordinator: boolean;
};

type Props = {
  value: string | null;
  onChange: (id: string | null, option?: SimpleClubResponseDto | null) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  fetchOnMount?: boolean;
};

export default function ClubAutocomplete({
  value,
  onChange,
  label = "Clubinho",
  placeholder = "Digite para filtrar…",
  helperText,
  errorText,
  disabled,
  required,
  fullWidth = true,
  size = "small",
  fetchOnMount = false,
}: Props) {
  const [options, setOptions] = React.useState<SimpleClubResponseDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string>("");

  const selected = options.find((o) => o.id === value) || null;

  const load = React.useCallback(async () => {
    if (loading || options.length > 0) return;
    setLoading(true);
    setLoadError("");
    try {
      const items = await apiFetchSimpleClubs();
      const safe = Array.isArray(items) ? items : [];
      setOptions(safe);

      if (safe.length === 1 && !value) {
        onChange(safe[0].id, safe[0]);
      }
    } catch (e: any) {
      setLoadError(e?.response?.data?.message || e?.message || "Falha ao carregar clubinhos");
    } finally {
      setLoading(false);
    }
  }, [loading, options.length, onChange, value]);

  React.useEffect(() => {
    if (fetchOnMount) load();
  }, [fetchOnMount, load]);

  return (
    <>
      <Autocomplete
        options={options}
        value={selected}
        disabled={disabled}
        loading={loading}
        onOpen={load}
        onChange={(_, opt) => onChange(opt ? opt.id : null, opt ?? null)}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        getOptionLabel={(o) => o?.detalhe ?? ""}
        clearOnEscape
        disableClearable={false}
        fullWidth={fullWidth}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            size={size}
            placeholder={placeholder}
            error={!!errorText}
            helperText={errorText}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      {(helperText || loadError) && (
        <FormHelperText error={!!loadError}>
          {loadError ? loadError : helperText}
        </FormHelperText>
      )}
    </>
  );
}
