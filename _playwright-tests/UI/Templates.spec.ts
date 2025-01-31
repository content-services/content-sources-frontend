import { describe } from 'node:test';
import { test } from '@playwright/test';
import { navigateToTemplates } from './helpers/navHelpers';
import { closePopupsIfExist } from '../helpers/loginHelpers';

describe('Templates', () => {
  test('Navigate to templates, make sure the Add content template button can be clicked', async ({
    page,
  }) => {
    await navigateToTemplates(page);
    await closePopupsIfExist(page);

    const AddButton = page.locator('[data-ouia-component-id="create_content_template"]');

    if (await AddButton.first().isDisabled())
      throw Error("The Add content template button is disabled when it shouldn't be");
  });
});
