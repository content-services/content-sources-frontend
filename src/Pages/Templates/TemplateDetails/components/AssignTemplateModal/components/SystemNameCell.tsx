import {
  Button,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Icon,
  List,
  ListItem,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { reduceStringToCharsWithEllipsis } from '../../../../../../helpers';
import { PATCH_SYSTEMS_ROUTE } from '../../../../../../Routes/constants';
import type { SystemItem } from '../../../../../../services/Systems/SystemsApi';
import HelpPopover from '../../../../../../components/HelpPopover';
import React from 'react';
import { isMinorRelease } from 'Pages/Templates/TemplateDetails/templateDetailHelpers';

type Props = Pick<SystemItem, 'id'> &
  Pick<SystemItem['attributes'], 'display_name' | 'rhsm' | 'satellite_managed'> & {
    basePath: string;
  };

const RHSM_DOCS_URL =
  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html-single/managing_system_content_and_patch_updates_on_rhel_systems/index#about-content-templates_patching-using-content-templates';

type WarningItem = {
  key: string;
  title: string;
  description: string;
};

/**
 * Renders a system name with a warning icon if the system cannot be associated with a template.
 * Systems locked to minor releases and satellite-managed systems cannot be associated with templates.
 */
export default function SystemNameCell({
  id,
  display_name,
  rhsm,
  basePath,
  satellite_managed,
}: Props) {
  const name = (
    <Button isInline variant='link' component='a' href={`${basePath}${PATCH_SYSTEMS_ROUTE}${id}`}>
      {reduceStringToCharsWithEllipsis(display_name)}
    </Button>
  );

  const warnings: WarningItem[] = [];

  if (isMinorRelease(rhsm)) {
    warnings.push({
      key: 'minor-release-warning',
      title: `RHEL is locked at version ${rhsm}`,
      description: 'Unset the minor release version to associate a template.',
    });
  }

  if (satellite_managed) {
    warnings.push({
      key: 'satellite-managed-warning',
      title: 'This system is managed by Satellite',
      description: 'Systems managed by Satellite cannot be associated with a template.',
    });
  }

  if (warnings.length === 0) {
    return name;
  }

  return (
    <Flex columnGap={{ default: 'columnGapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>{name}</FlexItem>
      <FlexItem>
        <HelpPopover
          headerContent='Cannot associate system with a template'
          headerIcon={<ExclamationTriangleIcon />}
          alertSeverityVariant='warning'
          position='right'
          triggerAction='hover'
          hasAutoWidth
          linkText='View the criteria for associating a system with a template'
          linkUrl={RHSM_DOCS_URL}
          bodyContent={
            <List isPlain>
              {warnings.map((w) => (
                <ListItem key={w.key}>
                  <Content component={ContentVariants.dt}>{w.title}</Content>
                  <Content component={ContentVariants.small}>{w.description}</Content>
                </ListItem>
              ))}
            </List>
          }
        >
          <Icon data-ouia-component-id='system-list-warning-icon' status='warning'>
            <ExclamationTriangleIcon />
          </Icon>
        </HelpPopover>
      </FlexItem>
    </Flex>
  );
}
