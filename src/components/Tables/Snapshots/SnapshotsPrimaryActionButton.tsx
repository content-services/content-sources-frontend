import { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';

interface SnapshotsPrimaryActionButtonProps {
  isFetchingOrLoading: boolean;
  // Whether the repo supports publishing AND the action isn't a hidden
  // Unpublish (B8/U1) - renamed from `canPublish` since it now encodes both.
  isPublishActionVisible: boolean;
  onPublishClick: () => void;
  isPublishDisabled: boolean;
  publishTooltip?: string;
  publishButtonLabel: string;
  actions: any;
}

export const SnapshotsPrimaryActionButton = ({
  actions,
  isFetchingOrLoading,
  isPublishActionVisible,
  onPublishClick,
  isPublishDisabled,
  publishTooltip,
  publishButtonLabel,
}: SnapshotsPrimaryActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { deleteAction, publishAction } = actions;

  // U3a: if every action that would actually render inside is disabled,
  // disable the toggle too - there's nothing useful to do behind it. Delete
  // always renders; Publish/Unpublish only counts when it's visible at all.
  //   const isEveryActionDisabled = isDeleteDisabled && (!isPublishActionVisible || isPublishDisabled);

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
          setDisabled
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
        {isPublishActionVisible && (
          <ConditionalTooltip
            key='publish-action'
            content={publishTooltip}
            show={!!publishTooltip}
            setDisabled
          >
            <DropdownItem
              value='publish'
              ouiaId='publish_snapshot_bulk'
              isDisabled={isPublishDisabled}
              onClick={onPublishClick}
            >
              {publishButtonLabel}
            </DropdownItem>
          </ConditionalTooltip>
        )}
      </DropdownList>
    </Dropdown>
  );
};
