import {
  ExpandableSection,
  Flex,
  Grid,
  Content,
  ContentVariants,
  Title,
} from '@patternfly/react-core';
import { useAddOrEditTemplateContext } from '../AddOrEditTemplateContext';
import { useMemo, useState } from 'react';
import { formatDateDDMMMYYYY } from 'helpers';

export default function ReviewStep() {
  const [expanded, setExpanded] = useState(new Set([0]));
  const {
    templateRequest,
    selectedRedHatRepos,
    redHatCoreRepoUUIDS,
    selectedCustomRepos,
    distribution_arches,
    distribution_versions,
    isEdit,
    useExtendedSupport,
  } = useAddOrEditTemplateContext();

  const archesDisplay = (arch?: string) =>
    distribution_arches.find(({ label }) => arch === label)?.name || 'Select architecture';

  const versionDisplay = (version?: string): string =>
    // arm64 aarch64
    distribution_versions.find(({ label }) => version === label)?.name || 'Select version';

  const reviewTemplate = useMemo(() => {
    const { arch, version, date, name, description } = templateRequest;
    const review = {
      Content: {
        Architecture: archesDisplay(arch),
        'OS version': versionDisplay(version),
        ...(useExtendedSupport
          ? {
              'Update stream': templateRequest.extended_release,
              'Minor version': templateRequest.extended_release_version,
            }
          : {}),
        'Core Red Hat repositories': redHatCoreRepoUUIDS.size,
        'Additional Red Hat repositories': selectedRedHatRepos.size - redHatCoreRepoUUIDS.size,
        'Custom repositories': selectedCustomRepos.size,
      },
      Date: {
        ...(templateRequest.use_latest
          ? { 'Snapshot date': 'Use the latest content' }
          : { Date: formatDateDDMMMYYYY(date || '') }),
      },
      Details: {
        Name: name,
        Description: description,
      },
    } as Record<string, { [key: string]: string | number | undefined }>;

    return review;
  }, [templateRequest]);

  const setToggle = (index: number) => {
    if (expanded.has(index)) {
      expanded.delete(index);
    } else {
      expanded.add(index);
    }
    setExpanded(new Set(expanded));
  };

  return (
    <Grid hasGutter>
      <Title ouiaId='review' headingLevel='h1'>
        Review
      </Title>
      <Content component={ContentVariants.p}>
        Review the information and then click <b>{isEdit ? 'Confirm changes' : 'Create'}</b>.
      </Content>
      {Object.keys(reviewTemplate).map((key, index) => (
        <ExpandableSection
          key={key}
          isIndented
          toggleText={key}
          onToggle={() => setToggle(index)}
          isExpanded={expanded.has(index)}
          // displaySize='lg'
          aria-label={`${key}-expansion`}
          data-ouia-component-id={`${key}_expansion`}
        >
          <Flex direction={{ default: 'row' }}>
            <Flex direction={{ default: 'column' }}>
              {Object.keys(reviewTemplate[key]).map((title) => (
                <Content component='p' key={title + '' + index}>
                  {title}
                </Content>
              ))}
            </Flex>
            <Flex direction={{ default: 'column' }}>
              {Object.values(reviewTemplate[key]).map((value, index) => (
                <Content component='p' key={value + '' + index}>
                  {value}
                </Content>
              ))}
            </Flex>
          </Flex>
        </ExpandableSection>
      ))}
    </Grid>
  );
}
