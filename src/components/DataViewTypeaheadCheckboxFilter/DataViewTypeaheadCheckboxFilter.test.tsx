import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import DataViewTypeaheadCheckboxFilter, {
  DataViewTypeaheadCheckboxFilterProps,
} from './DataViewTypeaheadCheckboxFilter';

const armLabel = 'Red Hat Enterprise Linux for ARM 64';
const x86Label = 'Red Hat Enterprise Linux for x86_64';
const openshiftLabel = 'Red Hat OpenShift Container Platform';
const options = [
  { label: armLabel, value: 'RHEL-OS-aarch64' },
  { label: x86Label, value: 'RHEL-OS-x86_64' },
  { label: openshiftLabel, value: 'OPENSHIFT-OCP-x86_64' },
];

const FilterHarness = ({
  initialValues = [],
  onChange,
  ...props
}: Partial<DataViewTypeaheadCheckboxFilterProps> & { initialValues?: string[] }) => {
  const [values, setValues] = useState(initialValues);

  return (
    <DataViewToolbar
      clearAllFilters={() => setValues([])}
      filters={
        <DataViewTypeaheadCheckboxFilter
          filterId='feature_products'
          title='Product'
          aria-label='Filter products'
          placeholder='Filter by product'
          options={options}
          value={values}
          {...props}
          onChange={(event, nextValues) => {
            setValues(nextValues ?? []);
            onChange?.(event, nextValues);
          }}
        />
      }
    />
  );
};

const getInput = () => screen.getByRole('combobox', { name: 'Filter products' });

it('filters option labels using a case-insensitive substring search', async () => {
  const user = userEvent.setup();
  render(<FilterHarness />);

  await user.type(getInput(), 'aRm 64');

  expect(screen.getByRole('checkbox', { name: armLabel })).not.toBeChecked();
  expect(screen.queryByRole('checkbox', { name: x86Label })).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: openshiftLabel })).not.toBeInTheDocument();
});

it('clears the search without clearing selected values', async () => {
  const user = userEvent.setup();
  render(<FilterHarness initialValues={['RHEL-OS-aarch64']} />);

  await user.type(getInput(), 'x86');
  await user.click(screen.getByRole('button', { name: 'Clear Product search' }));

  expect(getInput()).toHaveValue('');
  expect(getInput()).toHaveFocus();
  expect(screen.getByRole('checkbox', { name: armLabel })).toBeChecked();
  expect(screen.getAllByRole('checkbox')).toHaveLength(3);
});

it('preserves selections when searching for and selecting another option', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<FilterHarness onChange={onChange} />);

  await user.type(getInput(), 'ARM');
  await user.click(screen.getByRole('checkbox', { name: armLabel }));
  await user.clear(getInput());
  await user.type(getInput(), 'x86');
  await user.click(screen.getByRole('checkbox', { name: x86Label }));
  await user.clear(getInput());

  expect(screen.getByRole('checkbox', { name: armLabel })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: x86Label })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: openshiftLabel })).not.toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith(expect.anything(), [
    'RHEL-OS-aarch64',
    'RHEL-OS-x86_64',
  ]);
  expect(getInput()).toHaveFocus();
});

it('removes only the unchecked option from the selected values', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(
    <FilterHarness initialValues={['RHEL-OS-aarch64', 'RHEL-OS-x86_64']} onChange={onChange} />,
  );

  await user.click(getInput());
  await user.click(screen.getByRole('checkbox', { name: armLabel }));

  expect(screen.getByRole('checkbox', { name: armLabel })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: x86Label })).toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith(expect.anything(), ['RHEL-OS-x86_64']);
});

it('reflects selected values supplied by the parent', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<FilterHarness value={['RHEL-OS-aarch64']} />);

  await user.click(getInput());
  expect(screen.getByRole('checkbox', { name: armLabel })).toBeChecked();

  rerender(<FilterHarness value={['RHEL-OS-x86_64']} />);

  expect(screen.getByRole('checkbox', { name: armLabel })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: x86Label })).toBeChecked();
});

it('removes a selected value through its applied filter chip', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(
    <FilterHarness initialValues={['RHEL-OS-aarch64', 'RHEL-OS-x86_64']} onChange={onChange} />,
  );

  await user.click(screen.getByRole('button', { name: `Close ${armLabel}` }));
  await user.click(getInput());

  expect(screen.getByRole('checkbox', { name: armLabel })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: x86Label })).toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith(undefined, ['RHEL-OS-x86_64']);
});

it('resets the search and selections when all toolbar filters are cleared', async () => {
  const user = userEvent.setup();
  render(<FilterHarness initialValues={['RHEL-OS-aarch64']} />);

  await user.type(getInput(), 'x86');
  await user.click(screen.getByRole('button', { name: 'Clear filters' }));

  expect(getInput()).toHaveValue('');
  expect(screen.queryByRole('button', { name: `Close ${armLabel}` })).not.toBeInTheDocument();
  await user.click(getInput());
  expect(screen.getByRole('checkbox', { name: armLabel })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: x86Label })).not.toBeChecked();
});

it('shows a non-selectable custom message when no options match', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<FilterHarness noResultsMessage='No products found' onChange={onChange} />);

  await user.type(getInput(), 'no-such-product');
  await user.keyboard('{ArrowDown}{Enter}');

  expect(screen.getByText('No products found')).toBeVisible();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

