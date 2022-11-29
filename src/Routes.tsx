import { Routes, Route, Navigate } from 'react-router-dom';

import { ErrorPage } from './components/Error/ErrorPage';
import ContentPage from './pages/ContentPage/ContentPage';

export const DEFAULT_ROUTE = '';

export default function MainRoutes() {
  return (
    <Routes>
      <Route
        path={DEFAULT_ROUTE}
        element={
          <ErrorPage>
            <ContentPage />
          </ErrorPage>
        }
      />
      <Route path='*' element={<Navigate to={DEFAULT_ROUTE} replace />} />
    </Routes>
  );
}
