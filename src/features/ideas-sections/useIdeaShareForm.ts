import { FEATURE, useFeatureFlagsContext } from '@/features/feature-flags';
import { useEffect, useMemo, useRef, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { IDEA_SHARE_INITIAL_VALUES, IDEA_SHARE_MAX_MEDIAS } from './constants';
import { ideaShareSchema } from './schemas';
import {
  isValidYoutubeUrl,
  toIdeaUploadMedia,
  toIdeaYoutubeMedia,
  validateIdeaShareFile,
} from './share-utils';
import { IdeaMaterialKind, type IdeaShareFormFields, type IdeaShareMaterial } from './types';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useShareIdea } from './hooks';

export function useIdeaShareForm() {
  const navigate = useNavigate();
  const { isEnabled } = useFeatureFlagsContext();
  const automaticAi = isEnabled(FEATURE.IDEA_AI_ENHANCEMENT);

  const [removed, setRemoved] = useState<IdeaShareMaterial | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedKind, setSelectedKind] = useState<IdeaMaterialKind>(IdeaMaterialKind.DOCUMENT);
  const [alert, setAlert] = useState('');
  const share = useShareIdea();
  const { progress, error: apiError } = share;

  const removedRef = useRef(removed);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<IdeaShareFormFields>({
    resolver: yupResolver(ideaShareSchema),
    defaultValues: IDEA_SHARE_INITIAL_VALUES,
  });
  const values = watch();
  const materials = values.materials;
  const materialsRef = useRef(materials);
  const setMaterials = (next: IdeaShareMaterial[]) =>
    setValue('materials', next, { shouldDirty: true, shouldValidate: true });
  const dirty = useMemo(
    () => !share.isSuccess && Boolean(values.title || values.description || materials.length),
    [materials.length, share.isSuccess, values.description, values.title]
  );

  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);
  useEffect(() => {
    removedRef.current = removed;
  }, [removed]);

  useUnsavedChangesGuard(dirty && !share.isSubmitting);
  useEffect(
    () => () => {
      materialsRef.current.forEach((material) => {
        if (material.previewUrl) URL.revokeObjectURL(material.previewUrl);
      });
      if (removedRef.current?.previewUrl) URL.revokeObjectURL(removedRef.current.previewUrl);
    },
    []
  );

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const added: IdeaShareMaterial[] = [];
    const issues: string[] = [];
    for (const file of Array.from(files)) {
      const issue = validateIdeaShareFile(file, materials.length + added.length, selectedKind);
      if (issue) {
        issues.push(issue);
        continue;
      }
      const item = toIdeaUploadMedia(file, selectedKind);
      if (item) added.push(item);
    }
    setMaterials([...materials, ...added]);
    setAlert(issues.join(' '));
  };

  const addYoutube = () => {
    if (!isValidYoutubeUrl(youtubeUrl)) {
      setAlert('Informe um link válido de vídeo do YouTube.');
      return;
    }
    if (materials.length >= IDEA_SHARE_MAX_MEDIAS) {
      setAlert(`Você pode enviar até ${IDEA_SHARE_MAX_MEDIAS} materiais.`);
      return;
    }
    const material = toIdeaYoutubeMedia(youtubeUrl);
    if (!material) {
      setAlert('Informe um link válido de vídeo do YouTube.');
      return;
    }
    setMaterials([...materials, material]);
    setSelectedKind(IdeaMaterialKind.VIDEO);
    setYoutubeUrl('');
    setAlert('');
  };

  const onSubmit = handleSubmit(async (formValues) => {
    if (!materials.length) {
      setAlert('Adicione pelo menos um documento, imagem ou vídeo.');
      return;
    }
    await share.submit(formValues, materials);
  });

  const resetForm = () => {
    materials.forEach((material) => {
      if (material.previewUrl) URL.revokeObjectURL(material.previewUrl);
    });
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    setMaterials([]);
    setRemoved(null);
    reset(IDEA_SHARE_INITIAL_VALUES);
    setAlert('');
    setYoutubeUrl('');
    share.reset();
  };

  const removeMaterial = (item: IdeaShareMaterial) => {
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    setMaterials(materials.filter((m) => m.id !== item.id));
    setRemoved(item);
  };
  const undoRemove = () => {
    if (!removed) return;
    if (materials.length >= IDEA_SHARE_MAX_MEDIAS) {
      setAlert(`Você pode enviar até ${IDEA_SHARE_MAX_MEDIAS} materiais.`);
      return;
    }
    setMaterials([...materials, removed]);
    setRemoved(null);
  };
  return {
    navigate,
    automaticAi,
    hasVideo: materials.some((material) => material.kind === IdeaMaterialKind.VIDEO),
    materials,
    removed,
    youtubeUrl,
    setYoutubeUrl,
    selectedKind,
    setSelectedKind,
    alert: alert || errors.materials?.message || '',
    setAlert,
    share,
    progress,
    apiError,
    register,
    errors,
    values,
    addFiles,
    addYoutube,
    onSubmit,
    resetForm,
    removeMaterial,
    undoRemove,
  };
}
