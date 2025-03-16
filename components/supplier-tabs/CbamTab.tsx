"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIAnalysisOnly } from "@/components/news-feed-analyzer"
import { RegulationOverview, UploadStatus } from "./shared-components"
import { DocumentUploadType, TabCommonProps } from "./types"
import { getCbamPrompt } from "./prompts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState<number | null>(null)
  
  // Find a document that needs uploading 
  const openUploadModal = (documentIndex: number) => {
    setSelectedDocumentIndex(documentIndex)
    setIsUploadModalOpen(true)
  }
  
  const closeUploadModal = () => {
    setIsUploadModalOpen(false)
    setSelectedDocumentIndex(null)
  }
  
  // Function to handle the upload from the modal
  const handleModalUpload = () => {
    if (selectedDocumentIndex !== null) {
      handleFileUpload(selectedDocumentIndex, 'cbam')
      closeUploadModal()
    }
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>EU Carbon Border Adjustment Mechanism (CBAM)</CardTitle>
              <CardDescription>
                CBAM is being phased in gradually to align with the phase-out of free allowances under the EU
                Emissions Trading System. It aims to prevent carbon leakage by ensuring importers from non-EU 
                countries bear similar costs for greenhouse gas emissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Required Documentation</h3>
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div 
                        key={index} 
                        className="p-3 border rounded-md flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                        </div>
                        {doc.uploaded ? (
                          <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => openUploadModal(index)}
                          >
                            Upload
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
          <CardTitle>CBAM Insights from Latest News</CardTitle>
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
      
      {/* File Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              {selectedDocumentIndex !== null && documents[selectedDocumentIndex] 
                ? `Upload ${documents[selectedDocumentIndex].name}`
                : 'Upload document'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <FileUpIcon className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm mb-2">
                When you click "Upload", a file picker will open to select your document.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, CSV, ZIP
              </p>
              <Button onClick={handleModalUpload}>Select and Upload File</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 