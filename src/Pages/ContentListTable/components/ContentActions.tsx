import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { useState } from 'react';
import { useAppContext } from '../../../middleware/AppContext';

interface Props {
  atLeastOneRepoChecked: boolean;
  numberOfReposChecked: number;
  deleteCheckedRepos: () => void;
}

const ContentActions = ({
  atLeastOneRepoChecked,
  numberOfReposChecked,
  deleteCheckedRepos,
}: Props) => {
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
    <DropdownItem isDisabled={!atLeastOneRepoChecked} onClick={deleteCheckedRepos} key='delete'>
      Remove {numberOfReposChecked} repositories
    </DropdownItem>,
  ];

  return (
    <Dropdown
      onSelect={onSelect}
      toggle={<KebabToggle id='actions-kebab' onToggle={onToggle} isDisabled={!rbac?.write} />}
      isOpen={isOpen}
      isPlain
      dropdownItems={dropdownItems}
      direction='up'
    />
  );
};

export default ContentActions;
