import axios from 'axios';

export interface LightwellTokenCreateRequest {
  name: string;
  user_id?: string;
  expires_at?: string;
}

export interface LightwellTokenResponse {
  uuid: string;
  org_id: string;
  user_id: string;
  name: string;
  token_prefix: string;
  /** Plaintext token; only present on create */
  token?: string;
  expires_at: string;
  revoked_at?: string | null;
  last_used_at?: string | null;
  created_at: string;
}

export type LightwellTokensResponse = LightwellTokenResponse[];

const TOKENS_BASE = '/api/content-sources/v1/tokens/';

export const listLightwellTokens = async (): Promise<LightwellTokensResponse> => {
  const { data } = await axios.get(TOKENS_BASE);
  return data;
};

export const createLightwellToken = async (
  request: LightwellTokenCreateRequest,
): Promise<LightwellTokenResponse> => {
  const { data } = await axios.post(TOKENS_BASE, request);
  return data;
};

export const revokeLightwellToken = async (uuid: string): Promise<void> => {
  await axios.delete(`${TOKENS_BASE}${uuid}`);
};
