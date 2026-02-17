import { DatePicker, Flex, FlexItem, Form, FormGroup, Radio } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import Hide from 'components/Hide/Hide';
import { useSetUpDateApi } from '../../store/SetUpDateStore';

export const SnapshotPicker = () => {
  const { templateRequest, setTemplateRequest } = useSetUpDateApi();

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
              isChecked={templateRequest.use_latest}
              onChange={() => {
                if (!templateRequest.use_latest) {
                  setTemplateRequest((prev) => ({ ...prev, use_latest: true, date: '' }));
                }
              }}
            />
          </FlexItem>
          <FlexItem>
            <Radio
              id='use snapshot date radio'
              ouiaId='use-snapshot-date-radio'
              name='use-snapshot-date'
              label='Use up to a specific date'
              description='Includes repository changes up to this date.'
              isChecked={!templateRequest.use_latest}
              onChange={() => {
                if (templateRequest.use_latest) {
                  setTemplateRequest((prev) => ({ ...prev, use_latest: false, date: '' }));
                }
              }}
              className={spacing.mbSm}
            />
            <Hide hide={templateRequest.use_latest ?? false}>
              <DatePicker
                id='use-snapshot-date-picker'
                value={templateRequest.date ?? ''}
                required={!templateRequest.use_latest}
                requiredDateOptions={{ isRequired: !templateRequest.use_latest }}
                style={{ paddingLeft: '20px' }}
                validators={dateValidators}
                popoverProps={{
                  position: 'right',
                  enableFlip: true,
                  flipBehavior: ['right', 'right-start', 'right-end', 'top-start', 'top'],
                }}
                onChange={(_, val) => {
                  setTemplateRequest((prev) => ({ ...prev, date: val }));
                }}
              />
            </Hide>
          </FlexItem>
        </Flex>
      </FormGroup>
    </Form>
  );
};
