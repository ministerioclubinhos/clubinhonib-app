import { useCallback, useEffect, useMemo, useState } from 'react';

import { apiCreateEvent, apiDeleteEvent, apiListEvents, apiUpdateEvent } from './api';
import { EventFormErrors, EventFormValues, EventResponse } from './types';
import { buildEventFormData, sortByDate, validateEventForm } from './utils';

interface UseEventsResult {
  events: EventResponse[];
  loading: boolean;
  error: string;
  fetchEvents: () => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  setError: (message: string) => void;
}

/** Lista de eventos da agenda, já ordenada por data. */
export function useEvents(): UseEventsResult {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setEvents(sortByDate(await apiListEvents()));
    } catch (fetchError) {
      console.error('Erro ao buscar eventos:', fetchError);
      setError('Erro ao buscar os eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const removeEvent = useCallback(
    async (id: string) => {
      await apiDeleteEvent(id);
      await fetchEvents();
    },
    [fetchEvents],
  );

  return useMemo(
    () => ({ events, loading, error, fetchEvents, removeEvent, setError }),
    [events, loading, error, fetchEvents, removeEvent],
  );
}

const NO_ERRORS: EventFormErrors = {
  title: false,
  date: false,
  location: false,
  description: false,
};

interface UseEventFormResult {
  errors: EventFormErrors;
  saving: boolean;
  save: (
    values: EventFormValues,
    file: File | null,
    options?: { removeMedia?: boolean },
  ) => Promise<EventResponse | null>;
}

/**
 * Validação e submissão do formulário de evento. Devolve o evento salvo, ou
 * `null` quando a validação barrou antes de chamar a API.
 */
export function useEventForm(
  event: EventResponse | null,
): UseEventFormResult {
  const [errors, setErrors] = useState<EventFormErrors>(NO_ERRORS);
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (
      values: EventFormValues,
      file: File | null,
      options?: { removeMedia?: boolean },
    ) => {
      const nextErrors = validateEventForm(values);
      setErrors(nextErrors);

      if (Object.values(nextErrors).some(Boolean)) return null;

      setSaving(true);
      try {
        const formData = buildEventFormData(
          values,
          file,
          event,
          options?.removeMedia ?? false,
        );

        return event
          ? await apiUpdateEvent(event.id, formData)
          : await apiCreateEvent(formData);
      } finally {
        setSaving(false);
      }
    },
    [event],
  );

  return { errors, saving, save };
}
