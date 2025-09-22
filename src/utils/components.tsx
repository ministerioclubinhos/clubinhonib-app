import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

// Componente utilitário para copiar texto para a área de transferência
export function CopyButton({ value, title = "Copiar" }: { value?: string; title?: string }) {
  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text)).catch(() => {});
  };
  return (
    <Tooltip title={title}>
      <IconButton 
        size="small" 
        onClick={() => copyToClipboard(value)}
        sx={{ p: 0.5 }}
      >
        <ContentCopy fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

// Função utilitária para gerar iniciais a partir de um nome
export const initials = (name?: string) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("") || "?";

