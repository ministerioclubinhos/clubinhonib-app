import { useState, useEffect } from 'react';
import { FeatureFlags, MOCKED_FEATURE_FLAGS } from '@/constants/featureFlags';

export interface UseFeatureFlagsReturn {
  flags: FeatureFlags;
  loading: boolean;
  error: string | null;
}

export const useFeatureFlags = (): UseFeatureFlagsReturn => {
  const [flags, setFlags] = useState<FeatureFlags>(MOCKED_FEATURE_FLAGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // import api from '@/config/axiosConfig';
    //
    // const fetchFlags = async () => {
    //   setLoading(true);
    //   setError(null);
    //   try {
    //     const { data } = await api.get<Partial<FeatureFlags>>('/feature-flags');
    //     setFlags({ ...MOCKED_FEATURE_FLAGS, ...data });
    //   } catch (err) {
    //     setError('Could not load feature flags.');
    //     setFlags(MOCKED_FEATURE_FLAGS);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    //
    // fetchFlags();
  }, []);

  return { flags, loading, error };
};

export default useFeatureFlags;
