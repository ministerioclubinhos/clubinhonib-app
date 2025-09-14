import React from "react";
import { Box, TextField, CircularProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: "all" | "published" | "unpublished";
  setStatus: (s: "all" | "published" | "unpublished") => void;
  isFiltering: boolean;
};

export default function CommentsToolbar({ search, onSearchChange, status, setStatus, isFiltering }: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 4, alignItems: { sm: "center" }, position: "relative" }}>
      <Box sx={{ flex: 1, position: "relative" }}>
        <TextField
          fullWidth
          label="Buscar por nome, clubinho ou bairro"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ maxWidth: { sm: 400 } }}
        />
        {isFiltering && (
          <CircularProgress size={20} sx={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }} />
        )}
      </Box>
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel>Status</InputLabel>
        <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value as any)}>
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="published">Publicado</MenuItem>
          <MenuItem value="unpublished">Não Publicado</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
