import axios from 'axios';

export interface ContentItem {
    uuid: string;
    name: string;
    url: string;
    distribution_versions: Array<string>;
    distribution_arch: string;
    account_id: string;
    org_id: string;
}

export type ContentList = Array<ContentItem>;

export type Links = {
    first: string;
    last: string;
    next: string;
}

export type Meta = {
    count: number;
    limit: number;
    offset: number;
}

export interface ContentListResponse {
    data: ContentList;
    links: Links;
    meta: Meta;
}

export const getContentList: (page: number, limit: number) => Promise<ContentListResponse> = async (page, limit) => {
    try {
        const { data } = await axios.get(`/api/content_sources/v1/repositories/?offset=${(page - 1) * limit}&limit=${limit}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteContentListItem: (uuid: string) => Promise<void> = async (uuid: string) => {
    try {
        const { data } = await axios.delete(`/api/content_sources/v1/repositories/${uuid}`);
        return data;
    } catch (error) {
        throw error;
    }
};
