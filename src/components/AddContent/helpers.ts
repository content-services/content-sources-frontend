import { isEmpty } from 'lodash';
import * as Yup from 'yup';
import { FormikErrors } from 'formik';
import { ValidationResponse } from '../../services/Content/ContentApi';
import ERROR_CODE from './httpErrorCodes.json';

export interface FormikValues {
  name: string;
  url: string;
  gpgKey: string;
  arch: string;
  versions: string[];
  gpgLoading: boolean;
  expanded: boolean;
}

export const REGEX_URL =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

export const isValidURL = (val: string) => {
  const regex = new RegExp(REGEX_URL);
  return val.match(regex);
};

export const mapFormikToAPIValues = (formikValues: FormikValues[]) =>
  formikValues.map(({ name, url, arch, versions, gpgKey }) => ({
    name,
    url,
    distribution_arch: arch,
    distribution_versions: versions,
    gpgKey,
  }));

const mapNoMetaDataError = (validationData: ValidationResponse) =>
  validationData.map(({ url, ...rest }) => ({
    ...rest,
    url: {
      ...url,
      error:
        !url?.error && !url?.metadata_present
          ? `Unable to retrieve YUM Metadata, Recieved HTTP ${url?.http_code}: ${
              url ? ERROR_CODE[url.http_code] : ''
            }`
          : url?.error,
    },
  }));

export const mapValidationData = (
  validationData: ValidationResponse,
  formikErrors: FormikErrors<FormikValues | undefined>[],
) => {
  const updatedValidationData = mapNoMetaDataError(validationData);
  const errors = updatedValidationData.map(({ name, url }, index: number) => ({
    // First apply the errors found in the ValidationAPI
    ...(name?.error ? { name: name?.error } : {}),
    ...(url?.error ? { url: url?.error } : {}),
    // Overwrite any errors with errors found within the UI itself
    ...formikErrors[index],
  }));

  if (errors.every((err) => isEmpty(err))) {
    return [];
  }

  return errors;
};

export const makeValidationSchema = () => {
  // This adds the uniqueProperty function to the below schema validation
  Yup.addMethod(Yup.object, 'uniqueProperty', function (propertyName, message) {
    return this.test('unique', message, function (value) {
      if (!value || !value[propertyName]) {
        return true;
      }
      if (
        this.parent.filter((v) => v !== value).some((v) => v[propertyName] === value[propertyName])
      ) {
        throw this.createError({
          path: `${this.path}.${propertyName}`,
        });
      }

      return true;
    });
  });

  return Yup.array(
    Yup.object()
      .shape({
        name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
        url: Yup.string().url('Invalid URL').required('Required'),
        gpgKey: Yup.string().optional(),
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      .uniqueProperty('name', 'Names must be unique')
      .uniqueProperty('url', 'Url\'s must be unique'),
  );
};

export const magicURLList = [
  'https://www.google.com',
  'https://apple.com',
  'https://youtube.com',
  'https://microsoft.com',
  'https://play.google.com',
  'https://linkedin.com',
  'https://www.blogger.com',
  'https://cloudflare.com',
  'https://en.wikipedia.org',
  'https://mozilla.org',
  'https://docs.google.com',
  'https://youtu.be',
  'https://maps.google.com',
  'https://wordpress.org',
  'https://accounts.google.com',
  'https://europa.eu',
  'https://drive.google.com',
  'https://whatsapp.com',
  'https://adobe.com',
  'https://sites.google.com',
  'https://plus.google.com',
  'https://facebook.com',
  'https://vk.com',
  'https://github.com',
  'https://istockphoto.com',
  'https://amazon.com',
  'https://uol.com.br',
  'https://policies.google.com',
  'https://vimeo.com',
  'https://t.me',
  'https://mail.ru',
  'https://enable-javascript.com',
  'https://medium.com',
  'https://search.google.com',
  'https://google.de',
  'https://ok.ru',
  'https://imdb.com',
];
