import {
  FC,
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
  useId,
  MouseEvent as ReactMouseEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  MenuToggle,
  Popper,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  ToolbarLabel,
  ToolbarFilter,
} from '@patternfly/react-core';
import { AngleDownIcon, TimesIcon } from '@patternfly/react-icons';

const isToolbarLabel = (label: string | ToolbarLabel): label is ToolbarLabel =>
  typeof label === 'object' && 'key' in label;

export interface DataViewTypeaheadCheckboxFilterProps {
  filterId: string;
  value?: string[];
  title: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  onChange?: (event?: React.MouseEvent, values?: string[]) => void;
  showToolbarItem?: boolean;
  ouiaId?: string;
  isDisabled?: boolean;
  noResultsMessage?: string;
  'aria-label'?: string;
}

export const DataViewTypeaheadCheckboxFilter: FC<DataViewTypeaheadCheckboxFilterProps> = ({
  filterId,
  value = [],
  title,
  placeholder,
  options = [],
  onChange,
  showToolbarItem = true,
  ouiaId = 'DataViewTypeaheadCheckboxFilter',
  isDisabled = false,
  noResultsMessage = 'No results found',
  'aria-label': ariaLabel,
}: DataViewTypeaheadCheckboxFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const listId = `${filterId}-${id}-list`;
  const menuIsOpen = isOpen && !isDisabled && showToolbarItem;

  const filteredOptions = useMemo(
    () => options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );
  const focusedOption = focusedIndex === null ? undefined : filteredOptions[focusedIndex];

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(null);
  }, []);

  const handleToggleClick = (event: ReactMouseEvent) => {
    event.stopPropagation();
    if (isDisabled) return;
    if (menuIsOpen) closeMenu();
    else setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleSelect = (event?: ReactMouseEvent, itemId?: string) => {
    if (isDisabled || itemId === undefined) return;
    if (!options.some((option) => option.value === itemId)) return;
    const isSelected = value.includes(itemId);

    onChange?.(event, isSelected ? value.filter((item) => item !== itemId) : [...value, itemId]);
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      if (!filteredOptions.length) return;

      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setFocusedIndex((current) =>
        current === null
          ? direction === 1
            ? 0
            : filteredOptions.length - 1
          : (current + direction + filteredOptions.length) % filteredOptions.length,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (menuIsOpen && focusedOption) handleSelect(undefined, focusedOption.value);
      else setIsOpen(true);
    } else if (event.key === 'Tab') {
      closeMenu();
    }
  };

  useEffect(() => {
    if (!menuIsOpen) return;
    const containsTarget = (target: EventTarget | null) =>
      menuRef.current?.contains(target as Node) || toggleRef.current?.contains(target as Node);
    const handleClickOutside = (event: MouseEvent) => {
      if (!containsTarget(event.target)) closeMenu();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && containsTarget(event.target)) {
        event.preventDefault();
        closeMenu();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [menuIsOpen, closeMenu]);

  useEffect(() => {
    if (isDisabled || !showToolbarItem) {
      closeMenu();
      setSearch('');
    }
  }, [isDisabled, showToolbarItem, closeMenu]);

  useEffect(() => {
    if (value.length === 0) {
      setSearch('');
      setFocusedIndex(null);
    }
  }, [value.length]);

  return (
    <ToolbarFilter
      key={ouiaId}
      data-ouia-component-id={ouiaId}
      labels={value.map((item) => ({
        key: item,
        node: options.find((option) => option.value === item)?.label ?? item,
      }))}
      deleteLabel={(_, label) => {
        if (isDisabled) return;
        onChange?.(
          undefined,
          value.filter((item) => item !== (isToolbarLabel(label) ? label.key : label)),
        );
      }}
      categoryName={title}
      showToolbarItem={showToolbarItem}
    >
      <Popper
        trigger={
          <TextInputGroup innerRef={toggleRef} isDisabled={isDisabled} style={{ width: '240px' }}>
            <TextInputGroupMain
              innerRef={inputRef}
              aria-label={ariaLabel ?? `Filter by ${title}`}
              role='combobox'
              aria-controls={listId}
              aria-activedescendant={
                menuIsOpen && focusedOption ? `${listId}-${focusedIndex}` : undefined
              }
              isExpanded={menuIsOpen}
              autoComplete='off'
              placeholder={placeholder ?? title}
              value={search}
              onClick={() => setIsOpen(true)}
              onChange={(_event, text) => {
                setSearch(text);
                setFocusedIndex(null);
                setIsOpen(true);
              }}
              onKeyDown={handleInputKeyDown}
            />
            <TextInputGroupUtilities>
              {search && (
                <Button
                  variant='plain'
                  aria-label={`Clear ${title} search`}
                  isDisabled={isDisabled}
                  icon={<TimesIcon />}
                  onClick={() => {
                    setSearch('');
                    setFocusedIndex(null);
                    inputRef.current?.focus();
                  }}
                />
              )}
              <MenuToggle
                ouiaId={`${ouiaId}-toggle`}
                variant='plain'
                onClick={handleToggleClick}
                aria-label={`Toggle ${title} filter`}
                isExpanded={menuIsOpen}
                isDisabled={isDisabled}
                icon={<AngleDownIcon />}
              />
            </TextInputGroupUtilities>
          </TextInputGroup>
        }
        triggerRef={toggleRef}
        popper={
          <Menu
            ref={menuRef}
            ouiaId={`${ouiaId}-menu`}
            onSelect={handleSelect}
            selected={value}
            isScrollable
            role='listbox'
          >
            <MenuContent maxMenuHeight='300px'>
              <MenuList
                id={listId}
                isAriaMultiselectable
                aria-label={ariaLabel ?? `Filter by ${title}`}
              >
                {menuIsOpen &&
                  (filteredOptions.length ? (
                    filteredOptions.map((option, index) => (
                      <MenuItem
                        data-ouia-component-id={`${ouiaId}-filter-item-${option.value}`}
                        key={option.value}
                        itemId={option.value}
                        id={`${listId}-${index}`}
                        isSelected={value.includes(option.value)}
                        isFocused={focusedIndex === index}
                        hasCheckbox
                      >
                        {option.label}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem isDisabled>{noResultsMessage}</MenuItem>
                  ))}
              </MenuList>
            </MenuContent>
          </Menu>
        }
        popperRef={menuRef}
        aria-label={`${title} filter`}
        isVisible={menuIsOpen}
      />
    </ToolbarFilter>
  );
};

export default DataViewTypeaheadCheckboxFilter;
