import { createUseStyles } from 'react-jss';
import {
  t_global_color_status_danger_100,
  t_color_blue_70,
  t_global_color_status_success_100,
  t_global_color_status_warning_100,
} from '@patternfly/react-tokens';

const red = t_global_color_status_danger_100.value;
const green = t_global_color_status_success_100.value;
const gold = t_global_color_status_warning_100.value;
const blue = t_color_blue_70.value;

interface Props {
  color: 'red' | 'green' | 'gold' | 'blue';
  isLink?: boolean;
  children?: React.ReactNode;
}

const useStyles = ({ isLink }: Props) =>
  createUseStyles({
    fontStyle: {
      fontWeight: 'bold',
      fontSize: '14px',
      ...(isLink
        ? {
            textDecoration: 'grey dotted underline',
            cursor: 'pointer',
          }
        : {}),
    },
    red: { extend: 'fontStyle', color: red },
    green: { extend: 'fontStyle', color: green },
    gold: { extend: 'fontStyle', color: gold },
    blue: { extend: 'fontStyle', color: blue },
  });

const StatusText = (props: Props) => {
  const classes = useStyles(props)();
  const { color, children } = props;

  return <span className={classes[color]}>{children}</span>;
};

export default StatusText;
