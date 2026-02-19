import {
  DatePicker,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  PopoverProps,
  Radio,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useSetUpDateApi, useSetUpDateState } from '../../store/SetUpDateStore';
import { restrictFutureDates } from '../../core/domain/restrictFutureDates';
import { UseLatestSnapshot } from 'features/createAndEditTemplate/shared/types/types';

const validators = [restrictFutureDates];

const popoverProps = {
  position: 'right',
  enableFlip: true,
  flipBehavior: ['right', 'right-start', 'right-end', 'top-start', 'top'],
} as PopoverProps;

export const SnapshotPicker = () => {
  const { toggleLatestSnapshot, chooseSnapshotDate } = useSetUpDateApi();
  const { isLatestSnapshot, snapshotDate } = useSetUpDateState();

  const latestSnapshotPros = {
    id: 'use latest snapshot radio',
    ouiaId: 'use-latest-snapshot-radio',
    name: 'use-latest-snapshot',
    label: 'Use the latest content',
    description:
      'Always use the latest content from repositories. Snapshots might be updated daily.',
  };

  const dateProps = {
    id: 'use snapshot date radio',
    ouiaId: 'use-snapshot-date-radio',
    name: 'use-snapshot-date',
    label: 'Use up to a specific date',
    description: 'Includes repository changes up to this date.',
  };

  const dateInput = () => (
    <DatePicker
      id='use-snapshot-date-picker'
      value={snapshotDate ?? ''}
      required={!isLatestSnapshot}
      requiredDateOptions={{ isRequired: !isLatestSnapshot }}
      style={{ paddingLeft: '20px' }}
      validators={validators}
      popoverProps={popoverProps}
      onChange={(_, val) => chooseSnapshotDate(val)}
    />
  );

  const showDateInput = (isLatest: UseLatestSnapshot) => (isLatest ? null : dateInput());

  return (
    <Form>
      <FormGroup>
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapLg' }}>
          <FlexItem>
            <Radio
              {...latestSnapshotPros}
              isChecked={isLatestSnapshot}
              onChange={() => toggleLatestSnapshot(true)}
            />
          </FlexItem>
          <FlexItem>
            <Radio
              {...dateProps}
              isChecked={!isLatestSnapshot}
              onChange={() => toggleLatestSnapshot(false)}
              className={spacing.mbSm}
            />
            {showDateInput(isLatestSnapshot)}
          </FlexItem>
        </Flex>
      </FormGroup>
    </Form>
  );
};
