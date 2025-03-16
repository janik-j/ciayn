"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIAnalysisOnly } from "@/components/news-feed-analyzer"
import { RegulationOverview, UploadStatus } from "./shared-components"
import { DocumentUploadType, TabCommonProps } from "./types"
import { getLksgPrompt } from "./prompts"
import { useState } from "react"

interface LksgTabProps extends TabCommonProps {
  documents: DocumentUploadType[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentUploadType[]>>;
}

export function LksgTab({ 
  supplier, 
  getComplianceScore, 
  getComplianceColor, 
  handleFileUpload,
  documents,
  setDocuments
}: LksgTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <RegulationOverview
            title="German Supply Chain Act (LkSG)"
            description="The German Act on Corporate Due Diligence Obligations in Supply Chains has been in force since January 1, 2023. It initially applied to companies with at least 3,000 employees in Germany and expanded to those with at least 1,000 employees from 2024."
            complianceStatus={supplier.complianceStatus.lksg}
            getComplianceScore={getComplianceScore}
            getComplianceColor={getComplianceColor}
            regulationInfo="This legislation establishes mandatory human rights and environmental due diligence requirements along the entire supply chain. Companies must establish risk management systems, analyze human rights risks, and implement preventive measures."
            documents={documents}
            handleFileUpload={handleFileUpload}
            documentType="lksg"
          />
        </div>

        <div>
          <UploadStatus 
            documents={documents}
            complianceStatus={supplier.complianceStatus.lksg}
            getComplianceColor={getComplianceColor}
          />
        </div>
      </div>

      {/* LkSG tab AI insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>LkSG Insights from Latest News</CardTitle>
          <CardDescription>
            AI-powered analysis of supply chain due diligence and human rights issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIAnalysisOnly 
            companyName={supplier.name} 
            industry={supplier.industry} 
            customPrompt={getLksgPrompt(supplier.name)}
            title="Supply Chain Due Diligence Insights" 
            description="AI analysis of LkSG compliance factors" 
            regulationType="lksg"
          />
        </CardContent>
      </Card>
    </>
  )
} 