import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { FlexItem, InputGroup, SelectVariant, TextInput } from '@patternfly/react-core';
import DropdownSelect from '../DropdownSelect/DropdownSelect';
import { FilterIcon } from '@patternfly/react-icons';
import { ContentListContext } from './ContentListContext';

const ContentListFilters = () => {
    const filters = ['Name/URL', 'Version', 'Architecture'];
    const [versionNamesLabels, setVersionNamesLabels] = useState({});
    const [archNamesLabels, setArchNamesLabels] = useState({});

    const {
        repoParams,
        setSearchQuery,
        filterType,
        setFilterType,
        selectedVersions,
        setSelectedVersions,
        selectedArches,
        setSelectedArches,
    } = useContext(ContentListContext)

    useEffect(() => {
        const arches = {}
        const versions = {}
        repoParams['distribution_arches'].forEach(arch => arches[arch.name] = arch.label );
        repoParams['distribution_versions'].forEach(version => versions[version.name] = version.label);
        setVersionNamesLabels(versions)
        setArchNamesLabels(arches)
    }, [repoParams])

    const getSelectionByType = (): ReactElement => {
        switch(filterType) {
            case 'Name/URL':
                return <TextInput id='search' placeholder='Filter by name/url' iconVariant='search' onChange={value=> setSearchQuery(value)}/>
            case 'Version':
                return (
                    <DropdownSelect
                        options={Object.keys(versionNamesLabels)}
                        variant={SelectVariant.checkbox}
                        selectedProp={selectedVersions}
                        setSelected={setSelectedVersions}
                        placeholderText={'Filter by version'}
                    />)
            case 'Architecture':
                return (
                    <DropdownSelect
                        options={Object.keys(archNamesLabels)}
                        variant={SelectVariant.checkbox}
                        selectedProp={selectedArches}
                        setSelected={setSelectedArches}
                        placeholderText={'Filter by architecture'}
                    />)
            default:
                return <></>
        }
    }

    return (
        <InputGroup>
            <FlexItem>
                <DropdownSelect
                    options={filters}
                    variant={SelectVariant.single}
                    selectedProp={filterType}
                    setSelected={setFilterType}
                    placeholderText={'filter'}
                    toggleIcon={<FilterIcon/>}
                />
            </FlexItem>
            <FlexItem>
                {getSelectionByType()}
            </FlexItem>
        </InputGroup>
    );
}

export default ContentListFilters;