it('handles an empty options list without emitting a selection', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<FilterHarness options={[]} onChange={onChange} />);

  await user.click(getInput());
  await user.keyboard('{ArrowUp}{Enter}');

  expect(screen.getByText('No results found')).toBeVisible();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

it.each([
  ['selects the first option with ArrowDown', '{ArrowDown}{Enter}', armLabel, 'RHEL-OS-aarch64'],
  [
    'selects the second option with successive ArrowDown presses',
    '{ArrowDown}{ArrowDown}{Enter}',
    x86Label,
    'RHEL-OS-x86_64',
  ],
  [
    'selects the last option with ArrowUp',
    '{ArrowUp}{Enter}',
    openshiftLabel,
    'OPENSHIFT-OCP-x86_64',
  ],
  [
    'wraps from the first option to the last with ArrowUp',
    '{ArrowDown}{ArrowUp}{Enter}',
    openshiftLabel,
    'OPENSHIFT-OCP-x86_64',
  ],
  [
    'wraps from the last option to the first with ArrowDown',
    '{ArrowUp}{ArrowDown}{Enter}',
    armLabel,
    'RHEL-OS-aarch64',
  ],
])('%s', async (_description, keys, label, value) => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<FilterHarness onChange={onChange} />);

  getInput().focus();
  await user.keyboard(keys);

  expect(screen.getByRole('checkbox', { name: label })).toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith(undefined, [value]);
  expect(getInput()).toHaveFocus();
});

it('opens with Enter and toggles the highlighted checkbox with Enter', async () => {
  const user = userEvent.setup();
  render(<FilterHarness />);

  getInput().focus();
  await user.keyboard('{Enter}');
  expect(screen.getAllByRole('checkbox')).toHaveLength(3);

  await user.keyboard('{ArrowDown}{Enter}');
  expect(screen.getByRole('checkbox', { name: armLabel })).toBeChecked();

  await user.keyboard('{Enter}');
  expect(screen.getByRole('checkbox', { name: armLabel })).not.toBeChecked();
});

it('resets the highlighted option when the search changes', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<FilterHarness onChange={onChange} />);

  await user.click(getInput());
  await user.keyboard('{ArrowDown}');
  await user.type(getInput(), 'x86');
  await user.keyboard('{Enter}');

  expect(onChange).not.toHaveBeenCalled();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(screen.getByRole('checkbox', { name: x86Label })).toBeChecked();
});

it('closes on Escape from the menu and restores input focus', async () => {
  const user = userEvent.setup();
  render(<FilterHarness initialValues={['RHEL-OS-aarch64']} />);

  await user.click(getInput());
  screen.getByRole('checkbox', { name: armLabel }).focus();
  await user.keyboard('{Escape}');

  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(getInput()).toHaveFocus();
  await user.click(getInput());
  expect(screen.getByRole('checkbox', { name: armLabel })).toBeChecked();
});

it('closes the menu when tabbing away from the input', async () => {
  const user = userEvent.setup();
  render(<FilterHarness />);

  await user.click(getInput());
  expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  await user.tab();

  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(getInput()).not.toHaveFocus();
});

it('closes on outside clicks without losing selected values', async () => {
  const user = userEvent.setup();
  render(<FilterHarness initialValues={['RHEL-OS-aarch64']} />);

  await user.click(getInput());
  await user.click(document.body);

  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  await user.click(getInput());
  expect(screen.getByRole('checkbox', { name: armLabel })).toBeChecked();
});

it('opens and closes using the toggle while keeping input focus', async () => {
  const user = userEvent.setup();
  render(<FilterHarness />);
  const toggle = screen.getByRole('button', { name: 'Toggle Product filter' });

  await user.click(toggle);
  expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  expect(getInput()).toHaveFocus();

  await user.click(toggle);
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(getInput()).toHaveFocus();
});

it('disables the input and toggle without allowing the menu to open', async () => {
  const user = userEvent.setup();
  render(<FilterHarness isDisabled />);
  const toggle = screen.getByRole('button', { name: 'Toggle Product filter' });

  expect(getInput()).toBeDisabled();
  expect(toggle).toBeDisabled();
  await user.click(toggle);
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});

it('ignores chip removal while disabled', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<FilterHarness initialValues={['RHEL-OS-aarch64']} isDisabled onChange={onChange} />);

  await user.click(screen.getByRole('button', { name: `Close ${armLabel}` }));

  expect(screen.getByRole('button', { name: `Close ${armLabel}` })).toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

it('closes and clears the search when disabled while retaining selections', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<FilterHarness initialValues={['RHEL-OS-aarch64']} />);

  await user.type(getInput(), 'x86');
  rerender(<FilterHarness isDisabled />);

  expect(getInput()).toBeDisabled();
  expect(getInput()).toHaveValue('');
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

  rerender(<FilterHarness />);
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  await user.click(getInput());
  expect(screen.getByRole('checkbox', { name: armLabel })).toBeChecked();
});

it('hides the input and menu while retaining applied chips and selections', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<FilterHarness initialValues={['RHEL-OS-aarch64']} />);

  await user.type(getInput(), 'x86');
  rerender(<FilterHarness showToolbarItem={false} />);

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: `Close ${armLabel}` })).toBeInTheDocument();

  rerender(<FilterHarness />);
  expect(getInput()).toHaveValue('');
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  await user.click(getInput());
  expect(screen.getByRole('checkbox', { name: armLabel })).toBeChecked();
});
