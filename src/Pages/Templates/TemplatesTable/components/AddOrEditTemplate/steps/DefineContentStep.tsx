import {
  ExpandableSection,
  Form,
  FormGroup,
  Grid,
  Content,
  ContentVariants,
  Title,
  MenuToggle,
  Dropdown,
  DropdownItem,
  DropdownList,
} from '@patternfly/react-core';
import { useAddOrEditTemplateContext } from '../AddOrEditTemplateContext';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { SUPPORTED_ARCHES, EUS, E4S, SUPPORTED_MAJOR_VERSIONS } from '../../templateHelpers';
import useDistributionDetails from '../../../../../../Hooks/useDistributionDetails';
import { toRhelDisplayName } from '../../../../../../helpers';

const useStyles = createUseStyles({
  fullWidth: {
    width: '100%!important',
    maxWidth: 'unset!important',
  },
});

export default function DefineContentStep() {
  const [archOpen, setArchOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);

  const {
    isEdit,
    templateRequest,
    setTemplateRequest,
    distribution_versions,
    distribution_arches,
  } = useAddOrEditTemplateContext();

  const { versionDisplay, getStreamAvailability } = useDistributionDetails();

  const archesDisplay = (arch?: string) =>
    distribution_arches.find(({ label }) => arch === label)?.name || 'Select architecture';

  const reconcileExtendedRelease = (extendedRelease: string | undefined, forVersion: string) => {
    // If the selected update stream is no longer available for the OS new version, wipe it
    if (!extendedRelease) return '';

    const [isEusAvailable, isE4sAvailable] = getStreamAvailability(forVersion);

    // If we selected EUS, but it's no longer available, wipe it
    if (extendedRelease === EUS && !isEusAvailable) return '';

    // If we selected E4S, but it's no longer available, wipe it
    if (extendedRelease === E4S && !isE4sAvailable) return '';

    return extendedRelease;
  };

  const handleVersionChange = (newVersion: string) => {
    setTemplateRequest((prev) => {
      const reconciledExtendedRelease = reconcileExtendedRelease(prev.extended_release, newVersion);
      const extendedReleaseChanged = prev.extended_release !== reconciledExtendedRelease;

      return {
        ...prev,
        version: newVersion,
        // Only update extended_release if it actually changed
        ...(extendedReleaseChanged && { extended_release: reconciledExtendedRelease }),
        // If extended_release changed, also wipe extended_release_version
        ...(extendedReleaseChanged && { extended_release_version: '' }),
      };
    });
  };

  const classes = useStyles();

  return (
    <Grid hasGutter>
      <Title ouiaId='define_template_content' headingLevel='h1'>
        Define template content
      </Title>
      <Content component={ContentVariants.p}>
        Templates provide consistent content across environments and time. They enable you to
        control the scope of package and advisory updates that will be installed on selected
        systems.
      </Content>

      <Title headingLevel='h3'>Preselect available content</Title>
      <Content component={ContentVariants.p}>
        Based on your filters, the base repositories will be added to this template.
      </Content>

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
                .filter(({ label }) => SUPPORTED_ARCHES.includes(label))
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
            onSelect={(_, value) => {
              handleVersionChange(value as string);
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
                  {versionDisplay(templateRequest?.version) || 'Select OS version'}
                </MenuToggle>
              </ConditionalTooltip>
            )}
            onOpenChange={(isOpen) => setVersionOpen(isOpen)}
            isOpen={versionOpen}
          >
            <DropdownList>
              {distribution_versions
                .filter(({ label }) => SUPPORTED_MAJOR_VERSIONS.includes(label))
                .map(({ label, name }) => (
                  <DropdownItem
                    key={label}
                    value={label}
                    isSelected={label === templateRequest?.version}
                    component='button'
                    data-ouia-component-id={`filter_${label}`}
                  >
                    {toRhelDisplayName(name)}
                  </DropdownItem>
                ))}
            </DropdownList>
          </Dropdown>
        </FormGroup>
      </Form>
      <ExpandableSection
        toggleText='What does it mean?'
        aria-label='quickStart-expansion'
        data-ouia-component-id='quickstart_expand'
      >
        <Content>
          <Content component='ul'>
            <Content component='li'>
              Clients are configured to use date-based snapshots of Red Hat and custom repositories.
            </Content>
            <Content component='li'>Third-party tooling is used to update systems.</Content>
            {/* <TextListItem>Build Images from date based repository snapshots.</TextListItem> */}
          </Content>
        </Content>
      </ExpandableSection>
    </Grid>
  );
}
