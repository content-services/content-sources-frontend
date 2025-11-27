import { SetStateAction } from 'react';
import {
  AdditionalUuid,
  AllowedArchitecture,
  AllowedOSVersion,
  HardcodedUuid,
  OtherUuid,
  SnapshotDate,
  TemplateDetail,
  TemplateRequestToSend,
  TemplateTitle,
  UseSnapshot,
} from './types';
import { TemplateServer } from './types.server';

// Storage

export type SaveArchitecture = (architecture: AllowedArchitecture) => void;
export type SaveOSVersion = (version: AllowedOSVersion) => void;
export type SaveHardcodedUUIDs = (uuids: HardcodedUuid[]) => void;
export type SaveAdditionalUUIDs = SetStateAction<AdditionalUuid[]>;

export type SaveOtherUUIDs = (uuids: OtherUuid[]) => void;
export type SaveSnapshotDate = (date: SnapshotDate) => void;
export type SaveIsLatestSnapshot = (isLatest: UseSnapshot) => void;
export type SaveTitle = (title: TemplateTitle) => void;
export type SaveDetail = (detail: TemplateDetail) => void;
export type ResetTemplateRequestContent = () => void;

export type TemplateRequestApi = {
  setArchitecture: SaveArchitecture;
  setOSVersion: SaveOSVersion;
  setHardcodedUUIDs: SaveHardcodedUUIDs;
  setAdditionalUUIDs: SaveAdditionalUUIDs;
  setOtherUUIDs: SaveOtherUUIDs;
  setSnapshotDate: SaveSnapshotDate;
  setIsLatestSnapshot: SaveIsLatestSnapshot;
  setTitle: SaveTitle;
  setDetail: SaveDetail;
  resetTemplateRequestContent: ResetTemplateRequestContent;
};

// Network

export type MutateTemplateRequest = (request: TemplateRequestToSend) => Promise<TemplateServer>;
