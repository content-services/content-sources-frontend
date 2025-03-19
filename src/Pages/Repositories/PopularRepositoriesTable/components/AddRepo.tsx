import { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleAction,
} from '@patternfly/react-core';

export interface Props {
  isDisabled: boolean;
  addRepo: (snapshot: boolean) => void;
}

export const AddRepo = ({ isDisabled, addRepo }: Props) => {
  const [isActionOpen, setIsActionOpen] = useState(false);

  const onActionFocus = () => {
    const element = document.getElementById('toggle-add');
    element?.focus();
  };

  const onActionSelect = () => {
    setIsActionOpen(false);
    onActionFocus();
  };

  return (
    <Dropdown
      isOpen={isActionOpen}
      onSelect={onActionSelect}
      onOpenChange={(isOpen: boolean) => setIsActionOpen(isOpen)}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          isDisabled={isDisabled}
          id='toggle-add'
          variant='primary'
          onClick={() => setIsActionOpen((prev) => !prev)}
          ouiaId='add_popular_repo_toggle'
          onSelect={onActionSelect}
          splitButtonItems={[
            <MenuToggleAction
              isDisabled={isDisabled}
              data-ouia-component-id='add_popular_repo'
              key='action'
              onClick={() => addRepo(true)}
            >
              Add
            </MenuToggleAction>,
          ]}
          aria-label='add popular repo'
        />
      )}
      shouldFocusToggleOnSelect
    >
      <DropdownList>
        <DropdownItem
          data-ouia-component-id='add-popular_repo_without-snapshotting'
          key='action'
          component='button'
          onClick={() => addRepo(false)}
        >
          Add without snapshotting
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
