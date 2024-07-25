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
  toggleValue?: string;
  toggleProps?: Partial<MenuToggleProps>;
  options: Partial<SelectOptionProps>[];
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
        <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} {...toggleProps}>
          {toggleValue}
        </MenuToggle>
      )}
      popperProps={{ appendTo: document.body }}
      {...rest}
    >
      <SelectList>
        {options.map((option, index) => (
          <SelectOption key={index + option?.value} {...option} />
        ))}
      </SelectList>
    </Select>
  );
}
