import React from 'react';
import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  SelectOptionProps,
  MenuToggleProps,
  SelectProps,
} from '@patternfly/react-core';

interface Props extends Omit<SelectProps, 'toggle'> {
  toggleValue: string;
  toggleProps?: Partial<MenuToggleProps | unknown>;
  options: Partial<SelectOptionProps | unknown>[];
}

export default function DropdownSelect({ toggleValue, options, toggleProps = {}, ...rest }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Select
      isOpen={isOpen}
      onOpenChange={(nextOpen: boolean) => setIsOpen(nextOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} {...toggleProps} data-ouia-component-type="PF5/Button">
          {toggleValue}
        </MenuToggle>
      )}
      popperProps={{ appendTo: document.body }}
      {...rest}
    >
      <SelectList>
        {options.map((option, index) => (
          <SelectOption key={index} {...option} />
        ))}
      </SelectList>
    </Select>
  );
}
