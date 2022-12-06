import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  link: {
    alignItems: 'center',
    display: 'flex',
    width: 'fit-content', // Prevents overflow of clickable area beyond visible content
  },
  icon: {
    marginLeft: '5px',
  },
});

interface Props {
  href: string;
}

const UrlWithExternalIcon = ({ href }: Props) => {
  const classes = useStyles();
  return (
    <a href={href} className={classes.link} rel='noreferrer' target='_blank'>
      {href} <ExternalLinkAltIcon className={classes.icon} />
    </a>
  );
};

export default UrlWithExternalIcon;
