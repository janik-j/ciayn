"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIAnalysisOnly } from "@/components/news-feed-analyzer"
import { RegulationOverview, UploadStatus } from "./shared-components"
import { DocumentUploadType, TabCommonProps } from "./types"
import { getLksgPrompt } from "./prompts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileUpIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { v4 as uuidv4 } from "uuid"

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Find a document that needs uploading 
  const openUploadModal = (documentIndex: number) => {
    setSelectedDocumentIndex(documentIndex)
    setSelectedFile(null)
    setIsUploadModalOpen(true)
  }
  
  const closeUploadModal = () => {
    setIsUploadModalOpen(false)
    setSelectedDocumentIndex(null)
    setSelectedFile(null)
  }
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }
  
  // Function to handle the upload from the modal
  const handleModalUpload = async () => {
    if (selectedDocumentIndex !== null && selectedFile && user) {
      try {
        setIsUploading(true)
        
        // 1. Upload file to Supabase Storage
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${user.id}/${fileName}` // Use user ID instead of supplier ID for better RLS compatibility
        
        // First, check if the bucket exists and try to create it if needed
        const { data: buckets, error: listError } = await supabase
          .storage
          .listBuckets()
          
        if (listError) {
          console.error('Error listing buckets:', listError)
        }
        
        const bucketName = 'document-uploads' // Simpler bucket name
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
        
        if (!bucketExists) {
          // Try to create the bucket if it doesn't exist
          try {
            const { error: createBucketError } = await supabase
              .storage
              .createBucket(bucketName, {
                public: false,
                fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
              })
              
            if (createBucketError) {
              console.error('Error creating bucket:', createBucketError)
              // Continue anyway, the bucket might exist but not be visible to the user
            }
          } catch (bucketError) {
            console.error('Bucket creation failed:', bucketError)
            // Continue anyway
          }
        }
        
        // Upload to storage with the bucket that should now exist
        const { data: storageData, error: storageError } = await supabase
          .storage
          .from(bucketName)
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: true // Use upsert to override if file exists
          })
          
        if (storageError) {
          console.error('Storage upload error details:', storageError)
          
          // Check for RLS issues
          if (storageError.message.includes('row-level security') || 
              storageError.message.includes('permission denied')) {
            throw new Error(
              `Storage permission denied. Please contact your administrator to ensure you have upload permissions.`
            )
          }
          
          throw new Error(`Storage error: ${storageError.message}`)
        }
        
        // Get public URL for the file
        const { data: publicUrlData } = supabase
          .storage
          .from(bucketName)
          .getPublicUrl(filePath)
          
        // 2. Insert record into documents table
        const { data: documentData, error: documentError } = await supabase
          .from('documents')
          .insert([{
            user_id: user.id,
            supplier_id: supplier.id,
            document_type: 'lksg',
            original_filename: selectedFile.name,
            file_path: filePath,
            file_url: publicUrlData?.publicUrl || '',
            file_size: selectedFile.size,
            mime_type: selectedFile.type,
            status: 'uploaded',
            metadata: {
              documentName: documents[selectedDocumentIndex].name,
              documentIndex: selectedDocumentIndex
            }
          }])
          .select()
          
        if (documentError) {
          console.error('Document insert error details:', documentError)
          
          // Check for RLS issues in the database
          if (documentError.message.includes('row-level security') || 
              documentError.message.includes('permission denied')) {
            throw new Error(
              `Database permission denied. Please contact your administrator to ensure you have insert permissions.`
            )
          }
          
          throw new Error(`Document error: ${documentError.message}`)
        }
        
        // 3. Update the local state
        handleFileUpload(selectedDocumentIndex, 'lksg')
        
        // 4. Show success toast
        toast({
          title: "Document uploaded successfully",
          description: `${selectedFile.name} has been uploaded.`,
          variant: "default"
        })
        
        // 5. Close modal
        closeUploadModal()
      } catch (error) {
        console.error('Upload error:', error)
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        })
      } finally {
        setIsUploading(false)
      }
    } else if (fileInputRef.current) {
      // If no file is selected, trigger the file input click
      fileInputRef.current.click()
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>German Supply Chain Act (LkSG)</CardTitle>
              <CardDescription>
                The German Act on Corporate Due Diligence Obligations in Supply Chains has been in force since January 1, 2023. 
                It initially applied to companies with at least 3,000 employees in Germany and expanded to those with at least 1,000 employees from 2024.
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
              {selectedFile ? (
                <div className="mb-4">
                  <p className="text-sm font-medium">Selected file:</p>
                  <Badge variant="outline" className="mt-1">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </Badge>
                </div>
              ) : (
                <p className="text-sm mb-2">
                  Select a file to upload for {selectedDocumentIndex !== null && documents[selectedDocumentIndex] 
                    ? documents[selectedDocumentIndex].name 
                    : 'this document'}
                </p>
              )}
              <p className="text-xs text-muted-foreground mb-4">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, CSV, ZIP
              </p>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip"
              />
              
              <div className="flex justify-center gap-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={isUploading}
                >
                  Browse Files
                </Button>
                <Button 
                  onClick={handleModalUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading 
                    ? "Uploading..." 
                    : selectedFile 
                      ? "Upload File" 
                      : "Select File"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 