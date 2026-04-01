/**
 * Digital Contract domain types
 */

export interface DigitalContractInfo {
  id: string;
  code: string;
  contractCode: string;
  contractName: string;
  name: string;
  status: number;
  fileFinalPath: string | null;
  createdDate: string | null;
  updatedDate: string | null;
  companyAId: string | null;
  companyAName: string | null;
  orgId: string | null;
  orgName: string | null;
  createdBy: string | null;
  currentStepPriority: number | null;
  totalSteps: number | null;
  requestSentDate: string | null;
}

export interface DigitalContractDocument {
  id: number;
  name: string;
  path: string;
  type: string;
  size: string;
}

export interface DigitalContractFinalDocument extends DigitalContractDocument {
  pathFinal: string | null;
}

export interface DigitalContract {
  contract: DigitalContractInfo;
  contractDetail: any;
  documentOriginal: DigitalContractDocument | null;
  documentFinal: DigitalContractFinalDocument | null;
}

export interface ContractListResponse {
  count: number;
  many: DigitalContract[];
  skip: number;
  take: number;
  message: string | null;
}
