import {
  Dropdown,
  DropdownItem,
  DropdownList,
  DropdownProps,
  MenuToggle,
  MenuToggleProps,
  type DropdownItemProps,
} from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { useState } from 'react';

const useStyles = createUseStyles({
  menuToggle: {
    maxWidth: 'unset!important', // Remove arbitrary button width
  },
});

export interface DropDownMenuProps {
  menuValue: string;
  dropDownItems?: DropdownItemProps[];
  onSelect?: (value?: string | number | undefined) => void;
  isDisabled?: boolean;
  menuToggleProps?: Partial<MenuToggleProps | unknown>;
  dropDownProps?: Partial<DropdownProps>;
}

export default function DropdownMenu({
  onSelect = () => undefined,
  dropDownItems = [],
  menuValue,
  isDisabled,
  menuToggleProps,
  dropDownProps,
}: DropDownMenuProps) {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          isFullWidth
          className={classes.menuToggle}
          onClick={onToggleClick}
          isDisabled={isDisabled}
          {...menuToggleProps}
        >
          {menuValue}
        </MenuToggle>
      )}
      onSelect={(_, value) => {
        onSelect(value);
        setIsOpen(false);
      }}
      shouldFocusToggleOnSelect
      {...dropDownProps}
    >
      <DropdownList>
        {dropDownItems.map(({ label, ...props }, index) => (
          <DropdownItem key={label || '' + index} {...props}>
            {label}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
}
