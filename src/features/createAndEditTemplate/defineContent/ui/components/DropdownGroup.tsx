import { Dropdown, Form, FormGroup, MenuToggle } from '@patternfly/react-core';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import { useDefineContentApi } from '../../store/DefineContentStore';
import { useEditTemplateState } from 'features/createAndEditTemplate/editTemplate/store/EditTemplateStore';
import { DropdownList } from './DropdownList';
import {
  AllowedArchitecture,
  AllowedOSVersion,
} from 'features/createAndEditTemplate/shared/types/types';
import { useState } from 'react';

const toggle =
  ({ type, toggle, selectedItem, id, ouiaId, label, isExpanded, disabledTooltipText, show }) =>
  // eslint-disable-next-line react/display-name
  (toggleRef) => (
    <ConditionalTooltip position='top-start' content={disabledTooltipText} show={show} setDisabled>
      <MenuToggle
        ref={toggleRef}
        style={{ maxWidth: 'unset!important' }}
        isFullWidth
        aria-label={`filter ${label}`}
        id={id}
        ouiaId={ouiaId}
        onClick={() => toggle(type)}
        isExpanded={isExpanded}
      >
        {selectedItem?.displayName ?? `Select ${label}`}
      </MenuToggle>
    </ConditionalTooltip>
  );

export type IsListExpanded = {
  architecture: boolean;
  osVersion: boolean;
};

// type DropdownGroupType<T> = {
//   initial: T;
// };

const useDropdownGroup = () => {
  const [isExpanded, setIsExpandedList] = useState({
    architecture: false,
    osVersion: false,
  });

  const toggleIsExpandedList = (list) => {
    setIsExpandedList((state) => {
      const previous = state[list];
      return { ...state, [list]: !previous };
    });
  };

  const expandList = (patch) => {
    setIsExpandedList((state) => ({ ...state, ...patch }));
  };

  return { toggleIsExpandedList, isExpanded, expandList };
};

export const DropdownGroup = () => {
  const { isEditTemplate } = useEditTemplateState();

  const { toggleIsExpandedList, isExpanded, expandList } = useDropdownGroup();

  const {
    selectedArchitecture,
    selectedOSVersion,
    onSelectArchitecture,
    onSelectOSVersion,
    architectures,
    osVersions,
    isArchitectureItemSelected,
    isOSVersionItemSelected,
  } = useDefineContentApi();

  const toggleArchProps = {
    type: 'architecture',
    toggle: toggleIsExpandedList,
    selectedItem: architectures.filter(({ descriptor }) => descriptor === selectedArchitecture)[0],
    id: 'archSelection',
    ouiaId: 'restrict_to_architecture',
    label: 'architecture',
    isExpanded: isExpanded['architecture'],
    disabledTooltipText: 'Architecture cannot be changed after creation.',
    show: isEditTemplate,
  };
  const toggleVersionProps = {
    type: 'osVersion',
    toggle: toggleIsExpandedList,
    selectedItem: osVersions.filter(({ descriptor }) => descriptor === selectedOSVersion)[0],
    id: 'versionSelection',
    ouiaId: 'restrict_to_os_version',
    label: 'OS version',
    isExpanded: isExpanded['osVersion'],
    disabledTooltipText: 'OS version cannot be changed after creation.',
    show: isEditTemplate,
  };

  const handleSelectArchitecture = (_, val) => {
    onSelectArchitecture(val as AllowedArchitecture);
    expandList({ architecture: false });
  };

  const handleSelectOSVersion = (_, val) => {
    onSelectOSVersion(val as AllowedOSVersion);
    expandList({ osVersion: false });
  };

  return (
    <Form>
      <FormGroup label='Architecture' isRequired>
        <Dropdown
          onSelect={handleSelectArchitecture}
          toggle={toggle(toggleArchProps)}
          onOpenChange={(isOpen) => expandList({ architecture: isOpen })}
          isOpen={isExpanded['architecture']}
        >
          <DropdownList list={architectures} isSelected={isArchitectureItemSelected} />
        </Dropdown>
      </FormGroup>
      <FormGroup label='OS version' isRequired>
        <Dropdown
          onSelect={handleSelectOSVersion}
          toggle={toggle(toggleVersionProps)}
          onOpenChange={(isOpen) => expandList({ osVersion: isOpen })}
          isOpen={isExpanded['osVersion']}
        >
          <DropdownList list={osVersions} isSelected={isOSVersionItemSelected} />
        </Dropdown>
      </FormGroup>
    </Form>
  );
};
