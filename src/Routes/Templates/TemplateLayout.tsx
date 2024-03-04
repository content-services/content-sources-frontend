import { Outlet } from 'react-router-dom';

import Header from '../../components/Header/Header';

export default function TemplateLayout() {
  return (
    <>
      <Header
        title='Templates'
        ouiaId='templates_description'
        paragraph='View all content templates within your organization.'
      />
      <Outlet />
    </>
  );
}
