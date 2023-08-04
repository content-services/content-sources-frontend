import React, { useState } from 'react';
import { Dropdown, DropdownItem, Button } from '@patternfly/react-core';
import { useAppContext } from '../../../middleware/AppContext';
import { global_disabled_color_100, global_disabled_color_200 } from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import { DropdownToggle, DropdownToggleAction } from '@patternfly/react-core/deprecated';

const useStyles = createUseStyles({
  disabledButton: {
    color: global_disabled_color_100.value + ' !important',
    backgroundColor: global_disabled_color_200.value + ' !important',
  },
});

export interface Props {
  isDisabled: boolean;
  addRepo: (snapshot: boolean) => void;
}

export const AddRepo = ({ isDisabled, addRepo }: Props) => {
  const { features } = useAppContext();
  const classes = useStyles();
  const [isActionOpen, setIsActionOpen] = useState(false);

  const onActionToggle = (_, isActionOpen: boolean) => {
    setIsActionOpen(isActionOpen);
  };

  const onActionFocus = () => {
    const element = document.getElementById('toggle-add');
    element?.focus();
  };

  const onActionSelect = () => {
    setIsActionOpen(false);
    onActionFocus();
  };

  const dropdownItems = [
    <DropdownItem key='action' component='button' onClick={() => addRepo(false)}>
      Add Without Snapshotting
    </DropdownItem>,
  ];

  if (features?.snapshots?.enabled && features.snapshots.accessible) {
    const className = isDisabled ? classes.disabledButton : undefined;
    return (
      <Dropdown
        onSelect={onActionSelect}
        toggle={() => (
          <DropdownToggle
            id='toggle-add'
            className={className}
            splitButtonItems={[
              <DropdownToggleAction
                key='action'
                onClick={() => addRepo(true)}
                className={className}
              >
                Add
              </DropdownToggleAction>,
            ]}
            toggleVariant='primary'
            splitButtonVariant='action'
            onToggle={onActionToggle}
            isDisabled={isDisabled}
            ouiaId='add_popular_repo'
          />
        )}
        isOpen={isActionOpen}
      >
        {dropdownItems}
      </Dropdown>
    );
  } else {
    return (
      <Button
        variant='secondary'
        isDisabled={isDisabled}
        onClick={() => addRepo(false)}
        ouiaId='add_popular_repo'
      >
        Add
      </Button>
    );
  }
};
