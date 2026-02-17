import { useState } from 'react';

export const useDropdownGroup = () => {
  const [isExpanded, setIsExpandedList] = useState({
    architecture: false,
    osVersion: false,
  });

  const toggleIsExpandedList = (list) => {
    setIsExpandedList((state) => {
      const previous = state[list];
      return { ...state, [list]: !previous };
    });
  };

  const expandList = (patch) => {
    setIsExpandedList((state) => ({ ...state, ...patch }));
  };

  return { toggleIsExpandedList, isExpanded, expandList };
};
