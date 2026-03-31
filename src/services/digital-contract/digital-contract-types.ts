/**
 * Digital Contract domain types
 */

export interface DigitalContract {
  Contract: {
    Id: string;
    Code: string;
    ContractCode: string;
    ContractName: string;
    Name: string;
    Status: number;
    FileFinalPath: string | null;
    CreatedDate: string | null;
    UpdatedDate: string | null;
    CompanyAId: string | null;
    CompanyAName: string | null;
    Org_Id: string | null;
    Org_Name: string | null;
    CreatedBy: string | null;
    CurrentStepPriority: number | null;
    TotalSteps: number | null;
    RequestSentDate: string | null;
  };
  ContractDetail: any;
  DocumentOriginal: {
    Id: number;
    Name: string;
    Path: string;
    Type: string;
    Size: string;
  } | null;
  DocumentFinal: {
    Id: number;
    Name: string;
    Path: string;
    Path_Final: string | null;
    Type: string;
    Size: string;
  } | null;
}

export interface ContractListResponse {
  Count: number;
  Many: DigitalContract[];
  Skip: number;
  Take: number;
  Message: string | null;
}
