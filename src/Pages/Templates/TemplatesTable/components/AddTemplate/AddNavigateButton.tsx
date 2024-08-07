import { useWizardContext, Flex, Button, ButtonVariant } from '@patternfly/react-core';
import DropdownMenu from 'components/DropdownMenu/DropdownMenu';
import useRootPath from 'Hooks/useRootPath';
import { useNavigate } from 'react-router-dom';
import { TEMPLATES_ROUTE, DETAILS_ROUTE, SYSTEMS_ROUTE, ADD_ROUTE } from 'Routes/constants';
import type { TemplateItem } from 'services/Templates/TemplateApi';

interface Props {
  isAdding: boolean;
  add: () => Promise<TemplateItem>;
  onClose: () => void;
}

export const AddNavigateButton = ({ isAdding, add, onClose }: Props) => {
  const root = useRootPath();
  const navigate = useNavigate();
  const { goToPrevStep } = useWizardContext();

  return (
    <Flex gap={{ default: 'gapMd' }} style={{ padding: '24px' }} direction={{ default: 'row' }}>
      <Button variant={ButtonVariant.secondary} onClick={goToPrevStep}>
        Back
      </Button>

      <DropdownMenu
        dropDownItems={[{ isDisabled: isAdding, children: 'Create template only', type: 'submit' }]}
        onSelect={() => add().then(() => onClose())}
        menuValue=''
        menuToggleProps={{
          isFullWidth: false,
          variant: 'primary',
          splitButtonOptions: {
            variant: 'action',
            items: [
              <Button
                key='submit'
                variant={ButtonVariant.primary}
                isLoading={isAdding}
                isDisabled={isAdding}
                onClick={() =>
                  add().then((resp) => {
                    navigate(
                      `${root}/${TEMPLATES_ROUTE}/${resp.uuid}/${DETAILS_ROUTE}/${SYSTEMS_ROUTE}/${ADD_ROUTE}`,
                    );
                  })
                }
              >
                Create template and add to systems
              </Button>,
            ],
          },
        }}
      />
    </Flex>
  );
};