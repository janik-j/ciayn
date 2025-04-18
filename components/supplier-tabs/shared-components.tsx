"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Info, FileText, Upload, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react"
import { DocumentUploadType, RegulationType } from "./types"

// DocumentUploads component
interface DocumentUploadsProps {
  documents: DocumentUploadType[];
  handleFileUpload: (documentIndex: number, documentType: RegulationType) => void;
  documentType: RegulationType;
}

export function DocumentUploads({ documents, handleFileUpload, documentType }: DocumentUploadsProps) {
  return (
    <div className="space-y-3">
      {documents.map((doc, index) => (
        <div 
          key={index}
          className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <h4 className="font-medium">{doc.name}</h4>
              <Badge variant="outline" className="ml-2">
                {doc.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {doc.uploaded ? (
              <>
                <Badge className="bg-emerald-100 text-emerald-800">Uploaded</Badge>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                onClick={() => handleFileUpload(index, documentType)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// UploadStatus component
interface UploadStatusProps {
  documents: DocumentUploadType[];
  complianceStatus: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
  getComplianceColor: (status: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown") => string;
}

export function UploadStatus({ documents, complianceStatus, getComplianceColor }: UploadStatusProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Upload Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Documentation Completeness</h3>
              <span className="text-sm font-medium">
                {documents.filter(doc => doc.uploaded).length}/{documents.length}
              </span>
            </div>
            <Progress 
              value={documents.filter(doc => doc.uploaded).length / documents.length * 100} 
              className="h-2"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Required Documents</h3>
            <div className="space-y-2">
              {documents
                .filter(doc => doc.status === "Required")
                .map((doc, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                  >
                    <span>{doc.name}</span>
                    {doc.uploaded ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <h3 className="text-sm font-medium mb-2">Next Steps</h3>
          <ul className="space-y-2 text-sm">
            {documents.some(doc => doc.status === "Required" && !doc.uploaded) && (
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <span>Upload all required documents to improve compliance</span>
              </li>
            )}
            {complianceStatus === "Partially Compliant" && (
              <li className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <span>Review documentation to ensure all required information is included</span>
              </li>
            )}
            {complianceStatus === "Non-Compliant" && (
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <span>Urgent action required - address compliance gaps immediately</span>
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// RegulationOverview component
interface RegulationOverviewProps {
  title: string;
  description: string;
  complianceStatus: number;
  getComplianceScore: (score: number) => string;
  getComplianceColor: (score: number) => string;
  regulationInfo: string;
  documents: DocumentUploadType[];
  handleFileUpload: (() => void) | ((file: File) => Promise<any>);
  documentType: 'lksg' | 'csrd' | 'cbam' | 'reach';
}

export function RegulationOverview({
  title,
  description,
  complianceStatus,
  getComplianceScore,
  getComplianceColor,
  regulationInfo,
  documents,
  handleFileUpload,
  documentType
}: RegulationOverviewProps) {
  // File input ref
  const handleUploadClick = () => {
    if (typeof handleFileUpload === 'function') {
      // Handle different types of handleFileUpload functions
      if ('length' in handleFileUpload && handleFileUpload.length === 0) {
        // If it takes no parameters, just call it directly (for modal)
        (handleFileUpload as () => void)();
      } else {
        // Otherwise use the file input approach
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip';
        fileInput.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files[0]) {
            // Use a type guard to ensure we're passing the right arguments
            // Cast to the documentIndex and documentType handler
            if (documentType) {
              // Cast to the document handler with two parameters
              const docHandler = handleFileUpload as (index: number, type: RegulationType) => void;
              // Pass a default index of 0 and the document type
              docHandler(0, documentType);
            } else {
              // Cast to the file handler with one parameter
              const fileHandler = handleFileUpload as (file: File) => Promise<any>;
              fileHandler(files[0]);
            }
          }
        };
        fileInput.click();
      }
    }
  };

  // Calculate if all documents are uploaded
  const allDocumentsUploaded = documents.every(doc => doc.uploaded);

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Display status badge at top when all documents are uploaded */}
        {allDocumentsUploaded && (
          <div className="flex justify-end mb-3">
            <Badge className={getComplianceColor(complianceStatus)}>
              {complianceStatus}
            </Badge>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Compliance Status</h3>
          <div className="flex items-center gap-3">
            <Badge className={getComplianceColor(complianceStatus)}>
              {complianceStatus}
            </Badge>
            <Progress 
              value={parseFloat(getComplianceScore(complianceStatus as any).toString())}
              className="flex-1 h-2"
            />
            <span className="text-sm font-medium">
              {getComplianceScore(complianceStatus as any)}%
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle className="ml-2 text-sm font-medium">Regulation Overview</AlertTitle>
            <AlertDescription className="ml-2 text-sm">
              {regulationInfo}
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center pt-2">
            <h3 className="text-sm font-medium">Required Documentation</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUploadClick}
              className="text-xs"
            >
              Edit Documents
            </Button>
          </div>
          <DocumentUploads 
            documents={documents} 
            handleFileUpload={handleFileUpload as any} 
            documentType={documentType} 
          />
        </div>
      </CardContent>
    </Card>
  );
} 