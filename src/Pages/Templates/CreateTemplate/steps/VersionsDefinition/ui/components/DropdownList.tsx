import {
  DropdownItem as PFDropdownItem,
  DropdownList as PFDropdownList,
} from '@patternfly/react-core';
import { Architecture, OSVersion } from '../../../../core/types';

type DropdownItem = Architecture | OSVersion;

type DropdownListType<T extends DropdownItem> = {
  list: T[];
  isSelected: (item: T['descriptor']) => boolean;
};

export const DropdownList = <T extends DropdownItem>({ list, isSelected }: DropdownListType<T>) => (
  <PFDropdownList>
    {list.map((item) => (
      <PFDropdownItem
        key={item.descriptor}
        value={item.descriptor}
        isSelected={isSelected(item.descriptor)}
        component='button'
        data-ouia-component-id={`filter_${item.descriptor}`}
      >
        {item.displayName}
      </PFDropdownItem>
    ))}
  </PFDropdownList>
);
