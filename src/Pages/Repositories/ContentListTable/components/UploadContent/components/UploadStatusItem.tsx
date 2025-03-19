import * as React from 'react';
import styles from '@patternfly/react-styles/css/components/MultipleFileUpload/multiple-file-upload';
import { css } from '@patternfly/react-styles';
import { Button, Flex, Progress } from '@patternfly/react-core';
import { reduceStringToCharsWithEllipsis } from 'helpers';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import { createUseStyles } from 'react-jss';
import { c_popover_m_danger__title_icon_Color } from '@patternfly/react-tokens';
import { FileIcon, TimesIcon } from '@patternfly/react-icons';
import Hide from 'components/Hide/Hide';

const useStyles = createUseStyles({
  statusMinWidth: {
    width: '530px',
  },
  spaceBetween: {
    width: '450px',
    justifyContent: 'space-between',
  },
  errorText: {
    '& .pf-v6-c-progress__helper-text': {
      color: c_popover_m_danger__title_icon_Color.value,
    },
  },
  noPadding: {
    padding: 0,
  },
});

export interface MultipleFileUploadStatusItemProps extends React.HTMLProps<HTMLLIElement> {
  className?: string;
  buttonAriaLabel?: string;
  onClearClick?: React.MouseEventHandler<HTMLButtonElement>;
  hideClearButton?: boolean;
  fileIcon?: React.ReactNode;
  fileName: string;
  maxFileNameLength?: number;
  fileSize?: number;
  progressValue: number;
  progressLabel?: React.ReactNode;
  progressVariant?: 'danger' | 'success' | 'warning';
  progressAriaLabel?: string;
  progressAriaLabelledBy?: string;
  progressAriaLiveMessage?: string | ((loadPercentage: number) => string);
  progressId?: string;
  progressHelperText?: React.ReactNode;
  retry?: () => void;
}

export default function UploadStatusItem({
  retry,
  className,
  fileIcon,
  onClearClick = () => {},
  hideClearButton,
  fileName,
  maxFileNameLength = 50,
  fileSize,
  progressValue,
  progressLabel,
  progressVariant,
  progressAriaLabel,
  progressAriaLabelledBy,
  progressId,
  progressAriaLiveMessage,
  buttonAriaLabel = 'Remove from list',
  progressHelperText,
  ...props
}: MultipleFileUploadStatusItemProps) {
  const classes = useStyles();

  const getHumanReadableFileSize = (size: number) => {
    const prefixes = ['', 'K', 'M', 'G', 'T'];
    let prefixUnit = 0;
    while (size >= 1000) {
      prefixUnit += 1;
      size = size / 1000;
    }

    if (prefixUnit >= prefixes.length) {
      return 'File size too large';
    }

    return `${Math.round(size)}${prefixes[prefixUnit]}B`;
  };

  return (
    <li className={css(styles.multipleFileUploadStatusItem, className)} {...props}>
      <div className={styles.multipleFileUploadStatusItemIcon}>{fileIcon || <FileIcon />}</div>
      <div className={styles.multipleFileUploadStatusItemMain + ' ' + classes.statusMinWidth}>
        <div className='pf-v6-screen-reader' aria-live='polite'>
          {progressAriaLiveMessage &&
            typeof progressAriaLiveMessage === 'string' &&
            progressAriaLiveMessage}
          {!progressAriaLiveMessage && `Progress value is ${progressValue}%.`}
        </div>
        <Progress
          className={progressVariant === 'danger' ? classes.errorText : ''}
          title={
            <span
              className={styles.multipleFileUploadStatusItemProgress + ' ' + classes.spaceBetween}
            >
              <ConditionalTooltip show={fileName.length > maxFileNameLength} content={fileName}>
                <span className={styles.multipleFileUploadStatusItemProgressText}>
                  {reduceStringToCharsWithEllipsis(fileName, maxFileNameLength) || ''}
                </span>
              </ConditionalTooltip>
              <span className={styles.multipleFileUploadStatusItemProgressSize}>
                {getHumanReadableFileSize(fileSize || 0)}
              </span>
            </span>
          }
          value={progressValue}
          label={progressLabel}
          variant={progressVariant}
          aria-label={progressAriaLabel}
          aria-labelledby={progressAriaLabelledBy}
          id={progressId}
          helperText={progressHelperText}
        />
      </div>

      <Flex direction={{ default: 'column' }} className={styles.multipleFileUploadStatusItemIcon}>
        <Hide hide={!!hideClearButton}>
          <Button
            icon={<TimesIcon />}
            variant='plain'
            isDanger
            aria-label={buttonAriaLabel}
            onClick={onClearClick}
          />
        </Hide>
        <Hide hide={!retry || progressVariant !== 'danger'}>
          <Button className={classes.noPadding} variant='link' onClick={retry}>
            Retry
          </Button>
        </Hide>
      </Flex>
    </li>
  );
}
