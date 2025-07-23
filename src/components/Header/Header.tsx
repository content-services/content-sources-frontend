import { Button, Content, Popover } from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import {
  OpenSourceBadge,
  PageHeader as _PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { PageHeaderProps as _PageHeaderProps } from '@redhat-cloud-services/frontend-components/PageHeader/PageHeader';

import { FunctionComponent, ReactElement } from 'react';
import { createUseStyles } from 'react-jss';

interface PageHeaderProps extends _PageHeaderProps {
  children?: ReactElement | Array<ReactElement>;
}

// Example of how to extend inaccurately typed imports
const PageHeader = _PageHeader as FunctionComponent<PageHeaderProps>;

const useStyles = createUseStyles({
  subtext: {
    paddingTop: '8px',
  },
  remove100percent: {
    height: 'unset',
  },
});

interface HeaderProps {
  title: string;
  ouiaId: string;
  paragraph: string;
  aboutData?: AboutProps;
}

interface AboutProps {
  text: string;
  docsURL: string;
  docsLabel: string;
  header: string;
}

const About = ({ header, text, docsURL, docsLabel }: AboutProps) => (
  <Popover
    headerContent={header}
    bodyContent={text}
    footerContent={
      <Button
        component='a'
        target='_blank'
        variant='link'
        icon={<ExternalLinkAltIcon />}
        iconPosition='right'
        isInline
        href={docsURL}
      >
        {docsLabel}
      </Button>
    }
  >
    <Button
      icon={<HelpIcon />}
      variant='plain'
      aria-label={header}
      className='pf-v6-u-ml-sm'
      style={{ verticalAlign: '2px' }}
    />
  </Popover>
);

export default function Header({ title, ouiaId, paragraph, aboutData }: HeaderProps) {
  const classes = useStyles();

  return (
    <PageHeader>
      <PageHeaderTitle
        title={
          <>
            {title}
            {aboutData && <About {...aboutData} />}
            <span style={{ verticalAlign: '2px' }}>
              <OpenSourceBadge repositoriesURL='https://github.com/content-services/content-sources-frontend' />
            </span>
          </>
        }
        className={classes.remove100percent}
      />
      <Content component='p' className={classes.subtext} ouiaId={ouiaId}>
        {paragraph}
      </Content>
    </PageHeader>
  );
}
