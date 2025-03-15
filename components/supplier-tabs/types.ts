import { Dispatch, SetStateAction } from "react";

export type DisplaySupplierData = {
  id?: string;
  name: string;
  industry: string;
  country: string;
  employees: number;
  website: string;
  esgRisk: {
    environmental: "Low" | "Medium" | "High";
    social: "Low" | "Medium" | "High";
    governance: "Low" | "Medium" | "High";
  };
  redFlags: string[];
  complianceStatus: {
    lksg: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    cbam: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    csdd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    csrd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    reach: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
  };
  recommendations: string[];
}

export type DocumentUploadType = {
  name: string;
  description: string;
  status: "Required" | "Recommended";
  uploaded: boolean;
};

export type RegulationType = 'lksg' | 'csrd' | 'cbam' | 'reach';

export interface TabCommonProps {
  supplier: DisplaySupplierData;
  getComplianceScore: (status: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown") => number;
  getComplianceColor: (status: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown") => string;
  handleFileUpload: (documentIndex: number, documentType: RegulationType) => void;
} 