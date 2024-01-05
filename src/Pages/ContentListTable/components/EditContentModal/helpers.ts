import { ContentItem, EditContentRequest } from '../../../../services/Content/ContentApi';

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
  snapshot: boolean;
  moduleHotfixesEnabled: boolean;
}

export const mapFormikToEditAPIValues = (formikValues: FormikEditValues[]): EditContentRequest =>
  formikValues.map(
    ({ name, url, arch, versions, gpgKey, metadataVerification, uuid, snapshot, moduleHotfixesEnabled }) => ({
      uuid,
      name,
      url,
      distribution_arch: arch,
      distribution_versions: versions,
      gpg_key: gpgKey,
      metadata_verification: metadataVerification,
      snapshot,
      module_hotfixes: moduleHotfixesEnabled,
    }),
  );

export const mapToDefaultFormikValues = (values: ContentItem[]): FormikEditValues[] =>
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
        snapshot,
        module_hotfixes: moduleHotfixesEnabled,
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
      snapshot,
      moduleHotfixesEnabled,
    }),
  );

export const mapToContentItemsToEditContentRequest = (values: ContentItem[]): EditContentRequest =>
  mapFormikToEditAPIValues(mapToDefaultFormikValues(values));
