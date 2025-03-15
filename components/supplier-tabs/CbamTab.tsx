"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIAnalysisOnly } from "@/components/news-feed-analyzer"
import { RegulationOverview, UploadStatus } from "./shared-components"
import { DocumentUploadType, TabCommonProps } from "./types"
import { getCbamPrompt } from "./prompts"

interface CbamTabProps extends TabCommonProps {
  documents: DocumentUploadType[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentUploadType[]>>;
}

export function CbamTab({ 
  supplier, 
  getComplianceScore, 
  getComplianceColor, 
  handleFileUpload,
  documents,
  setDocuments
}: CbamTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <RegulationOverview
            title="EU Carbon Border Adjustment Mechanism (CBAM)"
            description="CBAM is being phased in gradually to align with the phase-out of free allowances under the EU Emissions Trading System. It aims to prevent carbon leakage by ensuring importers from non-EU countries bear similar costs for greenhouse gas emissions."
            complianceStatus={supplier.complianceStatus.cbam}
            getComplianceScore={getComplianceScore}
            getComplianceColor={getComplianceColor}
            regulationInfo="CBAM requires importers to purchase certificates corresponding to the embedded carbon emissions in their imported goods. It currently applies to cement, iron and steel, aluminium, fertilizers, electricity and hydrogen."
            documents={documents}
            handleFileUpload={handleFileUpload}
            documentType="cbam"
          />
        </div>

        <div>
          <UploadStatus 
            documents={documents}
            complianceStatus={supplier.complianceStatus.cbam}
            getComplianceColor={getComplianceColor}
          />
        </div>
      </div>

      {/* CBAM tab AI insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>CBAM Insights</CardTitle>
          <CardDescription>
            AI-powered analysis of carbon emissions and border adjustment implications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIAnalysisOnly 
            companyName={supplier.name} 
            industry={supplier.industry} 
            customPrompt={getCbamPrompt(supplier.name)}
            title="Carbon Border Adjustment Insights" 
            description="AI analysis of CBAM compliance factors" 
            regulationType="cbam"
          />
        </CardContent>
      </Card>
    </>
  )
} 