import {
  Grid,
  Title,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  Dropdown,
  MenuToggle,
  DropdownList,
  DropdownItem,
  Radio,
  FlexItem,
  Flex,
  Alert,
  Button,
} from '@patternfly/react-core';
import { useState } from 'react';
import { ExternalLinkSquareAltIcon } from '@patternfly/react-icons';
import { useAddOrEditTemplateContext } from '../AddOrEditTemplateContext';

const ExtendedSupportStep = () => {
  const {
    extended_release_features,
    distribution_minor_versions,
    templateRequest,
    setTemplateRequest,
  } = useAddOrEditTemplateContext();

  const [isUpdateStreamOpen, setIsUpdateStreamOpen] = useState(false);
  const [isMinorVersionOpen, setIsMinorVersionOpen] = useState(false);

  return (
    <Grid hasGutter>
      <Title ouiaId='content-versioning' headingLevel='h1'>
        Content versioning
      </Title>
      <Content component={ContentVariants.p}>
        Configure how your templates handle release upgrades. You can automatically float to the
        newest release or lock to a specific minor version.
      </Content>

      <Form>
        {/* Release type - radio buttons */}
        <FormGroup>
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapLg' }}>
            <FlexItem>
              <Radio
                id='latest-release'
                ouiaId='latest-release-radio'
                name='use-latest-release'
                label='Latest release'
                description='Systems will automatically upgrade to the next minor release as soon as it becomes available.'
                // isChecked={templateRequest.use_latest}
                // onChange={() => {
                //   if (!templateRequest.use_latest) {
                //     setTemplateRequest((prev) => ({ ...prev, use_latest: true, date: '' }));
                //   }
                // }}
              />
            </FlexItem>
            <FlexItem>
              <Radio
                id='extended-support'
                ouiaId='extended-support-radio'
                name='use-extended-support'
                label='Extended support releases'
                description='Restricts content to a specific minor version. Future minor releases will be excluded to maintain stability.'
                // isChecked={templateRequest.use_latest}
                // onChange={() => {
                //   if (!templateRequest.use_latest) {
                //     setTemplateRequest((prev) => ({ ...prev, use_latest: true, date: '' }));
                //   }
                // }}
              />
            </FlexItem>
          </Flex>
          <Alert
            variant='warning'
            isInline
            title='To use extended support update streams, your systems must be locked to a specific minor version of RHEL for the template to apply correctly.'
          >
            <Button
              variant='link'
              component='a'
              icon={<ExternalLinkSquareAltIcon />}
              iconPosition='end'
              // TODO: Use a proper URL to our docs
              href='https://serverfault.com/questions/484841/update-red-hat-enterprise-linuxs-packages-only-to-specific-point-release'
              target='_blank'
              rel='noopener noreferrer'
            >
              Learn how to set a minor version
            </Button>
          </Alert>
        </FormGroup>

        {/* Flex for update stream & minor version (vertical alignment) */}
        <FormGroup label='Update stream' isRequired>
          <Dropdown
            onSelect={(_, val) => {
              setTemplateRequest((prev) => ({ ...prev, extended_release: val as string }));
              setIsUpdateStreamOpen(false);
            }}
            isOpen={isUpdateStreamOpen}
            onOpenChange={(isOpen) => setIsUpdateStreamOpen(isOpen)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                isFullWidth
                aria-label='Update stream toggle'
                id='update-stream-toggle'
                ouiaId='select-update-stream'
                isExpanded={isUpdateStreamOpen}
                onClick={() => setIsUpdateStreamOpen((prev) => !prev)}
              >
                {extended_release_features.find(
                  ({ label }) => label === templateRequest.extended_release,
                )?.name || 'Select update stream'}
              </MenuToggle>
            )}
          >
            <DropdownList>
              {extended_release_features.map(({ label, name }) => (
                <DropdownItem
                  isSelected={label === templateRequest.extended_release}
                  data-ouia-component-id={`filter_${label}`}
                  key={label}
                  value={label}
                  component='button'
                >
                  {name}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </FormGroup>

        <FormGroup label='Minor release' isRequired>
          <Dropdown
            onSelect={(_, val) => {
              setTemplateRequest((prev) => ({ ...prev, extended_release_version: val as string }));
              setIsMinorVersionOpen(false);
            }}
            isOpen={isMinorVersionOpen}
            onOpenChange={(isOpen) => setIsMinorVersionOpen(isOpen)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                isFullWidth
                aria-label='Minor version toggle'
                id='minor-version-toggle'
                ouiaId='select-minor-version'
                isExpanded={isMinorVersionOpen}
                isDisabled={!templateRequest.extended_release}
                onClick={() => setIsMinorVersionOpen((prev) => !prev)}
              >
                {distribution_minor_versions.find(
                  ({ label }) => label === templateRequest.extended_release_version,
                )?.name || 'Select minor version'}
              </MenuToggle>
            )}
          >
            <DropdownList>
              {distribution_minor_versions
                .filter(
                  ({ feature_names }) =>
                    templateRequest.extended_release &&
                    feature_names.includes(templateRequest.extended_release),
                )
                .map(({ label, name }) => (
                  <DropdownItem
                    isSelected={label === templateRequest.extended_release_version}
                    data-ouia-component-id={`filter_${label}`}
                    key={label}
                    value={label}
                    component='button'
                  >
                    {name}
                  </DropdownItem>
                ))}
            </DropdownList>
          </Dropdown>
        </FormGroup>
      </Form>

      {/* What does this mean? */}
    </Grid>
  );
};

export default ExtendedSupportStep;
