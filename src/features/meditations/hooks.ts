import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import {
  FORM_VALIDATION_MESSAGES,
  GENERIC_ERROR_MESSAGES,
} from '@/constants/errorMessages';
import { FEATURE_SUCCESS_MESSAGES } from '@/constants/successMessages';
import { MediaUploadType } from '@/store/slices/types';

import {
  createMeditation,
  deleteMeditation,
  listMeditations,
  updateMeditation,
} from './api';
import { MEDITATION_DAYS_COUNT, MEDITATION_ROUTES } from './constants';
import {
  MeditationDayDraft,
  MeditationFormErrors,
  MeditationFormValues,
  MeditationResponse,
} from './types';
import {
  buildMeditationFormData,
  isFriday,
  isMonday,
  toDayDrafts,
  toFormValues,
} from './utils';
import { MEDITATION_SEARCH_DEBOUNCE_MS } from './constants';

export function useMeditationsList() {
  const [all, setAll] = useState<MeditationResponse[]>([]);
  const [items, setItems] = useState<MeditationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef<number | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listMeditations();
      setAll(data);
      setItems(data);
    } catch {
      setError('Erro ao buscar meditações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setFiltering(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const q = search.trim().toLowerCase();
      const filtered = !q ? all : all.filter(m => m.topic.toLowerCase().includes(q));
      setItems(filtered);
      setFiltering(false);
    }, MEDITATION_SEARCH_DEBOUNCE_MS);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [search, all]);

  const remove = useCallback(async (m: MeditationResponse) => {
    setLoading(true);
    try {
      await deleteMeditation(m.id);
      await load();
    } catch {
      setError('Erro ao deletar meditação.');
    } finally {
      setLoading(false);
    }
  }, [load]);

  return {
    meditations: items,
    allMeditations: all,
    loading,
    filtering,
    error,
    setError,
    search,
    setSearch,
    reload: load,
    removeMeditation: remove,
  };
}



// O guarda de alterações não salvas é o mesmo em todos os formulários.
export { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

const NO_ERRORS: MeditationFormErrors = {
  topic: false,
  startDate: false,
  endDate: false,
};

interface UseMeditationFormParams {
  isCreation: boolean;
  meditation: MeditationResponse | null;
}

interface Feedback {
  message: string;
  severity: 'success' | 'error';
}

interface UseMeditationFormResult {
  values: MeditationFormValues;
  setValue: <K extends keyof MeditationFormValues>(
    key: K,
    value: MeditationFormValues[K],
  ) => void;
  days: MeditationDayDraft[];
  setDays: (days: MeditationDayDraft[]) => void;
  errors: MeditationFormErrors;
  isDirty: boolean;
  saving: boolean;
  feedback: Feedback | null;
  dismissFeedback: () => void;
  save: () => Promise<void>;
}

/** Estado, validação e submissão do formulário de meditação. */
export function useMeditationForm({
  isCreation,
  meditation,
}: UseMeditationFormParams): UseMeditationFormResult {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [values, setValues] = useState<MeditationFormValues>(() =>
    toFormValues(isCreation ? null : meditation),
  );
  const [days, setDaysState] = useState<MeditationDayDraft[]>(() =>
    toDayDrafts(isCreation ? null : meditation),
  );
  const [errors, setErrors] = useState<MeditationFormErrors>(NO_ERRORS);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setValues(toFormValues(isCreation ? null : meditation));
    setDaysState(toDayDrafts(isCreation ? null : meditation));
    setErrors(NO_ERRORS);
    setIsDirty(false);
  }, [isCreation, meditation]);

  const setValue = useCallback(
    <K extends keyof MeditationFormValues>(
      key: K,
      value: MeditationFormValues[K],
    ) => {
      setValues((previous) => ({ ...previous, [key]: value }));
      setIsDirty(true);
    },
    [],
  );

  const setDays = useCallback((next: MeditationDayDraft[]) => {
    setDaysState(next);
    setIsDirty(true);
  }, []);

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  const save = useCallback(async () => {
    const nextErrors: MeditationFormErrors = {
      topic: !values.topic.trim(),
      startDate: !values.startDate,
      endDate: !values.endDate,
    };
    setErrors(nextErrors);

    if (nextErrors.topic || nextErrors.startDate || nextErrors.endDate) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.REQUIRED_GENERIC,
        severity: 'error',
      });
      return;
    }

    if (!isMonday(values.startDate)) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.MEDITATION_DATE_MONDAY,
        severity: 'error',
      });
      return;
    }

    if (!isFriday(values.endDate)) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.MEDITATION_DATE_FRIDAY,
        severity: 'error',
      });
      return;
    }

    if (days.length !== MEDITATION_DAYS_COUNT) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.MEDITATION_DAYS_COUNT,
        severity: 'error',
      });
      return;
    }

    const missingMedia =
      values.uploadType === MediaUploadType.LINK
        ? !values.url.trim()
        : !values.file && !meditation?.media;

    if (missingMedia) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.MEDITATION_MEDIA_REQUIRED,
        severity: 'error',
      });
      return;
    }

    if (!isCreation && !meditation?.id) {
      setFeedback({
        message: GENERIC_ERROR_MESSAGES.SAVE_ERROR,
        severity: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      const formData = buildMeditationFormData(
        values,
        days,
        isCreation ? undefined : meditation?.id,
      );

      if (isCreation) {
        await createMeditation(formData);
      } else {
        await updateMeditation(meditation?.id as string, formData);
      }

      await dispatch(fetchRoutes());
      setIsDirty(false);
      setFeedback({
        message: FEATURE_SUCCESS_MESSAGES.MEDITATION_SAVED,
        severity: 'success',
      });
      navigate(MEDITATION_ROUTES.MANAGE);
    } catch {
      setFeedback({
        message: GENERIC_ERROR_MESSAGES.SAVE_ERROR,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  }, [values, days, isCreation, meditation, dispatch, navigate]);

  return {
    values,
    setValue,
    days,
    setDays,
    errors,
    isDirty,
    saving,
    feedback,
    dismissFeedback,
    save,
  };
}
