"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIAnalysisOnly } from "@/components/news-feed-analyzer"
import { RegulationOverview, UploadStatus } from "./shared-components"
import { DocumentUploadType, TabCommonProps } from "./types"
import { getReachPrompt } from "./prompts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
      handleFileUpload(selectedDocumentIndex, 'reach')
      closeUploadModal()
    }
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>EU REACH Regulation</CardTitle>
              <CardDescription>
                REACH (Registration, Evaluation, Authorization and Restriction of Chemicals) is a European Union
                regulation concerning chemicals and their safe use, which aims to improve the protection of human 
                health and the environment.
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