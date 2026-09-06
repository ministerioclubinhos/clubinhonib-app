import React, { useMemo, useState } from "react";
import { Grid2 } from "@mui/material";

import {
  ListingLayout,
  ListingToolbar,
  type ListingFilter,
} from "@/components/common/listing";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";

import ContactCard from "./components/ContactCard";
import ContactDetailsModal from "./components/ContactDetailsModal";
import { useContactMutations, useContacts } from "./hooks";
import { CONTACTS_PAGE_SIZE_OPTIONS } from "./constants";
import type { ContactResponse } from "./types";

/** Valor usado quando o filtro está sem seleção. */
const ANY = "";

export default function ContactsManager() {
  const {
    items,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    filters,
    setFilters,
    loading,
    error,
    setError,
    refresh,
  } = useContacts();

  const { actionLoading, actionError, setActionError, setRead, remove } =
    useContactMutations(refresh);

  const [viewing, setViewing] = useState<ContactResponse | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ContactResponse | null>(
    null,
  );

  const toolbarFilters = useMemo<ListingFilter[]>(
    () => [
      {
        id: "read",
        label: "Situação",
        value: filters.read === undefined ? ANY : String(filters.read),
        options: [
          { value: ANY, label: "Todos" },
          { value: "false", label: "Não lidos" },
          { value: "true", label: "Lidos" },
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            read: value === ANY ? undefined : value === "true",
          })),
      },
    ],
    [filters, setFilters],
  );

  const handleToggleRead = async (contact: ContactResponse) => {
    const ok = await setRead(contact.id, !contact.read);
    if (ok && viewing?.id === contact.id) setViewing(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    const ok = await remove(confirmDelete.id);
    if (ok) {
      setConfirmDelete(null);
      setViewing(null);
    }
  };

  return (
    <ListingLayout data-testid="contacts-contacts-manager"
      title="Mensagens de contato"
      summary={
        total > 0
          ? `${total} mensagem(ns) encontrada(s)`
          : "Nenhuma mensagem para os filtros atuais"
      }
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por nome, e-mail, telefone ou mensagem…"
          onSearchChange={setSearch}
          filters={toolbarFilters}
          onRefresh={refresh}
        />
      }
      loading={loading}
      error={error || actionError}
      onDismissError={() => {
        setError("");
        setActionError("");
      }}
      itemCount={items.length}
      emptyTitle="Nenhuma mensagem encontrada"
      emptySubtitle="Ajuste a busca ou os filtros para ver outros resultados."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={CONTACTS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <ContactDetailsModal
            contact={viewing}
            onClose={() => setViewing(null)}
            onToggleRead={() => viewing && void handleToggleRead(viewing)}
            onDelete={() => {
              if (viewing) setConfirmDelete(viewing);
            }}
          />

          <DeleteConfirmDialog
            open={!!confirmDelete}
            title={confirmDelete ? `mensagem de ${confirmDelete.name}` : ""}
            onClose={() => setConfirmDelete(null)}
            onConfirm={handleDelete}
          />
        </>
      }
    >
      {items.map((contact) => (
        <Grid2 key={contact.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <ContactCard
            contact={contact}
            disabled={actionLoading}
            onView={() => setViewing(contact)}
            onToggleRead={() => void handleToggleRead(contact)}
            onDelete={() => setConfirmDelete(contact)}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
