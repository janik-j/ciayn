"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExternalLink, AlertCircle } from "lucide-react"
import { ensureValidUrl } from "./utils"

interface ErrorAlertProps {
  title: string;
  description: string;
}

export function ErrorAlert({ title, description }: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}

interface ApiKeyMissingProps {
  type: string;
}

export function ApiKeyMissing({ type }: ApiKeyMissingProps) {
  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-medium mb-3">API Key Missing</h3>
      <p className="text-sm text-slate-600 mb-4">
        To use the {type} feature, a valid API key needs to be configured.
        Please contact the administrator to configure the API key in the environment variables.
      </p>
      <div className="p-3 bg-slate-50 rounded text-sm">
        <code>GEMINI_API_KEY</code> or <code>OPENAI_API_KEY</code> is required for analysis features.
      </div>
    </div>
  )
}

interface SourceLinkProps {
  url?: string;
  color: string;
}

export function SourceLink({ url, color }: SourceLinkProps) {
  if (!url) return null;
  
  const validUrl = ensureValidUrl(url);
  const colorClass = color === "amber" 
    ? "text-amber-500 hover:text-amber-600" 
    : color === "blue"
      ? "text-blue-500 hover:text-blue-600"
      : color === "purple"
        ? "text-purple-500 hover:text-purple-600"
        : "text-emerald-500 hover:text-emerald-600";
  
  return (
    <a
      href={validUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center text-sm font-medium ${colorClass} no-underline hover:underline cursor-pointer`}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <ExternalLink className="h-3.5 w-3.5 mr-1" />
      <span>Read more</span>
    </a>
  );
}

export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      <span className="ml-3 text-sm text-slate-500">Loading...</span>
    </div>
  );
} 