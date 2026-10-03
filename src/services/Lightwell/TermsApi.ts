import axios from 'axios';

export interface TermsRequiredResponse {
  required: boolean;
}

export const getTermsRequired = async (): Promise<TermsRequiredResponse> => {
  const { data } = await axios.get<TermsRequiredResponse>(
    '/api/content-sources/v1/lightwell/terms/required',
  );
  return data;
};
