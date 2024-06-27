import React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { useDeleteTemplateItemMutate } from 'services/Templates/TemplateQueries';
import { TEMPLATES_ROUTE } from 'Routes/constants';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import { useAppContext } from 'middleware/AppContext';

export default function TemplateActionDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { pathname } = useLocation();
  const [mainRoute] = pathname?.split(`${TEMPLATES_ROUTE}/`) || [];
  const baseRoute = mainRoute + `${TEMPLATES_ROUTE}`;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { templateUUID: uuid } = useParams();
  const { rbac } = useAppContext();

  const { mutateAsync: deleteItem, isLoading: isDeleting } =
    useDeleteTemplateItemMutate(queryClient);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_, value: string | number | undefined) => {
    switch (value) {
      case 'edit':
        navigate(`${baseRoute}/${uuid}/edit`);
        setIsOpen(false);
        break;
      case 'delete':
        deleteItem(uuid as string).then(() => {
          setIsOpen(false);
          navigate(baseRoute);
        });
        break;

      default:
        setIsOpen(false);
        break;
    }
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={onSelect}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <ConditionalTooltip
          content='You do not have the required permissions to perform this action.'
          show={!rbac?.templateWrite}
          setDisabled
        >
          <MenuToggle
            isDisabled={isDeleting}
            ref={toggleRef}
            onClick={onToggleClick}
            isExpanded={isOpen}
          >
            Actions
          </MenuToggle>
        </ConditionalTooltip>
      )}
      ouiaId='template_actions'
    >
      <DropdownList>
        <DropdownItem value='edit'>Edit</DropdownItem>
        <DropdownItem isLoading={isDeleting} isDisabled={isDeleting} value='delete'>
          Delete
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
}
