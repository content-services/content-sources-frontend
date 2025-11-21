import { Dropdown, Form, FormGroup, MenuToggle } from '@patternfly/react-core';
import { DropdownList } from './DropdownList';
import { useVersionsApi, useVersionsLists, useVersionsState } from '../../store/VersionsStore';
import { AllowedArchitecture, AllowedOSVersion } from '../../../../core/types';

const toggle =
  ({ type, toggle, selectedItem, id, ouiaId, label, isExpanded }) =>
  // eslint-disable-next-line react/display-name
  (toggleRef) => (
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
  );

export const VersionsDropdownGroup = () => {
  const { architectures, osVersions } = useVersionsLists();

  const { onSelectArchitecture, onSelectOSVersion, toggleIsExpandedList, updateIsExpandedList } =
    useVersionsApi();
  const {
    isExpandedList,
    isArchitectureItemSelected,
    isOSVersionItemSelected,
    selectedArchitecture,
    selectedOSVersion,
  } = useVersionsState();

  const toggleArchProps = {
    type: 'architecture',
    toggle: toggleIsExpandedList,
    selectedItem: architectures.filter(({ descriptor }) => descriptor === selectedArchitecture)[0],
    id: 'archSelection',
    ouiaId: 'restrict_to_architecture',
    label: 'architecture',
    isExpanded: isExpandedList['architecture'],
  };
  const toggleVersionProps = {
    type: 'osVersion',
    toggle: toggleIsExpandedList,
    selectedItem: osVersions.filter(({ descriptor }) => descriptor === selectedOSVersion)[0],
    id: 'versionSelection',
    ouiaId: 'restrict_to_os_version',
    label: 'OS version',
    isExpanded: isExpandedList['osVersion'],
  };

  return (
    <Form>
      <FormGroup label='Architecture' isRequired>
        <Dropdown
          onSelect={(_, val) => onSelectArchitecture(val as AllowedArchitecture)}
          onOpenChange={(isOpen) => updateIsExpandedList({ architecture: isOpen })}
          isOpen={isExpandedList['architecture']}
          toggle={toggle(toggleArchProps)}
        >
          <DropdownList list={architectures} isSelected={isArchitectureItemSelected} />
        </Dropdown>
      </FormGroup>

      <FormGroup label='OS version' isRequired>
        <Dropdown
          onOpenChange={(isOpen) => updateIsExpandedList({ osVersion: isOpen })}
          isOpen={isExpandedList['osVersion']}
          onSelect={(_, val) => onSelectOSVersion(val as AllowedOSVersion)}
          toggle={toggle(toggleVersionProps)}
        >
          <DropdownList list={osVersions} isSelected={isOSVersionItemSelected} />
        </Dropdown>
      </FormGroup>
    </Form>
  );
};
