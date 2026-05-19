import { useState } from 'react';

export const usePackageTablePagination = ({ perPageKey }) => {
  const [page, setPage] = useState(1);
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [perPage, setPerPage] = useState(storedPerPage);

  const onPerPageSelect = (_, newPerPage, newPage) => {
    // Save this value through page refresh for use on next reload
    setPerPage(newPerPage);
    setPage(newPage);
    localStorage.setItem(perPageKey, newPerPage.toString());
  };

  const onSetPage = (_, newPage) => setPage(newPage);

  return { page, perPage, onPerPageSelect, onSetPage, setPage };
};
