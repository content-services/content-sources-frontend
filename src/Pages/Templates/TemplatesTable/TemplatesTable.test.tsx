import { render } from '@testing-library/react';
import TemplatesTable from './TemplatesTable';
import { useTemplateList } from 'services/Templates/TemplateQueries';
import { ReactQueryTestWrapper, defaultTemplateItem } from 'testingHelpers';
import { formatDateDDMMMYYYY } from 'helpers';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

jest.mock('services/Templates/TemplateQueries', () => ({
  useTemplateList: jest.fn(),
  useDeleteTemplateItemMutate: () => ({ mutate: () => undefined, isLoading: false }),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({}),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Outlet: () => <></>,
}));

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({
    rbac: { repoWrite: true, templateRead: true },
    setContentOrigin: () => {},
  }),
}));

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: jest.fn(),
}));

(useChrome as jest.Mock).mockImplementation(() => ({
  getEnvironment: () => 'stage',
}));

it('expect TemplatesTable to render empty state', () => {
  (useTemplateList as jest.Mock).mockImplementation(() => ({
    isLoading: false,
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <TemplatesTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('No templates')).toBeInTheDocument();
  expect(
    queryByText(
      'Control the scope of packages and advisory updates to be installed on selected systems with templates. To get started, create a template.',
    ),
  ).toBeInTheDocument();
});

it('expect TemplatesTable to render a single row', () => {
  (useTemplateList as jest.Mock).mockImplementation(() => ({
    data: {
      data: [defaultTemplateItem],
      meta: { limit: 10, offset: 0, count: 1 },
      isLoading: false,
    },
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <TemplatesTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText(defaultTemplateItem.name)).toBeInTheDocument();
  expect(queryByText(formatDateDDMMMYYYY(defaultTemplateItem.date))).toBeInTheDocument();
});
