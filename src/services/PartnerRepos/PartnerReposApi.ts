import axios from 'axios';

export const toggleAsPartner = async (uuid: string, partner: boolean): Promise<void> => {
  console.log('TOGGLE PARTNER');

  await axios.patch(`/api/content-sources/v1/admin/repositories/${uuid}/partner`, {
    partner,
  });
};
