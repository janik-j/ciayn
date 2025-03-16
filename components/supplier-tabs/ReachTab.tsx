"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIAnalysisOnly } from "@/components/news-feed-analyzer"
import { RegulationOverview, UploadStatus } from "./shared-components"
import { DocumentUploadType, TabCommonProps } from "./types"
import { getReachPrompt } from "./prompts"

interface ReachTabProps extends TabCommonProps {
  documents: DocumentUploadType[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentUploadType[]>>;
}

export function ReachTab({ 
  supplier, 
  getComplianceScore, 
  getComplianceColor, 
  handleFileUpload,
  documents,
  setDocuments
}: ReachTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <RegulationOverview
            title="EU REACH Regulation"
            description="REACH (Registration, Evaluation, Authorization and Restriction of Chemicals) is a European Union regulation concerning chemicals and their safe use, which aims to improve the protection of human health and the environment."
            complianceStatus={supplier.complianceStatus.reach}
            getComplianceScore={getComplianceScore}
            getComplianceColor={getComplianceColor}
            regulationInfo="REACH places the responsibility on companies to manage the risks from chemicals and to provide safety information on the substances. Manufacturers and importers must register each substance manufactured or imported in quantities of 1 tonne or more per year."
            documents={documents}
            handleFileUpload={handleFileUpload}
            documentType="reach"
          />
        </div>

        <div>
          <UploadStatus 
            documents={documents}
            complianceStatus={supplier.complianceStatus.reach}
            getComplianceColor={getComplianceColor}
          />
        </div>
      </div>

      {/* REACH tab AI insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>REACH Insights from Latest News</CardTitle>
          <CardDescription>
            AI-powered analysis of chemical regulation compliance and safety management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIAnalysisOnly 
            companyName={supplier.name} 
            industry={supplier.industry} 
            customPrompt={getReachPrompt(supplier.name)}
            title="Chemical Regulation Insights" 
            description="AI analysis of REACH compliance factors" 
            regulationType="reach"
          />
        </CardContent>
      </Card>
    </>
  )
} 