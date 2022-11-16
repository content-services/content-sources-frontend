import { render } from '@testing-library/react';
import { ReactQueryTestWrapper } from '../../../testingHelpers';
import PackageCount from './PackageCount';

jest.mock('../../../services/Notifications/Notifications', () => ({
  useNotification: () => ({ notify: () => null }),
}));

jest.mock('../../../middleware/AppContext', () => ({
  useAppContext: () => ({}),
}));

describe('PackageCount component', () => {
  it('Render PackageCount for Invalid state', () => {
    const data = {uuid: '', name: '', package_count: 100, url: '', status: 'Invalid', account_id: '', distribution_arch: '', gpg_key: '', distribution_versions: [''], last_introspection_error: '', metadata_verification: false, org_id: 'acme'}
    const result = render(
      <ReactQueryTestWrapper>
        <PackageCount rowData={data}  />
      </ReactQueryTestWrapper>,
    );

    expect(result.baseElement.textContent).toEqual('N/A');
  });

  it('Render PackageCount for Pending state', () => {
    const data = {uuid: '', name: '', package_count: 0, url: '', status: 'Pending', account_id: '', distribution_arch: '', gpg_key: '', distribution_versions: [''], last_introspection_error: '', metadata_verification: false, org_id: 'acme'};
    const result = render(
      <ReactQueryTestWrapper>
        <PackageCount rowData={data} />
      </ReactQueryTestWrapper>,
    );

    expect(result.baseElement.textContent).toEqual('N/A');
  });

  it('Render PackageCount normally', () => {
    const data = {uuid: '88a8417e-65ab-11ed-b54c-482ae3863d30', name: 'My test repository', package_count: 100, url: 'https://www.example.test/my-repository', status: 'Valid', account_id: '', distribution_arch: 'x86_64', gpg_key: '', distribution_versions: ['el8'], last_introspection_error: '', metadata_verification: false, org_id: 'acme'};
    const result = render(
      <ReactQueryTestWrapper>
        <PackageCount rowData={data} />
      </ReactQueryTestWrapper>,
    );

    expect(result.baseElement.textContent).toEqual('100');
  });
})
