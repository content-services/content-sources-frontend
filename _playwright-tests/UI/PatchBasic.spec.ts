import { test } from 'test-utils';
import { navigateToSystems } from './helpers/navHelpersPatch';
import { closePopupsIfExist } from './helpers/helpers';

test.describe('Systems', () => {
  test('Navigate to systems, make sure the Plan remediation button can not be clicked', async ({
    page,
  }) => {
    await navigateToSystems(page);
    await closePopupsIfExist(page);

    await page.getByRole('button', { name: 'Plan remediation' }).isDisabled();

  });
});
