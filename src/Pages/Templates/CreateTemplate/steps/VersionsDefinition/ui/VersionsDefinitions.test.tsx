import { render } from '@testing-library/react';
import VersionDefinitions from './VersionsDefinitions';
import { useVersionsApi, useVersionsLists, useVersionsState } from '../store/VersionsStore';

jest.mock(
  '@src/Pages/Templates/TemplatesTable/components/CreateTemplate/steps/VersionsDefinition/store/VersionsStore',
  () => ({
    useVersionsState: jest.fn(),
    useVersionsLists: jest.fn(),
    useVersionsApi: jest.fn(),
  }),
);

it('expect Versions Definitions to render correctly', () => {
  const mockVersionsState = {
    selectedArchitecture: 'aarch64',
    selectedOSVersion: '9',
    isExpandedList: {
      architecture: false,
      osVersion: false,
    },
  };
  const mockVersionsLists = {
    architectures: [{ descriptor: 'aarch64', displayName: 'aarch64' }],
    osVersions: [{ descriptor: '9', displayName: 'el9' }],
  };
  const mockVersionsApi = {
    onSelectArchitecture: () => {},
    onSelectOSVersion: () => {},
    updateIsExpandedList: () => {},
    toggleIsExpandedList: () => {},
  };

  (useVersionsLists as jest.Mock).mockImplementation(() => mockVersionsLists);
  (useVersionsState as jest.Mock).mockImplementation(() => mockVersionsState);
  (useVersionsApi as jest.Mock).mockImplementation(() => mockVersionsApi);

  const { getByText } = render(<VersionDefinitions />);

  const archTextBox = getByText(mockVersionsState.selectedArchitecture);

  expect(archTextBox).toBeInTheDocument();
  expect(archTextBox).not.toHaveAttribute('disabled');

  const versionTextBox = getByText('el' + mockVersionsState.selectedOSVersion);

  expect(versionTextBox).toBeInTheDocument();
  expect(versionTextBox).not.toHaveAttribute('disabled');
});
