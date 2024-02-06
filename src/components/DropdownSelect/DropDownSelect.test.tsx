import { SelectVariant } from '@patternfly/react-core/deprecated';
import { fireEvent, render, waitFor } from '@testing-library/react';
import DropDownSelect from './DropdownSelect';

it('Render with SelectVariant.single', async () => {
  const { queryByText } = render(
    <DropDownSelect
      selectedProp='1'
      options={['1', '2', '3', '4']}
      variant={SelectVariant.single}
      setSelected={() => null}
    />,
  );
  const SelectComponent = queryByText('1');
  expect(SelectComponent).toBeInTheDocument();
  fireEvent.click(SelectComponent as Element);
  await waitFor(() => {
    expect(queryByText('2')).toBeInTheDocument();
    expect(queryByText('3')).toBeInTheDocument();
    expect(queryByText('4')).toBeInTheDocument();
  });
  fireEvent.click(queryByText('4') as Element);
});

it('Render with SelectVariant.multi', async () => {
  const { queryAllByText, queryByText, queryByRole } = render(
    <DropDownSelect
      aria-label='dropdown'
      selectedProp={['1', '2']}
      options={['1', '2', '3', '4']}
      variant={SelectVariant.typeaheadMulti}
      setSelected={() => null}
    />,
  );

  const textbox = queryByRole('textbox');
  expect(textbox).toBeInTheDocument();
  expect(queryByText('1')).toBeInTheDocument();
  expect(queryByText('2')).toBeInTheDocument();
  expect(queryByText('3')).not.toBeInTheDocument();
  expect(queryByText('4')).not.toBeInTheDocument();
  fireEvent.click(textbox as Element);
  await waitFor(() => {
    expect(queryByText('3')).toBeInTheDocument();
    expect(queryByText('4')).toBeInTheDocument();
  });
  fireEvent.click(queryByText('4') as Element);
  fireEvent.click(queryAllByText('1')[1] as Element);
});
