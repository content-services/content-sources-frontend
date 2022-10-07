import { ContentItem, EditContentRequest } from '../../../../services/Content/ContentApi';
export interface EditContentProps {
  setClosed: () => void;
  open: boolean;
  values: ContentItem[];
}

export interface FormikEditValues {
  name: string;
  url: string;
  gpgKey: string;
  metadataVerification: boolean;
  arch: string;
  versions: string[];
  gpgLoading: boolean;
  expanded: boolean;
  uuid: string;
}

export const mapFormikToEditAPIValues = (formikValues: FormikEditValues[]): EditContentRequest =>
  formikValues.map(({ name, url, arch, versions, gpgKey, metadataVerification, uuid }) => ({
    uuid,
    name,
    url,
    distribution_arch: arch,
    distribution_versions: versions,
    gpg_key: gpgKey,
    metadata_verification: metadataVerification,
  }));

export const mapToDefaultFormikValues = (values: EditContentProps['values']): FormikEditValues[] =>
  values.map(
    (
      {
        name,
        url,
        distribution_arch: arch,
        distribution_versions: versions,
        uuid,
        gpg_key: gpgKey,
        metadata_verification: metadataVerification,
      },
      index,
    ) => ({
      name,
      url,
      arch,
      versions,
      gpgKey,
      gpgLoading: false,
      metadataVerification,
      expanded: index + 1 === values.length,
      uuid,
    }),
  );
