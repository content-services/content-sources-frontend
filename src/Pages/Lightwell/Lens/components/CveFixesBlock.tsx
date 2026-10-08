import {
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import text from '@patternfly/react-styles/css/utilities/Text/text';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import type { CompletedCoverageReport } from 'services/Lightwell/CoverageReportsApi';
import { CVE_SEVERITIES, renderCveSeverityIcon } from '../utils/cveSeverity';

type CveFixesBlockProps = {
  report: CompletedCoverageReport;
};

const CveFixesBlock = ({ report }: CveFixesBlockProps) => (
  <Card ouiaId='lightwell-cve-fixes-card'>
    <CardBody>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel='h3' size='lg'>
            CVEs fixed
          </Title>
          <Content component='p' className={`${text.textColorSubtle} ${spacing.mtSm}`}>
            Net delta of CVEs fixed by Lightwell (vs. unpatched version)
          </Content>
        </StackItem>
        <StackItem>
          <Flex
            gap={{ default: 'gapLg' }}
            justifyContent={{ default: 'justifyContentSpaceAround' }}
          >
            {CVE_SEVERITIES.map((meta) => (
              <FlexItem key={meta.key}>
                <Flex
                  direction={{ default: 'column' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                  gap={{ default: 'gapSm' }}
                >
                  <FlexItem>
                    <Title headingLevel='h4' size='3xl'>
                      {report.cve_summary[meta.key]}
                    </Title>
                  </FlexItem>
                  <FlexItem>
                    <Label variant='outline' isCompact icon={renderCveSeverityIcon(meta)}>
                      {meta.label}
                    </Label>
                  </FlexItem>
                </Flex>
              </FlexItem>
            ))}
          </Flex>
        </StackItem>
      </Stack>
    </CardBody>
  </Card>
);

export default CveFixesBlock;
