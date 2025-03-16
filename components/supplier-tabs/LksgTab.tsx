"use client"

import { useState, useRef, useEffect } from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIAnalysisOnly } from "@/components/news-feed-analyzer"
import { RegulationOverview, UploadStatus } from "./shared-components"
import { DocumentUploadType, TabCommonProps } from "./types"
import { getLksgPrompt } from "./prompts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileUpIcon, ArrowDownIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { v4 as uuidv4 } from "uuid"
import { lksg_disclosure_items } from "@/lib/lksg_disclosure"
import { AlertTriangle } from "lucide-react"

interface LksgTabProps extends TabCommonProps {
  documents: DocumentUploadType[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentUploadType[]>>;
}

interface LKSGDisclosure {
  user_id: string;
  child_labor_violation: boolean;
  child_labor_processes: boolean;
  forced_labor_processes: boolean;
  slavery_violation: boolean;
  slavery_processes: boolean;
  forced_eviction_violation: boolean;
  forced_eviction_processes: boolean;
  security_forces_violation: boolean;
  security_forces_processes: boolean;
  workplace_safety_violation: boolean;
  workplace_safety_processes: boolean;
  freedom_association_violation: boolean;
  freedom_association_processes: boolean;
  employment_discrimination_violation: boolean;
  employment_discrimination_processes: boolean;
  fair_wage_violation: boolean;
  fair_wage_processes: boolean;
  mercury_violation: boolean;
  mercury_processes: boolean;
  organic_pollutants_violation: boolean;
  organic_pollutants_processes: boolean;
  hazardous_waste_violation: boolean;
  hazardous_waste_processes: boolean;
  environmental_damage_violation: boolean;
  environmental_damage_processes: boolean;
  last_updated: string;
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
  const [supplierOwner, setSupplierOwner] = useState<string | null>(null)
  const [disclosure, setDisclosure] = useState<LKSGDisclosure | null>(null)
  const [isLoadingDisclosure, setIsLoadingDisclosure] = useState(false)
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
      console.log('Fetching existing LKSG documents for supplier:', supplier.id)
      
      // Query the documents table to get existing documents for this supplier and document type
      const { data: existingDocs, error } = await supabase
        .from('documents')
        .select('*')
        .eq('supplier_id', supplier.id)
        .eq('document_type', 'lksg')
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
  
  // Fetch supplier owner and disclosure data
  useEffect(() => {
    const fetchSupplierOwnerAndDisclosure = async () => {
      if (!supplier.id) return
      
      setIsLoadingDisclosure(true)
      try {
        // 1. Find who owns the supplier
        const { data: ownerData, error: ownerError } = await supabase
          .from('user_supplier_association')
          .select('user')
          .eq('supplier', supplier.id)
          .single()
          
        if (ownerError && ownerError.code !== 'PGRST116') {
          console.error('Error fetching supplier owner:', ownerError)
          return
        }
        
        if (!ownerData) {
          // No owner found for this supplier
          return
        }
        
        setSupplierOwner(ownerData.user)
        
        // 2. Fetch the owner's LKSG disclosure
        const { data: disclosureData, error: disclosureError } = await supabase
          .from('lksg_disclosures')
          .select('*')
          .eq('user_id', ownerData.user)
          .single()
          
        if (disclosureError && disclosureError.code !== 'PGRST116') {
          console.error('Error fetching LKSG disclosure:', disclosureError)
          return
        }
        
        if (disclosureData) {
          setDisclosure(disclosureData as LKSGDisclosure)
        }
      } catch (error) {
        console.error('Error in fetchSupplierOwnerAndDisclosure:', error)
      } finally {
        setIsLoadingDisclosure(false)
      }
    }
    
    fetchSupplierOwnerAndDisclosure()
  }, [supplier.id])
  
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
        .eq('document_type', 'lksg')
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
        const filePath = `lksg-docs/${supplier.id}/${fileName}` // Use supplier ID instead of user ID
        
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

        // Now that we know the allowed status values from the SQL schema
        // status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted'))
        console.log('Inserting document with status "active" (per database schema)')
        
        // 2. Insert record into documents table with 'active' status
        try {
          const { data: documentData, error: documentError } = await supabase
            .from('documents')
            .insert([{
              supplier_id: supplier.id,
              document_type: 'lksg',
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
          handleFileUpload(selectedDocumentIndex, 'lksg')
          
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
        <div className="md:col-span-2 h-full">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>German Supply Chain Act (LkSG)</CardTitle>
              <CardDescription>
                The German Act on Corporate Due Diligence Obligations in Supply Chains has been in force since January 1, 2023. 
                It initially applied to companies with at least 3,000 employees in Germany and expanded to those with at least 1,000 employees from 2024.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
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

        <div className="h-full">
          <UploadStatus 
            documents={documents}
            complianceStatus={supplier.complianceStatus.lksg}
            getComplianceColor={getComplianceColor}
          />
        </div>
      </div>

      {/* LKSG Disclosure Display */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle>Supplier's LKSG Disclosure</CardTitle>
          <CardDescription>
            Self-reported compliance information submitted by this supplier
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDisclosure ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : disclosure ? (
            <>
              <div className="text-xs text-right text-muted-foreground mb-2">
                Last updated: {disclosure.last_updated ? new Date(disclosure.last_updated).toLocaleDateString() : 'N/A'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {lksg_disclosure_items.map((item, index) => {
                  const value = disclosure[item.db_name as keyof LKSGDisclosure]
                  const isPositive = (item.yes_is_positive && value === true) || 
                                    (!item.yes_is_positive && value === false)
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                      <div className="mr-2">
                        <p className="font-medium text-xs">{item.label}</p>
                      </div>
                      <Badge 
                        className={`
                          ${isPositive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}
                          text-xs font-medium whitespace-nowrap
                        `}
                      >
                        {value ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-red-600" />
                <div>
                  <h4 className="font-medium mb-1">Missing LKSG Disclosure</h4>
                  <p className="text-sm">
                    This supplier hasn't submitted any LKSG disclosure information. This is a significant compliance concern as it could indicate lack of due diligence in their supply chain management.
                  </p>
                  <p className="text-sm mt-2 font-medium">
                    Recommendation: Request the supplier to complete their LKSG disclosure before proceeding further.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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