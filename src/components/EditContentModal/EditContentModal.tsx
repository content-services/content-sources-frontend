import {
  Button,
  FileUpload,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  Popover, Radio,
  SelectVariant,
  Stack,
  StackItem,
  TextInput,
  Tooltip
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Tr } from '@patternfly/react-table';
import { global_Color_200, global_link_Color } from '@patternfly/react-tokens';
import { useFormik } from 'formik';
import { useEffect, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import Hide from '../Hide/Hide';
import useDebounce from '../../services/useDebounce';
import {
  REPOSITORY_PARAMS_KEY,
  useEditContentQuery,
  useValidateContentList,
} from '../../services/Content/ContentQueries';
import { RepositoryParamsResponse } from '../../services/Content/ContentApi';
import DropdownSelect from '../DropdownSelect/DropdownSelect';
import { useQueryClient } from 'react-query';
import { isValidURL, makeValidationSchema, mapValidationData } from '../AddContent/helpers';
import ContentValidity from '../AddContent/components/ContentValidity';
import {
  EditContentProps,
  FormikEditValues,
  mapFormikToEditAPIValues,
  mapToDefaultFormikValues,
} from './helpers';
import { isEqual } from 'lodash';

const useStyles = createUseStyles({
  description: {
    color: global_Color_200.value,
  },
  removeSideBorder: {
    '&:after': {
      borderLeft: 'none!important',
    },
  },
  toggleAllRow: {
    composes: ['$removeSideBorder'],
    cursor: 'pointer',
    borderBottom: 'none!important',
    '& td': {
      color: global_link_Color.value + '!important',
      padding: '12px 0!important',
    },
    '& svg': {
      fill: global_link_Color.value + '!important',
      padding: '',
    },
  },
  colHeader: {
    '& td': {
      '&:not(:last-child)': { cursor: 'pointer' },
      padding: '12px 0!important',
    },
  },
  mainContentCol: {
    composes: ['$removeSideBorder'],
    padding: '16px 0px 16px 36px!important',
  },
  toggleAction: {
    composes: ['$removeSideBorder'],
    '& button': {
      padding: '8px',
    },
  },
  saveButton: {
    marginRight: '36px',
    transition: 'unset!important',
  },
});

const EditContentModal = ({ values, open, setClosed }: EditContentProps) => {
  if (!open) return <></>;
  const initialValues = mapToDefaultFormikValues(values);
  const classes = useStyles();
  const queryClient = useQueryClient();
  const formik = useFormik({
    initialValues: initialValues,
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: makeValidationSchema(),
    initialTouched: values.map(() => ({ name: true, url: true })),
    onSubmit: () => undefined,
  });

  const valuesHaveChanged = useMemo(
    () => !isEqual(initialValues, formik.values),
    [initialValues, formik.values],
  );
  const { distribution_arches: distArches = [], distribution_versions: distVersions = [] } =
    queryClient.getQueryData<RepositoryParamsResponse>(REPOSITORY_PARAMS_KEY) || {};

  const { distributionArches, distributionVersions } = useMemo(() => {
    const distributionArches = {};
    const distributionVersions = {};
    distArches.forEach(({ name, label }) => (distributionArches[name] = label));
    distVersions.forEach(({ name, label }) => (distributionVersions[name] = label));
    return { distributionArches, distributionVersions };
  }, [distArches, distVersions]);

  const closeModal = () => {
    setClosed();
    formik.resetForm();
  };

  const { mutateAsync: editContent, isLoading: isEditing } = useEditContentQuery(
    queryClient,
    mapFormikToEditAPIValues(formik.values),
  );

  const createDataLengthOf1 = formik.values.length === 1;

  const allExpanded = !formik.values.some(({ expanded }) => !expanded);

  const expandAllToggle = () => {
    formik.setValues([...formik.values.map((vals) => ({ ...vals, expanded: !allExpanded }))]);
  };

  const updateVariable = (index: number, newValue) => {
    const updatedData = [...formik.values];
    updatedData[index] = { ...updatedData[index], ...newValue };
    formik.setValues(updatedData);
  };

  const getFieldValidation = (
    index: number,
    field: keyof FormikEditValues,
  ): 'default' | 'success' | 'error' => {
    const hasNotChanged = isEqual(initialValues[index]?.[field], formik.values[index]?.[field]);
    const errors = !!formik.errors[index]?.[field];
    switch (true) {
      case errors:
        return 'error';
      case hasNotChanged:
        return 'default';
      case !hasNotChanged:
        return 'success';
      default:
        return 'default';
    }
  };

  const debouncedValues = useDebounce(formik.values);

  const { mutateAsync: validateContentList } = useValidateContentList();

  useEffect(() => {
    if (open)
      validateContentList(debouncedValues.map(({ name, url, uuid }) => ({ name, url, uuid }))).then(
        async (validationData) => {
          const formikErrors = await formik.validateForm(debouncedValues);
          const mappedErrorData = mapValidationData(validationData, formikErrors);
          formik.setErrors(mappedErrorData);
        },
      );
  }, [debouncedValues, values, open]);

  const onToggle = (index: number) => {
    if (formik.values[index]?.expanded) {
      updateVariable(index, { ...formik.values[index], expanded: false });
    } else updateVariable(index, { ...formik.values[index], expanded: true });
  };

  const updateArchAndVersion = (index: number) => {
    const url = formik.values[index]?.url;
    if (isValidURL(url)) {
      const arch =
        formik.values[index]?.arch ||
        distArches.find(({ name, label }) => url.includes(name) || url.includes(label))?.label ||
        '';

      let versions: Array<string> = [];
      if (formik.values[index]?.versions?.length) {
        versions = formik.values[index]?.versions;
      } else {
        const newVersion = distVersions.find(
          ({ name, label }) => url.includes(name) || url.includes(label),
        )?.label;
        if (newVersion) versions = [newVersion];
      }
      updateVariable(index, { arch, versions });
    }
  };

  const urlOnBlur = (index: number) => {
    updateArchAndVersion(index);
  };

  const setVersionSelected = (value: string[], index: number) => {
    let valueToUpdate = value.map((val) => distributionVersions[val]);
    if (value.length === 0 || valueToUpdate[value.length - 1] === 'any') {
      valueToUpdate = ['any'];
    }
    if (valueToUpdate.length > 1 && valueToUpdate.includes('any')) {
      valueToUpdate = valueToUpdate.filter((val) => val !== 'any');
    }

    updateVariable(index, {
      versions: valueToUpdate,
    });
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title='Edit Content Source'
      help={
        <Popover
          headerContent={<div>Help Popover</div>}
          bodyContent={
            <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id feugiat augue, nec
              fringilla turpis.
            </div>
          }
          footerContent='Popover Footer'
        >
          <Button variant='plain' aria-label='Help'>
            <OutlinedQuestionCircleIcon />
          </Button>
        </Popover>
      }
      description={
        <p className={classes.description}>
          Edit by completing the form. Default values may be provided automatically.
        </p>
      }
      isOpen={open}
      onClose={closeModal}
      footer={
        <Stack>
          <StackItem>
            <Button
              className={classes.saveButton}
              key='confirm'
              variant='primary'
              isLoading={isEditing}
              isDisabled={
                !formik.isValid ||
                isEditing ||
                !valuesHaveChanged ||
                !isEqual(formik.values, debouncedValues)
              }
              onClick={() => {
                editContent().then(closeModal);
              }}
            >
              {valuesHaveChanged ? 'Save changes' : 'No changes'}
            </Button>
            <Button key='cancel' variant='link' onClick={closeModal}>
              Cancel
            </Button>
          </StackItem>
        </Stack>
      }
    >
      <TableComposable aria-label='Expandable table'>
        <Hide hide={createDataLengthOf1}>
          <Tbody isExpanded={allExpanded}>
            <Tr onClick={expandAllToggle} className={classes.toggleAllRow}>
              <Td
                className={classes.toggleAction}
                isActionCell
                expand={{
                  rowIndex: 0,
                  isExpanded: allExpanded,
                }}
              />
              <Td dataLabel='expand-collapse'>{allExpanded ? 'Collapse all' : 'Expand all'}</Td>
            </Tr>
          </Tbody>
        </Hide>
        {formik.values.map(({ expanded, name, url, arch, gpgKey, versions, gpgLoading , metadataVerification}, index) => (
          <Tbody key={index} isExpanded={createDataLengthOf1 ? undefined : expanded}>
            <Hide hide={createDataLengthOf1}>
              <Tr className={classes.colHeader}>
                <Td
                  onClick={() => onToggle(index)}
                  className={classes.toggleAction}
                  isActionCell
                  expand={{
                    rowIndex: index,
                    isExpanded: expanded,
                  }}
                />
                <Td width={35} onClick={() => onToggle(index)} dataLabel={name}>
                  {name || 'New content'}
                </Td>
                <Td onClick={() => onToggle(index)} dataLabel='validity'>
                  <ContentValidity touched={formik.touched[index]} errors={formik.errors[index]} />
                </Td>
              </Tr>
            </Hide>
            <Tr isExpanded={createDataLengthOf1 ? undefined : expanded}>
              <Td colSpan={4} className={createDataLengthOf1 ? '' : classes.mainContentCol}>
                <Form>
                  <FormGroup
                    label='Name'
                    isRequired
                    fieldId='namegroup'
                    validated={getFieldValidation(index, 'name')}
                    helperTextInvalid={formik.errors[index]?.name}
                  >
                    <TextInput
                      isRequired
                      id='name'
                      name='name'
                      label='Name'
                      type='text'
                      validated={getFieldValidation(index, 'name')}
                      onChange={(value) => {
                        updateVariable(index, { name: value });
                      }}
                      value={name || ''}
                      placeholder='Enter name'
                    />
                  </FormGroup>
                  <FormGroup
                    label='URL'
                    isRequired
                    fieldId='url'
                    validated={getFieldValidation(index, 'url')}
                    helperTextInvalid={formik.errors[index]?.url}
                  >
                    <TextInput
                      isRequired
                      type='url'
                      validated={getFieldValidation(index, 'url')}
                      onBlur={() => urlOnBlur(index)}
                      onChange={(value) => updateVariable(index, { url: value })}
                      value={url || ''}
                      placeholder='https://'
                      id='url'
                      name='url'
                      label='Url'
                    />
                  </FormGroup>
                  <FormGroup
                    label='Restrict architecture'
                    labelIcon={
                      <Tooltip content='Something super important and stuff'>
                        <OutlinedQuestionCircleIcon
                          className='pf-u-ml-xs'
                          color={global_Color_200.value}
                        />
                      </Tooltip>
                    }
                    fieldId='arch'
                  >
                    <DropdownSelect
                      validated={getFieldValidation(index, 'arch')}
                      menuAppendTo={document.body}
                      toggleId={'archSelection' + index}
                      options={Object.keys(distributionArches)}
                      variant={SelectVariant.single}
                      selectedProp={Object.keys(distributionArches).find(
                        (key: string) => arch === distributionArches[key],
                      )}
                      setSelected={(value) =>
                        updateVariable(index, { arch: distributionArches[value] })
                      }
                    />
                  </FormGroup>
                  <FormGroup
                    label='Restrict OS version'
                    labelIcon={
                      <Tooltip content='Something super important and stuff'>
                        <OutlinedQuestionCircleIcon
                          className='pf-u-ml-xs'
                          color={global_Color_200.value}
                        />
                      </Tooltip>
                    }
                    fieldId='version'
                  >
                    <DropdownSelect
                      validated={getFieldValidation(index, 'versions')}
                      menuAppendTo={document.body}
                      toggleId={'versionSelection' + index}
                      options={Object.keys(distributionVersions)}
                      variant={SelectVariant.typeaheadMulti}
                      selectedProp={Object.keys(distributionVersions).filter((key: string) =>
                        versions?.includes(distributionVersions[key]),
                      )}
                      placeholderText={versions?.length ? '' : 'Any version'}
                      setSelected={(value) => setVersionSelected(value, index)}
                    />
                  </FormGroup>
                    <FormGroup
                      label='GPG key'
                      labelIcon={
                        <Tooltip content='Something super important and stuff'>
                          <OutlinedQuestionCircleIcon
                            className='pf-u-ml-xs'
                            color={global_Color_200.value}
                          />
                        </Tooltip>
                      }
                      fieldId='gpgKey'
                      validated={getFieldValidation(index, 'gpgKey')}
                    >
                      <FileUpload
                        id='gpgKey-uploader'
                        type='text'
                        filenamePlaceholder='Drag a file here or upload one'
                        textAreaPlaceholder='Paste GPG key or URL here'
                        value={gpgKey}
                        isLoading={gpgLoading}
                        validated={getFieldValidation(index, 'gpgKey')}
                        onDataChange={(value) => updateVariable(index, { gpgKey: value })}
                        onTextChange={(value) => {
                          if (isValidURL(value)) {
                            updateVariable(index, { gpgLoading: true });
                            // TODO: add call to GPGkey api
                            return setTimeout(
                              () => updateVariable(index, { gpgLoading: false }),
                              1500,
                            );
                          }
                          updateVariable(index, { gpgKey: value });
                        }}
                        onClearClick={() => updateVariable(index, { gpgKey: '' })}
                        dropzoneProps={{
                          accept: '.txt',
                          maxSize: 4096,
                          onDropRejected: (e) => console.log('onDropRejected', e),
                        }}
                        allowEditingUploadedText
                        browseButtonText='Upload'
                      />
                    </FormGroup>
                    <FormGroup fieldId="metadataVerification" label="Use GPG key for" isInline validated={getFieldValidation(index, 'metadataVerification')}>
                      <Radio
                        id="package verification only"
                        name="package-verification-only"
                        label="Package verification only"
                        isValid={false}
                        isChecked={!metadataVerification}
                        onChange={() => updateVariable(index, {metadataVerification: false})}
                      />
                      <Radio
                        id="package and repository verification"
                        name="package-and-repository-verification"
                        label="Package and repository verification"
                        isChecked={metadataVerification}
                        onChange={() => updateVariable(index, {metadataVerification: true})}
                      />
                    </FormGroup>
                </Form>
              </Td>
            </Tr>
          </Tbody>
        ))}
      </TableComposable>
    </Modal>
  );
};

export default EditContentModal;
