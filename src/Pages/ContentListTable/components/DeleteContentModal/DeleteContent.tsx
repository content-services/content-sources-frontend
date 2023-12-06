import {
    Bullseye,
    Button,
    Modal,
    ModalVariant,
    Popover,
    Spinner,
    Stack,
    StackItem,
    Text,
  } from '@patternfly/react-core';
  import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
  import { global_Color_200, global_Color_100 } from '@patternfly/react-tokens';
  import { useEffect, useState } from 'react';
  import { createUseStyles } from 'react-jss';
  import Hide from '../../../../components/Hide/Hide';
  import {
    CONTENT_ITEM_KEY,
    useFetchContent,
    useDeleteContentItemMutate
  } from '../../../../services/Content/ContentQueries';
  import { useQueryClient } from 'react-query';
  import { useLocation, useNavigate } from 'react-router-dom';
  import { FilterData } from '../../../../services/Content/ContentApi';
  import { useContentListOutletContext } from '../../ContentListTable';
  import useRootPath from '../../../../Hooks/useRootPath';
  
  const useStyles = createUseStyles({
    description: {
      paddingTop: '12px', // 4px on the title bottom padding makes this the "standard" 16 total padding
      color: global_Color_200.value,
    },
    removeButton: {
      marginRight: '36px',
      transition: 'unset!important',
    },
    title:{
        paddingTop: '24px',
        color: global_Color_100.value,
        fontWeight: 'bold',
        fontSize: '14px', 
    },
    textContent:{
        color: global_Color_200.value,
        fontWeight: 400,
        fontSize: '16px',
    },
  });


const DeleteContent = () => {
    const classes = useStyles();
    const navigate = useNavigate();
    const rootPath = useRootPath();
    const queryClient = useQueryClient();
    const { search } = useLocation();
    const [initialLoad, setInitialLoad] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { clearCheckedRepositories } = useContentListOutletContext();
  
    const uuids = new URLSearchParams(search).get('repoUUIDS')?.split(',') || [];
    const page = Number(new URLSearchParams(search).get('page')) || 1;
    const perPage = Number(new URLSearchParams(search).get('perPage')) || 20;
    const [filterData, setFilterData] = useState<FilterData>({
        searchQuery: '',
        versions: [],
        arches: [],
        statuses: [],
      });
    const { mutateAsync: deleteItem, isLoading: isDeleting } = useDeleteContentItemMutate(
        queryClient,
        page,
        perPage,
        filterData,
        '',
    );
  
  
    const onClose = () => navigate(rootPath);
    const onSave = async () =>
        deleteItem(data?.uuid || '').then(() => {
        onClose();
        clearCheckedRepositories();
        queryClient.invalidateQueries(CONTENT_ITEM_KEY);
      });
  
    const { data, isError } = useFetchContent(uuids);
    const values = data ? [data] : [];

  
    useEffect(() => {
      if (values.length) {
        setInitialLoad(false);
      }
    }, [values]);
  
    const actionTakingPlace = isDeleting || isLoading || initialLoad || isError;

    return (
        <Modal
          titleIconVariant='warning'
          position='top' 
          variant={ModalVariant.small}
          title='Remove repository?'
          ouiaId='delete_custom_repository'
          ouiaSafe={!actionTakingPlace}
          help={
            <Popover
              headerContent={<div>Remove custom repository</div>}
              bodyContent={<div>Use this form to remove the values of an existing repository.</div>}
            >
              <Button variant='plain' aria-label='Help'>
                <OutlinedQuestionCircleIcon />
              </Button>
            </Popover>
          }
          description={
            <p className={classes.description}>
              Are you sure you want to remove this repository?
            </p>
          }
          isOpen
          onClose={onClose}
          footer={
            <Stack>
              <StackItem>
                <Button
                  className={classes.removeButton}
                  key='confirm'
                  ouiaId='delete_modal_confirm'
                  variant='danger'
                  isLoading={isLoading}
                  onClick={onSave}
                >
                  Remove
                </Button>
                <Button key='cancel' variant='link' onClick={onClose} ouiaId='edit_modal_cancel'>
                  Cancel
                </Button>
              </StackItem>
            </Stack>
          }
        >
          <Hide hide={!initialLoad}>
            <Bullseye>
              <Spinner />
            </Bullseye>
          </Hide>
          <Hide hide={initialLoad}>
            <Text className={classes.title}>Name</Text>
            <Text className={classes.textContent}>{data?.name}</Text>
            <Text className={classes.title}>URL</Text>
            <Text className={classes.textContent}>{data?.url}</Text>
            <Text className={classes.title}>Archicture</Text>
            <Text className={classes.textContent}>{data?.distribution_arch ?? 'Any'}</Text>
            <Text className={classes.title}>Versions</Text>
            <Text className={classes.textContent}>{data?.distribution_versions ?? 'Any'}</Text>
            <Text className={classes.title}>GPG Key</Text>
            <Text className={classes.textContent}>{ data?.gpg_key === undefined || data?.gpg_key === '' ? 'None' : data?.gpg_key }</Text>
          </Hide>
        </Modal>
      );
};

export default DeleteContent;
