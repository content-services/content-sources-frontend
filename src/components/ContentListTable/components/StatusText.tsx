import { createUseStyles } from 'react-jss';
import { global_danger_color_200, global_info_color_200, global_success_color_200, global_warning_color_200 } from '@patternfly/react-tokens';

const red = global_danger_color_200.value;
const green = global_success_color_200.value;
const gold = global_warning_color_200.value;
const blue = global_info_color_200.value;

const useStyles = createUseStyles({
  red: { color: red, fontWeight: 'bold', fontSize: '14px' },
  green: { color: green, fontWeight: 'bold', fontSize: '14px' },
  gold: { color: gold, fontWeight: 'bold', fontSize: '14px' },
  blue: { color: blue, fontWeight: 'bold', fontSize: '14px' },
});

interface Props {
  color: 'red' | 'green' | 'gold' | 'blue'
  children?: React.ReactNode
}

const StatusText = ({ color, children }: Props) => {
  const classes = useStyles();

  return (
    <span className={classes[color]}>{children}</span>
  )
};

export default StatusText;
