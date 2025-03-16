"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIAnalysisOnly } from "@/components/news-feed-analyzer"
import { RegulationOverview, UploadStatus } from "./shared-components"
import { DocumentUploadType, TabCommonProps } from "./types"
import { getReachPrompt } from "./prompts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileUpIcon, ArrowDownIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { v4 as uuidv4 } from "uuid"

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Fetch existing documents when component mounts
  useEffect(() => {
    if (supplier) {
      fetchExistingDocuments()
    }
  }, [supplier.id])
  
  // Function to fetch existing documents from Supabase
  const fetchExistingDocuments = async () => {
    try {
      console.log('Fetching existing REACH documents for supplier:', supplier.id)
      
      // Query the documents table to get existing documents for this supplier and document type
      const { data: existingDocs, error } = await supabase
        .from('documents')
        .select('*')
        .eq('supplier_id', supplier.id)
        .eq('document_type', 'reach')
        .eq('status', 'active')
      
      if (error) {
        console.error('Error fetching existing documents:', error)
        return
      }
      
      if (existingDocs && existingDocs.length > 0) {
        console.log('Found existing documents:', existingDocs.length)
        
        // Create a copy of the current documents state
        const updatedDocuments = [...documents]
        
        // Update the 'uploaded' flag for documents that exist in the database
        existingDocs.forEach(doc => {
          // Log each document to help with debugging
          console.log('Processing document:', {
            id: doc.id,
            filename: doc.original_filename,
            metadata: doc.metadata
          })
          
          // Check if metadata and documentIndex exist
          if (!doc.metadata || doc.metadata.documentIndex === undefined) {
            console.warn('Document has no documentIndex in metadata:', doc.id)
            return // Skip this document
          }
          
          // Convert to number if it's stored as a string
          let indexValue: number
          if (typeof doc.metadata.documentIndex === 'string') {
            indexValue = parseInt(doc.metadata.documentIndex, 10)
          } else {
            indexValue = Number(doc.metadata.documentIndex)
          }
          
          console.log(`Document index parsed: ${indexValue}, type: ${typeof indexValue}`)
          
          // Validate that the index is within bounds and is a valid number
          if (isNaN(indexValue)) {
            console.warn(`Invalid document index (NaN): ${doc.metadata.documentIndex}`)
            return // Skip this document
          }
          
          if (indexValue < 0 || indexValue >= updatedDocuments.length) {
            console.warn(`Index out of bounds: ${indexValue}, max allowed: ${updatedDocuments.length - 1}`)
            return // Skip this document
          }
          
          // Mark as uploaded
          console.log(`Marking document at index ${indexValue} as uploaded`)
          updatedDocuments[indexValue].uploaded = true
        })
        
        // Update the documents state
        setDocuments(updatedDocuments)
        console.log('Updated documents state with upload status')
      } else {
        console.log('No existing documents found')
      }
    } catch (error) {
      console.error('Failed to fetch existing documents:', error)
    }
  }
  
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
  
  // Function to handle downloading a file
  const handleDownloadFile = async (documentIndex: number) => {
    try {
      // First, query the documents table to get file information
      const { data: documentRecords, error: queryError } = await supabase
        .from('documents')
        .select('*')
        .eq('supplier_id', supplier.id)
        .eq('document_type', 'reach')
        .eq('metadata->documentIndex', documentIndex.toString())
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (queryError) {
        throw new Error(`Error fetching document: ${queryError.message}`)
      }
      
      if (!documentRecords || documentRecords.length === 0) {
        throw new Error('Document not found')
      }
      
      const documentRecord = documentRecords[0]
      
      // If we have a direct file URL, we can just open it in a new tab
      if (documentRecord.file_url) {
        window.open(documentRecord.file_url, '_blank')
        return
      }
      
      // Otherwise, we need to download through the Supabase Storage API
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from(documentRecord.metadata?.bucket || 'document-uploads')
        .download(documentRecord.file_path)
      
      if (downloadError) {
        throw new Error(`Error downloading file: ${downloadError.message}`)
      }
      
      // Create a download link and click it
      const url = URL.createObjectURL(fileData)
      const link = document.createElement('a')
      link.href = url
      link.download = documentRecord.original_filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Download started",
        description: `${documentRecord.original_filename} is being downloaded.`,
        variant: "default"
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      })
    }
  }
  
  // Function to handle the upload from the modal
  const handleModalUpload = async () => {
    if (selectedDocumentIndex !== null && selectedFile) {
      try {
        setIsUploading(true)
        
        // 1. Upload file to Supabase Storage
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `reach-docs/${supplier.id}/${fileName}` // Use supplier ID instead of user ID
        
        // List of common bucket names to try in Supabase
        const commonBucketNames = ['document-uploads']
        
        // List available buckets to help with debugging
        let availableBuckets: string[] = []
        try {
          const { data: buckets, error: listError } = await supabase
            .storage
            .listBuckets()
            
          if (listError) {
            console.error('Error listing buckets:', listError)
          } else if (buckets) {
            availableBuckets = buckets.map(b => b.name)
            console.log('Available buckets:', availableBuckets)
          }
        } catch (e) {
          console.error('Could not list buckets:', e)
        }
        
        // If we found buckets, try those first, otherwise use our common list
        const bucketsToTry = availableBuckets.length > 0 
          ? availableBuckets 
          : commonBucketNames
        
        let uploadSuccessful = false
        let lastError: { message?: string } | null = null
        let uploadedBucket = ''
        
        // Try each bucket until one works
        for (const bucketName of bucketsToTry) {
          try {
            console.log(`Attempting to upload file to ${bucketName}/${filePath}`)
            
            const { data: storageData, error: storageError } = await supabase
              .storage
              .from(bucketName)
              .upload(filePath, selectedFile, {
                cacheControl: '3600',
                upsert: true // Use upsert to override if file exists
              })
              
            if (!storageError) {
              // Upload successful
              uploadSuccessful = true
              uploadedBucket = bucketName
              console.log(`Upload successful to bucket: ${bucketName}`)
              break
            }
            
            // Store error and try next bucket
            lastError = storageError
            console.log(`Upload to ${bucketName} failed:`, storageError.message)
          } catch (e) {
            console.error(`Error with bucket ${bucketName}:`, e)
            lastError = e instanceof Error ? e : new Error(String(e))
          }
        }
        
        // If all uploads failed, throw the last error
        if (!uploadSuccessful) {
          if (lastError && typeof lastError === 'object' && 'message' in lastError && 
              typeof lastError.message === 'string') {
            if (lastError.message.includes('row-level security') || 
                lastError.message.includes('permission denied')) {
              throw new Error(
                `Storage permission denied. Please contact your administrator to ensure you have upload permissions.`
              )
            } else if (lastError.message.includes('bucket not found')) {
              throw new Error(
                `No usable storage buckets found. Please contact your administrator to create a storage bucket.`
              )
            } else {
              throw new Error(`Storage error: ${lastError.message}`)
            }
          } else {
            throw new Error('Unknown storage error occurred')
          }
        }
        
        // Get public URL for the file
        const { data: publicUrlData } = supabase
          .storage
          .from(uploadedBucket)
          .getPublicUrl(filePath)
          
        // Now insert record into documents table with 'active' status
        try {
          const { data: documentData, error: documentError } = await supabase
            .from('documents')
            .insert([{
              supplier_id: supplier.id,
              document_type: 'reach',
              original_filename: selectedFile.name,
              file_path: filePath,
              file_url: publicUrlData?.publicUrl || '',
              file_size: selectedFile.size,
              mime_type: selectedFile.type,
              status: 'active', // Using 'active' which is allowed per the SQL schema
              metadata: {
                documentName: documents[selectedDocumentIndex].name,
                documentIndex: selectedDocumentIndex,
                bucket: uploadedBucket
              }
            }])
            .select()
          
          if (documentError) {
            console.error('Document insert failed:', documentError)
            throw new Error(`Document error: ${documentError.message}`)
          }
          
          // If we get here, insertion succeeded
          console.log('Document inserted successfully')
          
          // 3. Update the local state
          handleFileUpload(selectedDocumentIndex, 'reach')
          
          // 4. Show success toast
          toast({
            title: "Document uploaded successfully",
            description: `${selectedFile.name} has been uploaded to bucket: ${uploadedBucket}`,
            variant: "default"
          })
          
          // 5. Close modal
          closeUploadModal()
        } catch (error) {
          console.error('Document insert error:', error)
          throw error
        }
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
                          <div className="flex items-center">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openUploadModal(index)}
                              className="text-slate-600 mr-2"
                            >
                              Replace
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadFile(index)}
                              className="text-slate-600"
                            >
                              <ArrowDownIcon className="h-4 w-4 mr-1" />
                              
                            </Button>
                          </div>
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