import { render, screen } from '@testing-library/react';

import Beacon from './Beacon';
import type { Features } from 'services/Features/FeatureApi';

jest.mock('@scalprum/react-core', () => ({
  useRemoteHook: jest.fn(),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useFlag: jest.fn(() => true),
}));

jest.mock('Hooks/Lightwell/navigation/useLightwellRootPath', () => ({
  useLightwellRootPath: jest.fn(() => '/lightwell'),
}));

jest.mock('./BeaconTable', () => ({
  __esModule: true,
  default: () => <div data-testid='beacon-table'>BeaconTable stub</div>,
}));

jest.mock('./BeaconIntake', () => ({
  __esModule: true,
  default: () => <div>BeaconIntake stub</div>,
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: jest.fn(),
}));

import { useAppContext } from 'middleware/AppContext';

const ON = { enabled: true, accessible: true };
const OFF = { enabled: false, accessible: false };

const renderWithFeatures = (features: Features) => {
  (useAppContext as jest.Mock).mockReturnValue({ features });
  return render(<Beacon />);
};

it('shows the table and not the intake when only lightwellbeacon is on', () => {
  renderWithFeatures({ lightwellbeacon: ON });

  expect(screen.getByText('BeaconTable stub')).toBeInTheDocument();
  expect(screen.queryByText('BeaconIntake stub')).not.toBeInTheDocument();
});

it('shows the intake and not the table when only lightwellclearinghouse is on', () => {
  renderWithFeatures({ lightwellclearinghouse: ON });

  expect(screen.getByText('BeaconIntake stub')).toBeInTheDocument();
  expect(screen.queryByText('BeaconTable stub')).not.toBeInTheDocument();
});

it('shows the intake when only lightwellclearinghouseread is on', () => {
  renderWithFeatures({ lightwellclearinghouseread: ON });

  expect(screen.getByText('BeaconIntake stub')).toBeInTheDocument();
  expect(screen.queryByText('BeaconTable stub')).not.toBeInTheDocument();
});

it('stacks both the intake and the table when clearinghouse and beacon are on', () => {
  renderWithFeatures({ lightwellbeacon: ON, lightwellclearinghouse: ON });

  expect(screen.getByText('BeaconIntake stub')).toBeInTheDocument();
  expect(screen.getByText('BeaconTable stub')).toBeInTheDocument();
});

it('renders neither when flags are enabled but not accessible', () => {
  renderWithFeatures({ lightwellbeacon: OFF, lightwellclearinghouse: OFF });

  expect(screen.queryByText('BeaconTable stub')).not.toBeInTheDocument();
  expect(screen.queryByText('BeaconIntake stub')).not.toBeInTheDocument();
});
