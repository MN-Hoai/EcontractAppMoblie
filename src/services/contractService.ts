import axios from "axios";

const API_BASE_URL = "http://  192.168.1.72:5000";

export interface Contract {
  ContractId: string;
  ContractName: string;
  ContractPath: string;
  ContractDate: string;
  Status: number;
}

export interface ContractApiResponse {
  message: string;
  data: Contract[];
  totalCount: number;
}

export const getContracts = async (accountId: string): Promise<Contract[]> => {
  try {
    const url = `${API_BASE_URL}/api/contracts?accountId=${accountId}`;
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw error;
  }
};


export interface FdfData {
  [key: string]: string | number | boolean;
}

// Parse FDF content and extract field values
export const parseFdfData = (fdfContent: string): FdfData => {
  const data: FdfData = {};

  // FDF format typically looks like:
  // /T (FieldName) /V (Field Value)
  // This regex extracts field names and values
  const fieldRegex = /\/T\s*\(\s*([^)]+)\s*\)\s*\/V\s*\(\s*([^)]*)\s*\)/g;

  let match;
  while ((match = fieldRegex.exec(fdfContent)) !== null) {
    const fieldName = match[1].trim();
    const fieldValue = match[2].trim();
    data[fieldName] = fieldValue;
  }

  return data;
};

// Fetch FDF data for a specific contract
export const fetchContractFdf = async (
  contractId: string,
  accountId: string,
): Promise<string> => {
  try {
    const url = `${API_BASE_URL}/api/contracts/${contractId}/fdf?accountId=${accountId}`;
    const response = await axios.get(url, {
      headers: {
        Accept: "application/x-fdf",
        "Content-Type": "application/x-fdf",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching FDF:", error);
    throw error;
  }
};

// Get FDF file directly by URL
export const fetchFdfByUrl = async (fdfUrl: string): Promise<string> => {
  try {
    const fullUrl = fdfUrl.startsWith("http")
      ? fdfUrl
      : `${API_BASE_URL}${fdfUrl}`;

    const response = await axios.get(fullUrl, {
      responseType: "text",
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching FDF by URL:", error);
    throw error;
  }
};

// Fetch contract details with FDF data
export const fetchContractWithFdf = async (
  contractId: string,
  accountId: string,
): Promise<{ contractDetails: any; fdfData: FdfData }> => {
  try {
    // Fetch contract details
    const contractUrl = `${API_BASE_URL}/api/contracts/${contractId}?accountId=${accountId}`;
    const contractResponse = await axios.get(contractUrl);

    // Fetch FDF data if available
    let fdfData: FdfData = {};
    if (contractResponse.data.fdfPath) {
      const fdfContent = await fetchFdfByUrl(contractResponse.data.fdfPath);
      fdfData = parseFdfData(fdfContent);
    }

    return {
      contractDetails: contractResponse.data,
      fdfData,
    };
  } catch (error) {
    console.error("Error fetching contract with FDF:", error);
    throw error;
  }
};
