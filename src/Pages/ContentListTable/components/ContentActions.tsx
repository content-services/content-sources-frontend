import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { useState } from 'react';

interface Props {
  atLeastOneRepoChecked: boolean;
  deleteCheckedRepos: () => void;
}

const ContentActions = ({ atLeastOneRepoChecked, deleteCheckedRepos }: Props) => {
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
    <DropdownItem isDisabled={!atLeastOneRepoChecked} key='delete' onClick={deleteCheckedRepos}>
      Remove all
    </DropdownItem>,
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
