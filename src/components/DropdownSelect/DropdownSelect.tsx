import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Filters } from '../ContentListTable/ContentListContext';

type DropdownSelectProps = {
    options: Array<string>,
    variant: SelectVariant.single | SelectVariant.checkbox
    selectedProp: string | Array<string> | Filters,
    setSelected: Dispatch<SetStateAction<Array<string>>> | Dispatch<SetStateAction<Filters>>,
    toggleIcon?: React.ReactElement
    placeholderText?: string | React.ReactNode
}

const DropdownSelect = ({options, variant, selectedProp, setSelected, toggleIcon, placeholderText}: DropdownSelectProps) => {

    const selected: SetStateAction<Array<string>> | SetStateAction<Filters> = Array.isArray(selectedProp) ? selectedProp : [selectedProp]
    const [isOpen, setIsOpen] = useState(false);
    const onToggle = isOpen => setIsOpen(isOpen)

    const selectFrom = options.map(option => <SelectOption  key={option} value={option}/>);

    const onSelect = (event, selection) => {
        switch(variant) {
            case SelectVariant.single:
                setSelected(selection);
                setIsOpen(false);
                break;

            case SelectVariant.checkbox:
                if (Array.isArray(selectedProp)) {
                    if (selected.includes(selection)) {
                        const remaining = selected.filter(item => item !== selection)
                        setSelected(remaining);
                        break;
                    }
                    setSelected([ ...selected, selection ])
                    break;
                }
        }
    }

    return(
        <Select
            variant={variant}
            onSelect={onSelect}
            selections={selected}
            isOpen={isOpen}
            onToggle={onToggle}
            placeholderText={placeholderText}
            isCheckboxSelectionBadgeHidden
            toggleIcon={toggleIcon}
        >
            {selectFrom}
        </Select>
    );
};

export default DropdownSelect;
