import { AlertVariant } from '@patternfly/react-core';
import { useState } from 'react';
import { useNotification } from '../Notifications/Notifications';
import { Features, getFeatures } from './FeatureApi';

export const useFetchFeaturesQuery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { notify } = useNotification();

  const fetchFeatures = async (): Promise<Features | null> => {
    setIsLoading(true);
    let features: Features | null = null;
    try {
      features = await getFeatures();
    } catch ({ response = {} }: any) {
      const { data } = response as { data: { message: string | undefined } | string };
      const description = typeof data === 'string' ? data : data?.message;
      notify({
        variant: AlertVariant.danger,
        title: 'Error fetching features',
        description,
      });
    }
    setIsLoading(false);
    return features;
  };

  return { fetchFeatures, isLoading };
};
