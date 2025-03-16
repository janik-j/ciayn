"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIAnalysisOnly } from "@/components/news-feed-analyzer"
import { RegulationOverview, UploadStatus } from "./shared-components"
import { DocumentUploadType, TabCommonProps } from "./types"
import { getCsrdPrompt } from "./prompts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
      handleFileUpload(selectedDocumentIndex, 'csrd')
      closeUploadModal()
    }
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Corporate Sustainability Reporting Directive (CSRD)</CardTitle>
              <CardDescription>
                The CSRD introduces expanded sustainability reporting requirements with phased implementation
                starting in 2024 for certain companies.
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
            complianceStatus={supplier.complianceStatus.csrd}
            getComplianceColor={getComplianceColor}
          />
        </div>
      </div>

      {/* CSRD tab AI insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>CSRD Insights from Latest News</CardTitle>
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