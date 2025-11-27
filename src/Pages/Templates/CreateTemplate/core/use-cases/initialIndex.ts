import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const indexMapper = {
  define_content: 2,
  redhat_repositories: 3,
  custom_repositories: 4,
  set_up_date_step: 5,
  detail_step: 6,
  review_step: 7,
};

export const useInitialIndex = () => {
  const [urlSearchParams] = useSearchParams();
  return useMemo(() => {
    const tabValue = urlSearchParams.get('tab');
    if (tabValue && indexMapper[tabValue]) return indexMapper[tabValue];
    return 2;
  }, []);
};
