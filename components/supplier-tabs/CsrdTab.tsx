"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIAnalysisOnly } from "@/components/news-feed-analyzer"
import { RegulationOverview, UploadStatus } from "./shared-components"
import { DocumentUploadType, TabCommonProps } from "./types"
import { getCsrdPrompt } from "./prompts"

interface CsrdTabProps extends TabCommonProps {
  documents: DocumentUploadType[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentUploadType[]>>;
}

export function CsrdTab({ 
  supplier, 
  getComplianceScore, 
  getComplianceColor, 
  handleFileUpload,
  documents,
  setDocuments
}: CsrdTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <RegulationOverview
            title="Corporate Sustainability Reporting Directive (CSRD)"
            description="The CSRD introduces expanded sustainability reporting requirements with phased implementation starting in 2024 for certain companies."
            complianceStatus={supplier.complianceStatus.csrd}
            getComplianceScore={getComplianceScore}
            getComplianceColor={getComplianceColor}
            regulationInfo="The CSRD introduces a more detailed reporting requirement that requires companies to report according to mandatory European Sustainability Reporting Standards (ESRS). It covers environmental, social, governance, and human rights aspects."
            documents={documents}
            handleFileUpload={handleFileUpload}
            documentType="csrd"
          />
        </div>

        <div>
          <UploadStatus 
            documents={documents}
            complianceStatus={supplier.complianceStatus.csrd}
            getComplianceColor={getComplianceColor}
          />
        </div>
      </div>

      {/* CSRD tab AI insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>CSRD Insights</CardTitle>
          <CardDescription>
            AI-powered analysis of sustainability reporting and disclosure practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIAnalysisOnly 
            companyName={supplier.name} 
            industry={supplier.industry} 
            customPrompt={getCsrdPrompt(supplier.name)}
            title="Sustainability Reporting Insights" 
            description="AI analysis of CSRD compliance factors" 
            regulationType="csrd"
          />
        </CardContent>
      </Card>
    </>
  )
} 