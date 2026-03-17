import apiClient from "./apiClient";

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

export class DigitalContractService {
    static async getContracts(
        tab: string,
        page: number = 1,
        limit: number = 10,
        hasCount: boolean = true,
        keyword: string = ""
    ): Promise<ContractListResponse> {
        const url = `/contract/api/list`;

        try {
            const response = await apiClient.get<ContractListResponse>(url, {
                params: {
                    tab,
                    page,
                    limit,
                    hasCount,
                    keyword
                }
            });
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching contracts for tab ${tab}:`, error.message || error);
            if (error.response && error.response.data) {
                console.error("API Error Response JSON:", JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    }
}
