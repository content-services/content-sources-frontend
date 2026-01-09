import axios from 'axios';
import { MutateTemplateRequest } from '../core/ports.output';

export const createTemplate: MutateTemplateRequest = async (request) => {
  const { data } = await axios.post('/api/content-sources/v1.0/templates/', request);
  return data;
};
