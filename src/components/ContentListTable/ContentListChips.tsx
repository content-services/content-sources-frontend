import React, { useContext } from 'react';
import { Button, Chip, ChipGroup } from '@patternfly/react-core';
import { ContentListContext } from './ContentListContext';
import Hide from '../Hide/Hide';

const ContentListChips = () => {
  const {
    filterData,
    searchQuery,
    setSearchQuery,
    selectedVersions,
    setSelectedVersions,
    selectedArches,
    setSelectedArches,
  } = useContext(ContentListContext);

  const deleteItem = (id: string, chips, setChips) => {
    const copyOfChips = [...chips];
    const filteredCopy = copyOfChips.filter((chip) => chip !== id);
    setChips(filteredCopy);
  };

  const clearFilters = () => {
    setSelectedVersions([]);
    setSelectedArches([]);
    setSearchQuery('');
  };

  return (
    <>
      <Hide hide={searchQuery == '' && !selectedVersions?.length && !selectedArches?.length}>
        <ChipGroup categoryName={'Version'}>
          {selectedVersions.map((version) => (
            <Chip
              key={version}
              onClick={() => deleteItem(version, selectedVersions, setSelectedVersions)}
            >
              {version}
            </Chip>
          ))}
        </ChipGroup>
        <ChipGroup categoryName={'Architecture'}>
          {selectedArches.map((arch) => (
            <Chip key={arch} onClick={() => deleteItem(arch, selectedArches, setSelectedArches)}>
              {arch}
            </Chip>
          ))}
        </ChipGroup>
        {searchQuery !== '' && (
          <ChipGroup categoryName={'Name/URL'}>
            <Chip key={'search_chip'} onClick={() => setSearchQuery('')}>
              {searchQuery}
            </Chip>
          </ChipGroup>
        )}
        {((filterData.searchQuery !== '' && searchQuery !== '') ||
          !!selectedVersions?.length ||
          !!selectedArches?.length) && (
          <Button onClick={clearFilters} variant='link' isInline>
            Clear filters
          </Button>
        )}
      </Hide>
    </>
  );
};

export default ContentListChips;
