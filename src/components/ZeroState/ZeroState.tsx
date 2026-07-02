import { Suspense } from 'react';
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  Grid,
  PageSection,
  Spinner,
  Content,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon } from '@patternfly/react-icons';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { createUseStyles } from 'react-jss';

import useRootPath from 'Hooks/useRootPath';
import { useAppContext } from 'middleware/AppContext';
import { useNavigate } from 'react-router-dom';
import { CONTENT_DOCS_URL, REPOSITORIES_DOCS_URL } from 'constants/docs';
import { REPOSITORIES_ROUTE, TEMPLATES_ROUTE } from 'Routes/constants';

const useStyles = createUseStyles({
  contentZerostate: {
    minHeight: '100%',
    '& .bannerBefore': { maxHeight: '320px!important' },
    '& .bannerRight': { justifyContent: 'space-evenly!important' },
  },
  removeBottomPadding: {
    paddingBottom: '0',
  },
});

export const ZeroState = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const rootPath = useRootPath();
  const { setZeroState } = useAppContext();

  const openTemplatesList = () => {
    setZeroState(false);
    navigate(`${rootPath}/${TEMPLATES_ROUTE}`);
  };

  const openRepositoriesList = () => {
    setZeroState(false);
    navigate(`${rootPath}/${REPOSITORIES_ROUTE}`);
  };

  return (
    <>
      <Suspense
        fallback={
          <Bullseye>
            <Spinner size='xl' />
          </Bullseye>
        }
      >
        <Grid className={classes.contentZerostate}>
          <AsyncComponent
            appId='content_zero_state'
            appName='dashboard'
            module='./AppZeroState'
            scope='dashboard'
            ErrorComponent={<ErrorState />}
            app='Content_management'
            ouiaId='get_started_from_zerostate_description'
            customTitle='Start using content templates now'
            customText='Get started by creating a content template to manage updates for your RHEL systems or adding external repositories.'
            customSection={
              <PageSection hasBodyWrapper={false} className={classes.removeBottomPadding}>
                <Flex
                  direction={{ default: 'row' }}
                  gap={{ default: 'gapLg' }}
                  alignItems={{ default: 'alignItemsStretch' }}
                >
                  <FlexItem flex={{ default: 'flex_1' }}>
                    <Card isFullHeight>
                      <CardTitle>
                        <Title headingLevel='h3'>About content templates</Title>
                      </CardTitle>
                      <CardBody>
                        <Flex
                          direction={{ default: 'column' }}
                          gap={{ default: 'gapMd' }}
                          style={{ height: '100%' }}
                        >
                          <FlexItem flex={{ default: 'flex_1' }}>
                            <Content>
                              <Content component='p'>
                                Content templates use repository snapshots to control which
                                advisories and package versions are applied when patching your RHEL
                                systems.
                              </Content>
                              <Content component='p'>
                                Use templates to define a Standard Operating Environment (SOE) by
                                pinning repositories to a specific point in time. This ensures a
                                consistent baseline of tested packages and advisories across your
                                systems.
                              </Content>
                            </Content>
                          </FlexItem>
                          <FlexItem>
                            <Flex
                              direction={{ default: 'column' }}
                              alignItems={{ default: 'alignItemsFlexStart' }}
                              gap={{ default: 'gapMd' }}
                            >
                              <Button
                                variant='link'
                                isInline
                                component='a'
                                href={CONTENT_DOCS_URL}
                                target='_blank'
                                rel='noopener noreferrer'
                                icon={<ExternalLinkSquareAltIcon />}
                                iconPosition='end'
                              >
                                Learn more about managing system content and patch updates
                              </Button>
                            </Flex>
                          </FlexItem>
                        </Flex>
                      </CardBody>
                    </Card>
                  </FlexItem>
                  <FlexItem flex={{ default: 'flex_1' }}>
                    <Card isFullHeight>
                      <CardTitle>
                        <Title headingLevel='h3'>About repositories</Title>
                      </CardTitle>
                      <CardBody>
                        <Flex
                          direction={{ default: 'column' }}
                          gap={{ default: 'gapMd' }}
                          style={{ height: '100%' }}
                        >
                          <FlexItem flex={{ default: 'flex_1' }}>
                            <Content>
                              <Content component='p'>
                                Repositories provide the content sources that templates use to
                                define what packages and advisories are available to your systems.
                              </Content>
                              <Content component='p'>
                                You can use official Red Hat content, add external sources, or
                                upload custom RPMs.
                              </Content>
                            </Content>
                          </FlexItem>
                          <FlexItem>
                            <Flex
                              direction={{ default: 'column' }}
                              alignItems={{ default: 'alignItemsFlexStart' }}
                              gap={{ default: 'gapMd' }}
                            >
                              <Button
                                onClick={() => {
                                  setZeroState(false);
                                  navigate(`${rootPath}/${REPOSITORIES_ROUTE}?origin=red_hat`);
                                }}
                                variant='secondary'
                              >
                                Browse available repositories
                              </Button>
                              <Button
                                variant='link'
                                isInline
                                component='a'
                                href={REPOSITORIES_DOCS_URL}
                                target='_blank'
                                rel='noopener noreferrer'
                                icon={<ExternalLinkSquareAltIcon />}
                                iconPosition='end'
                              >
                                Learn more about repositories
                              </Button>
                            </Flex>
                          </FlexItem>
                        </Flex>
                      </CardBody>
                    </Card>
                  </FlexItem>
                </Flex>
              </PageSection>
            }
            customButton={
              <Flex
                direction={{ default: 'column' }}
                alignItems={{ default: 'alignItemsCenter' }}
                gap={{ default: 'gapSm' }}
              >
                <Button
                  id='create-template-button'
                  ouiaId='create_template_button'
                  onClick={openTemplatesList}
                >
                  Create template
                </Button>
                <Button
                  id='add-repositories-button'
                  ouiaId='add_repositories_button'
                  variant='link'
                  onClick={openRepositoriesList}
                >
                  Add repositories
                </Button>
              </Flex>
            }
          />
        </Grid>
      </Suspense>
    </>
  );
};
