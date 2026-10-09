import { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';

type Action = { label: string; isDisabled: boolean; tooltip?: string; navigate: () => void };

interface SnapshotsPrimaryActionButtonProps {
  isFetchingOrLoading: boolean;
  actions: {
    deleteAction: Action;
    publishAction: Action;
  };
  canPublish: boolean;
}

export const SnapshotsPrimaryActionButton = ({
  actions,
  isFetchingOrLoading,
  canPublish,
}: SnapshotsPrimaryActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { deleteAction, publishAction } = actions;

  console.log('deleteAction', deleteAction);

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      onOpenChange={setIsOpen}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          variant='primary'
          isExpanded={isOpen}
          isDisabled={isFetchingOrLoading}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          Actions
        </MenuToggle>
      )}
      ouiaId='snapshot_bulk_actions'
      shouldFocusToggleOnSelect
    >
      <DropdownList>
        <ConditionalTooltip
          key='delete-action'
          content={deleteAction.tooltip}
          show={!!deleteAction.tooltip}
        >
          <DropdownItem
            value='delete'
            ouiaId='remove_snapshots_bulk'
            isDisabled={deleteAction.isDisabled}
            onClick={deleteAction.navigate}
          >
            {deleteAction.label}
          </DropdownItem>
        </ConditionalTooltip>
        {canPublish && (
          <ConditionalTooltip
            key='publish-action'
            content={publishAction.tooltip}
            show={!!publishAction.tooltip}
          >
            <DropdownItem
              value='publish'
              ouiaId='publish_snapshot_bulk'
              isDisabled={publishAction.isDisabled}
              onClick={publishAction.navigate}
            >
              {publishAction.label}
            </DropdownItem>
          </ConditionalTooltip>
        )}
      </DropdownList>
    </Dropdown>
  );
};
