import { ContentItem } from '../../services/Content/ContentApi';
import { mapFormikToEditAPIValues, mapToDefaultFormikValues } from './helpers';

it('mapFormikToEditAPIValues', () => {
  const values = [
    {
      name: 'AwesomeNamewtmsgnum0',
      url: 'https://google.ca/wtmsgnum0/x86_64/el7',
      gpgKey: '',
      arch: 'x86_64',
      versions: ['el7'],
      gpgLoading: false,
      expanded: false,
      uuid: 'stuff',
    },
  ];

  const mappedValues = [
    {
      name: 'AwesomeNamewtmsgnum0',
      url: 'https://google.ca/wtmsgnum0/x86_64/el7',
      distribution_arch: 'x86_64',
      distribution_versions: ['el7'],
      gpgKey: '',
      uuid: 'stuff',
    },
  ];

  expect(mapFormikToEditAPIValues(values)).toEqual(mappedValues);
});

it('mapToDefaultFormikValues', () => {
  const validationData: ContentItem[] = [
    {
      uuid: 'stuffAndThings',
      name: 'stuffAndThings',
      url: 'stuffAndThings',
      package_count: 25,
      distribution_versions: ['version1', 'etc'],
      distribution_arch: 'stuffAndThings',
      account_id: 'stuffAndThings',
      org_id: 'stuffAndThings',
    },
  ];
  const mapped = [
    {
      name: 'stuffAndThings',
      url: 'stuffAndThings',
      arch: 'stuffAndThings',
      versions: ['version1', 'etc'],
      gpgKey: '',
      gpgLoading: false,
      expanded: true,
      uuid: 'stuffAndThings',
    },
  ];

  expect(mapToDefaultFormikValues([])).toEqual([]);
  expect(mapToDefaultFormikValues(validationData)).toEqual(mapped);
});
