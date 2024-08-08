import {
  Select,
  MenuToggle,
  MenuToggleProps,
  SelectList,
  SelectOption,
  type SelectOptionProps,
  type SelectProps,
} from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { useState } from 'react';

const useStyles = createUseStyles({
  menuToggle: {
    maxWidth: 'unset!important', // Remove arbitrary button width
  },
});

export interface DropDownSelectProps extends Omit<SelectProps, 'toggle'> {
  menuValue: string;
  dropDownItems?: SelectOptionProps[];
  isDisabled?: boolean;
  multiSelect?: boolean; // Prevents close behaviour on select
  menuToggleProps?: Partial<MenuToggleProps | unknown>;
}

// Use with checkboxes
export default function DropdownSelect({
  onSelect = () => undefined,
  dropDownItems = [],
  menuValue,
  isDisabled,
  multiSelect,
  menuToggleProps,
  ...rest
}: DropDownSelectProps) {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Select
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          isFullWidth
          isExpanded={isOpen}
          className={classes.menuToggle}
          onClick={onToggleClick}
          isDisabled={isDisabled}
          {...menuToggleProps}
        >
          {menuValue}
        </MenuToggle>
      )}
      onSelect={(_, value) => {
        onSelect(_, value);
        !multiSelect && setIsOpen(false);
      }}
      {...rest}
    >
      <SelectList>
        {dropDownItems.map(({ label, ...props }, index) => (
          <SelectOption key={label || '' + index} {...props} />
        ))}
      </SelectList>
    </Select>
  );
}
