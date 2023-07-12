import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { useState } from 'react';
import ConditionalTooltip from '../../../components/ConditionalTooltip/ConditionalTooltip';
import { useAppContext } from '../../../middleware/AppContext';

interface Props {
  atLeastOneRepoChecked: boolean;
  deleteCheckedRepos: () => void;
}

const ContentActions = ({ atLeastOneRepoChecked, deleteCheckedRepos }: Props) => {
  const { rbac } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onFocus = () => {
    const element = document.getElementById('actions-kebab') as HTMLElement;
    element.focus();
  };

  const onSelect = () => {
    setIsOpen(false);
    onFocus();
  };

  const dropdownItems = [
    <ConditionalTooltip
      content='You do not have the required permissions to perform this action.'
      show={!rbac?.write}
      key='delete'
      setDisabled
    >
      <DropdownItem isDisabled={!atLeastOneRepoChecked} onClick={deleteCheckedRepos}>
        Remove all
      </DropdownItem>
    </ConditionalTooltip>,
  ];

  return (
    <Dropdown
      onSelect={onSelect}
      toggle={<KebabToggle id='actions-kebab' onToggle={onToggle} />}
      isOpen={isOpen}
      isPlain
      dropdownItems={dropdownItems}
      direction='up'
    />
  );
};

export default ContentActions;
