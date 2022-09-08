import { ContentItem, EditContentRequest } from './../../services/Content/ContentApi';
export interface EditContentProps {
  setClosed: () => void;
  open: boolean;
  values: ContentItem[];
}

export interface FormikEditValues {
  name: string;
  url: string;
  gpgKey: string;
  arch: string;
  versions: string[];
  gpgLoading: boolean;
  expanded: boolean;
  uuid: string;
}

export const mapFormikToEditAPIValues = (formikValues: FormikEditValues[]): EditContentRequest =>
  formikValues.map(({ name, url, arch, versions, gpgKey, uuid }) => ({
    uuid,
    name,
    url,
    distribution_arch: arch,
    distribution_versions: versions,
    gpgKey,
  }));

export const mapToDefaultFormikValues = (values: EditContentProps['values']): FormikEditValues[] =>
  values.map(
    ({ name, url, distribution_arch: arch, distribution_versions: versions, uuid }, index) => ({
      name,
      url,
      arch,
      versions,
      gpgKey: '',
      gpgLoading: false,
      expanded: index + 1 === values.length,
      uuid,
    }),
  );
