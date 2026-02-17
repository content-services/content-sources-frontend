import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Form,
  FormGroup,
  MenuToggle,
} from '@patternfly/react-core';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import { createUseStyles } from 'react-jss';
import { useDefineContentApi } from '../../store/DefineContentStore';

const useStyles = createUseStyles({
  fullWidth: {
    width: '100%!important',
    maxWidth: 'unset!important',
  },
});

export const DropdownGroup = () => {
  const classes = useStyles();

  const {
    distribution_versions,
    distribution_arches,
    templateRequest,
    setTemplateRequest,
    setArchOpen,
    isEdit,
    archOpen,
    archesDisplay,
    setVersionOpen,
    versionDisplay,
    versionOpen,
  } = useDefineContentApi();

  return (
    <Form>
      <FormGroup label='Architecture' isRequired>
        <Dropdown
          onSelect={(_, val) => {
            setTemplateRequest((prev) => ({ ...prev, arch: val as string }));
            setArchOpen(false);
          }}
          toggle={(toggleRef) => (
            <ConditionalTooltip
              position='top-start'
              content='Architecture cannot be changed after creation.'
              show={!!isEdit}
              setDisabled
            >
              <MenuToggle
                ref={toggleRef}
                className={classes.fullWidth}
                isFullWidth
                aria-label='filter architecture'
                id='archSelection'
                ouiaId='restrict_to_architecture'
                onClick={() => setArchOpen((prev) => !prev)}
                isExpanded={archOpen}
              >
                {archesDisplay(templateRequest?.arch)}
              </MenuToggle>
            </ConditionalTooltip>
          )}
          onOpenChange={(isOpen) => setArchOpen(isOpen)}
          isOpen={archOpen}
        >
          <DropdownList>
            {distribution_arches
              .filter(({ label }) => ['x86_64', 'aarch64'].includes(label))
              .map(({ label, name }) => (
                <DropdownItem
                  key={label}
                  value={label}
                  isSelected={label === templateRequest?.arch}
                  component='button'
                  data-ouia-component-id={`filter_${label}`}
                >
                  {name}
                </DropdownItem>
              ))}
          </DropdownList>
        </Dropdown>
      </FormGroup>
      <FormGroup label='OS version' isRequired>
        <Dropdown
          onSelect={(_, val) => {
            setTemplateRequest((prev) => ({ ...prev, version: val as string }));
            setVersionOpen(false);
          }}
          toggle={(toggleRef) => (
            <ConditionalTooltip
              position='top-start'
              content='OS version cannot be changed after creation.'
              show={!!isEdit}
              setDisabled
            >
              <MenuToggle
                ref={toggleRef}
                className={classes.fullWidth}
                isFullWidth
                aria-label='filter OS version'
                id='versionSelection'
                ouiaId='restrict_to_os_version'
                onClick={() => setVersionOpen((prev) => !prev)}
                isExpanded={versionOpen}
              >
                {versionDisplay(templateRequest?.version)}
              </MenuToggle>
            </ConditionalTooltip>
          )}
          onOpenChange={(isOpen) => setVersionOpen(isOpen)}
          isOpen={versionOpen}
        >
          <DropdownList>
            {distribution_versions
              .filter(({ label }) => ['8', '9', '10'].includes(label))
              .map(({ label, name }) => (
                <DropdownItem
                  key={label}
                  value={label}
                  isSelected={label === templateRequest?.version}
                  component='button'
                  data-ouia-component-id={`filter_${label}`}
                >
                  {name}
                </DropdownItem>
              ))}
          </DropdownList>
        </Dropdown>
      </FormGroup>
    </Form>
  );
};
