import { render } from '@testing-library/react';

import { defaultTemplateItem } from 'testingHelpers';
import { formatDateDDMMMYYYY } from 'helpers';

import ReviewTemplateRequest from './ReviewTemplateRequest';
import { useReviewTemplateState } from '../store/ReviewTemplateStore';

jest.mock(
  '@src/Pages/Templates/TemplatesTable/components/CreateTemplate/steps/ReviewTemplate/store/ReviewTemplateStore',
  () => ({
    useReviewTemplateState: jest.fn(),
  }),
);

it('expect Review step to render correctly', () => {
  const templateRequest = {
    selectedArchitecture: defaultTemplateItem.arch,
    selectedOSVersion: defaultTemplateItem.version,
    hardcodedUUIDs: defaultTemplateItem.repository_uuids.slice(0, 2),
    additionalUUIDs: defaultTemplateItem.repository_uuids.slice(2),
    otherUUIDs: [],
    isLatestSnapshot: defaultTemplateItem.use_latest,
    snapshotDate: formatDateDDMMMYYYY(defaultTemplateItem.date),
    title: defaultTemplateItem.name,
    detail: defaultTemplateItem.description,
  };
  const templateReview = {
    Content: {
      Architecture: templateRequest.selectedArchitecture,
      'OS version': `el${templateRequest.selectedOSVersion}`,
      'Number of Pre-selected Red Hat repositories': templateRequest.hardcodedUUIDs.length,
      'Number of Additional Red Hat repositories': templateRequest.additionalUUIDs.length,
      'Number of Custom or EPEL repositories': templateRequest.otherUUIDs.length,
    },
    'Repository Version': {
      'Snapshots from': templateRequest.snapshotDate,
    },
    'Template Description': {
      Title: templateRequest.title,
      Detail: templateRequest.detail,
    },
  };

  (useReviewTemplateState as jest.Mock).mockImplementation(() => ({ templateReview }));

  const { getByText } = render(<ReviewTemplateRequest />);

  expect(getByText('Create')).toBeInTheDocument();
  expect(getByText(defaultTemplateItem.arch)).toBeInTheDocument();
  expect(getByText('el' + defaultTemplateItem.version)).toBeInTheDocument();
  expect(getByText(formatDateDDMMMYYYY(defaultTemplateItem.date))).toBeInTheDocument();
  expect(getByText(defaultTemplateItem.name)).toBeInTheDocument();
});
