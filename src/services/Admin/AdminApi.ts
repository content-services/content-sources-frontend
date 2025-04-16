import axios from 'axios';

export interface AdminFeatures {
  features: string[];
}

export interface AdminFeature {
  name: string;
  url: string;
  red_hat_repo_structure: {
    name: string;
    content_label: string;
    url: string;
    arch: string;
    distribution_version: string;
    feature_name: string;
  };
}

export const getAdminFeatures: () => Promise<AdminFeatures> = async () => {
  const { data } = await axios.get(`/api/content-sources/v1/admin/features/`);

  if (data.features) {
    data.features.sort((a: string, b: string) => a.localeCompare(b));
  }

  return data as AdminFeatures;
};

export const getAdminFeature: (featureName: string) => Promise<AdminFeature[]> = async (
  featureName: string,
) => {
  const { data } = await axios.get(
    `/api/content-sources/v1/admin/features/${featureName}/content/`,
  );

  if (data.length) {
    data.sort((a: AdminFeature, b: AdminFeature) => a.name.localeCompare(b.name));
  }

  return data as AdminFeature[];
};
