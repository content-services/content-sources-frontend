import { lookupUrls } from './lookupUrls';

it('Test hardcodeRedHatReposByArchAndVersion', () => {
  let result = lookupUrls({ architecture: 'x86_64', osVersion: '8' });
  expect(result).toHaveLength(2);
  expect(result[0]).toEqual('https://cdn.redhat.com/content/dist/rhel8/8/x86_64/appstream/os/');

  result = lookupUrls({ architecture: 'aarch64', osVersion: '9' });
  expect(result).toHaveLength(2);
  expect(result[0]).toEqual('https://cdn.redhat.com/content/dist/rhel9/9/aarch64/appstream/os/');
});
