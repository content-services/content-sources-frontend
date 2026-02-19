import { getRedHatCoreRepoUrls } from './templateHelpers';

it('Test getRedHatCoreRepoUrls', () => {
  let result = getRedHatCoreRepoUrls('x86_64', '8') as string[];
  expect(result).toHaveLength(2);
  expect(result[0]).toEqual('https://cdn.redhat.com/content/dist/rhel8/8/x86_64/appstream/os');

  result = getRedHatCoreRepoUrls('aarch64', '9') as string[];
  expect(result).toHaveLength(2);
  expect(result[0]).toEqual('https://cdn.redhat.com/content/dist/rhel9/9/aarch64/appstream/os');

  result = getRedHatCoreRepoUrls('stuff', '12') as string[];
  expect(result).toBeUndefined();
});
