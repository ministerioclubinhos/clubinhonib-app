import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiDeleteContact, apiListContacts, apiMarkAsRead } from "./api";
import { Contact } from "./types";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiListContacts();
      setContacts(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Erro ao carregar contatos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  return { contacts, setContacts, loading, error, setError, fetchContacts };
}

export function useContactSearch(source: Contact[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState<Contact[]>(source);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) { setFiltered(source); return; }
      setFiltered(
        source.filter((c) =>
          [c.name, c.email, c.phone, c.message]
            .filter(Boolean)
            .some((f) => String(f).toLowerCase().includes(term))
        )
      );
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [searchTerm, source]);

  return { searchTerm, setSearchTerm, filtered };
}

export function useContactMutations(refresh: () => Promise<void> | void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const remove = useCallback(async (id: string) => {
    setBusy(true); setError("");
    try { await apiDeleteContact(id); await refresh(); }
    catch (e: any) { setError(e?.response?.data?.message || e.message || "Erro ao excluir contato"); throw e; }
    finally { setBusy(false); }
  }, [refresh]);

  const markAsRead = useCallback(async (id: string) => {
    setBusy(true); setError("");
    try { await apiMarkAsRead(id); await refresh(); }
    catch (e: any) { setError(e?.response?.data?.message || e.message || "Erro ao marcar como lido"); throw e; }
    finally { setBusy(false); }
  }, [refresh]);

  return { busy, error, setError, remove, markAsRead };
}
