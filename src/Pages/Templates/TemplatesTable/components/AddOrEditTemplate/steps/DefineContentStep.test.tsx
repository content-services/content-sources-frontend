import { render } from '@testing-library/react';
import { useAddOrEditTemplateContext } from '../AddOrEditTemplateContext';
import {
  defaultTemplateItem,
  testRepositoryParamsResponse,
  ReactQueryTestWrapper,
} from 'testingHelpers';
import DefineContentStep from './DefineContentStep';
import useDistributionDetails from '../../../../../../Hooks/useDistributionDetails';

jest.mock('../AddOrEditTemplateContext', () => ({
  useAddOrEditTemplateContext: jest.fn(),
}));

jest.mock('../../../../../../Hooks/useDistributionDetails', () => ({
  __esModule: true,
  default: jest.fn(),
}));

it('expect DefineContentStep to render correctly', () => {
  (useAddOrEditTemplateContext as jest.Mock).mockImplementation(() => ({
    isEdit: false,
    templateRequest: defaultTemplateItem,
    setTemplateRequest: () => undefined,
    distribution_arches: testRepositoryParamsResponse.distribution_arches,
    distribution_versions: testRepositoryParamsResponse.distribution_versions,
    extended_release_features: testRepositoryParamsResponse.extended_release_features,
    distribution_minor_versions: testRepositoryParamsResponse.distribution_minor_versions,
  }));

  const versionDisplay = `RHEL ${defaultTemplateItem.version}`;

  (useDistributionDetails as jest.Mock).mockImplementation(() => ({
    versionDisplay: () => versionDisplay,
  }));

  const { getByText } = render(
    <ReactQueryTestWrapper>
      <DefineContentStep />
    </ReactQueryTestWrapper>,
  );

  const archMenuToggle = getByText(defaultTemplateItem.arch);
  expect(archMenuToggle).toBeInTheDocument();
  expect(archMenuToggle).not.toHaveAttribute('disabled');

  const versionMenuToggle = getByText(versionDisplay);
  expect(versionMenuToggle).toBeInTheDocument();
  expect(versionMenuToggle).not.toHaveAttribute('disabled');
});

it('expect DefineContentStep to render with disabled inputs', () => {
  (useAddOrEditTemplateContext as jest.Mock).mockImplementation(() => ({
    isEdit: true,
    templateRequest: defaultTemplateItem,
    setTemplateRequest: () => undefined,
    distribution_arches: testRepositoryParamsResponse.distribution_arches,
    distribution_versions: testRepositoryParamsResponse.distribution_versions,
    extended_release_features: testRepositoryParamsResponse.extended_release_features,
    distribution_minor_versions: testRepositoryParamsResponse.distribution_minor_versions,
  }));

  const { getByTestId } = render(
    <ReactQueryTestWrapper>
      <DefineContentStep />
    </ReactQueryTestWrapper>,
  );

  const archMenuToggle = getByTestId('restrict_to_architecture');
  expect(archMenuToggle).toBeInTheDocument();
  expect(archMenuToggle).toHaveAttribute('disabled');

  const versionMenuToggle = getByTestId('restrict_to_os_version');
  expect(versionMenuToggle).toBeInTheDocument();
  expect(versionMenuToggle).toHaveAttribute('disabled');
});
