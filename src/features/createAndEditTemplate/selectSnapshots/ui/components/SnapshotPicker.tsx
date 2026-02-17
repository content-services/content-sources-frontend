import { DatePicker, Flex, FlexItem, Form, FormGroup, Radio } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import Hide from 'components/Hide/Hide';
import { useSetUpDateApi } from '../../store/SetUpDateStore';

export const SnapshotPicker = () => {
  const { toggleLatestSnapshot, chooseSnapshotDate, isLatestSnapshot, snapshotDate } =
    useSetUpDateApi();

  const dateValidators = [
    (date: Date) => {
      if (date.getTime() > Date.now()) {
        return 'Cannot set a date in the future';
      }
      return '';
    },
  ];

  return (
    <Form>
      <FormGroup>
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapLg' }}>
          <FlexItem>
            <Radio
              id='use latest snapshot radio'
              ouiaId='use-latest-snapshot-radio'
              name='use-latest-snapshot'
              label='Use the latest content'
              description='Always use the latest content from repositories. Snapshots might be updated daily.'
              isChecked={isLatestSnapshot}
              onChange={() => toggleLatestSnapshot(true)}
            />
          </FlexItem>
          <FlexItem>
            <Radio
              id='use snapshot date radio'
              ouiaId='use-snapshot-date-radio'
              name='use-snapshot-date'
              label='Use up to a specific date'
              description='Includes repository changes up to this date.'
              isChecked={!isLatestSnapshot}
              onChange={() => toggleLatestSnapshot(false)}
              className={spacing.mbSm}
            />
            <Hide hide={isLatestSnapshot ?? false}>
              <DatePicker
                id='use-snapshot-date-picker'
                value={snapshotDate ?? ''}
                required={!isLatestSnapshot}
                requiredDateOptions={{ isRequired: !isLatestSnapshot }}
                style={{ paddingLeft: '20px' }}
                validators={dateValidators}
                popoverProps={{
                  position: 'right',
                  enableFlip: true,
                  flipBehavior: ['right', 'right-start', 'right-end', 'top-start', 'top'],
                }}
                onChange={(_, val) => chooseSnapshotDate(val)}
              />
            </Hide>
          </FlexItem>
        </Flex>
      </FormGroup>
    </Form>
  );
};
