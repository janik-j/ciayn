"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Calendar,
  Newspaper,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ensureValidUrl } from "./utils"

interface NewsfeedProps {
  companyName: string
  title?: string
  description?: string
  industry?: string
}

type NewsArticle = {
  id: string
  title: string
  source: string
  date: string
  url: string
  snippet: string
  riskFactors: {
    text: string
    category: "environmental" | "social" | "governance" | "compliance"
    severity: "low" | "medium" | "high"
  }[]
}

/**
 * Newsfeed - Component that fetches and displays news articles
 */
export function Newsfeed({
  companyName,
  title = "Newsfeed",
  description = "Real-time news about " + companyName,
  industry = "technology"
}: NewsfeedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [error, setError] = useState<string>("")

  // Function to fetch news articles
  const fetchNewsArticles = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/news?query=${encodeURIComponent(companyName)}`)
      if (!response.ok) {
        throw new Error(`News API error: ${response.statusText}`)
      }
      const rawData = await response.json()
      
      // Check if response has the expected structure
      if (!rawData || !rawData.data || !Array.isArray(rawData.data)) {
        setError("Invalid response format from news API")
        setArticles([])
        setIsLoading(false)
        return
      }
      
      // Helper function to determine appropriate default risk factors based on company and content
      const determineDefaultRiskFactors = (company: string, title: string, snippet: string) => {
        const content = (title + ' ' + snippet).toLowerCase();
        const risks: {
          text: string,
          category: "environmental" | "social" | "governance" | "compliance",
          severity: "low" | "medium" | "high"
        }[] = [];

        // Common tech company risk patterns
        const riskPatterns = {
          // Environmental risks
          environmental: {
            terms: ['energy consumption', 'carbon footprint', 'emissions', 'climate', 'renewable', 'sustainability', 'water usage', 'waste', 'recycling', 'environmental impact'],
            severity: (count: number) => count > 3 ? "high" : count > 1 ? "medium" : "low" as "high" | "medium" | "low"
          },
          // Social risks
          social: {
            terms: ['labor', 'worker', 'employee', 'diversity', 'inclusion', 'discrimination', 'harassment', 'mental health', 'wellbeing', 'community'],
            severity: (count: number) => count > 3 ? "medium" : "low" as "medium" | "low"
          },
          // Governance risks
          governance: {
            terms: ['board', 'executive', 'leadership', 'transparency', 'accountability', 'ethics', 'lobbying', 'political', 'antitrust', 'monopoly', 'reporting'],
            severity: (count: number) => count > 3 ? "high" : count > 1 ? "medium" : "low" as "high" | "medium" | "low"
          },
          // Compliance risks
          compliance: {
            terms: ['regulation', 'compliance', 'legal', 'lawsuit', 'fine', 'penalty', 'investigation', 'regulatory', 'privacy', 'data protection', 'gdpr', 'ccpa'],
            severity: (count: number) => count > 3 ? "high" : count > 1 ? "medium" : "low" as "high" | "medium" | "low"
          },
          // Security risks (often compliance-related for tech companies)
          security: {
            terms: ['breach', 'hack', 'cybersecurity', 'data breach', 'vulnerability', 'exploit', 'malware', 'ransomware', 'phishing', 'security flaw'],
            severity: (count: number) => count > 2 ? "high" : "medium" as "high" | "medium"
          }
        };

        // Specific risk patterns for tech companies
        const techSpecificRisks = {
          // AI ethics (governance)
          aiEthics: {
            terms: ['ai ethics', 'algorithmic bias', 'facial recognition', 'surveillance', 'ai transparency', 'responsible ai'],
            category: "governance" as const,
            severity: "medium" as const
          },
          // Privacy (compliance)
          privacy: {
            terms: ['privacy', 'user data', 'data collection', 'tracking', 'surveillance', 'cookies', 'data sharing'],
            category: "compliance" as const,
            severity: "medium" as const
          },
          // Content moderation (social)
          contentModeration: {
            terms: ['moderation', 'harmful content', 'misinformation', 'disinformation', 'hate speech', 'content policy'],
            category: "social" as const,
            severity: "medium" as const
          }
        };

        // Check general risk categories
        Object.entries(riskPatterns).forEach(([category, pattern]) => {
          const matchingTerms = pattern.terms.filter(term => content.includes(term));
          if (matchingTerms.length > 0) {
            const primaryTerm = matchingTerms[0];
            risks.push({
              text: primaryTerm,
              category: category === 'security' ? 'compliance' : category as any,
              severity: pattern.severity(matchingTerms.length)
            });
          }
        });

        // Check tech-specific risks
        Object.entries(techSpecificRisks).forEach(([riskType, pattern]) => {
          const hasMatch = pattern.terms.some(term => content.includes(term));
          if (hasMatch) {
            const matchingTerm = pattern.terms.find(term => content.includes(term)) || pattern.terms[0];
            risks.push({
              text: matchingTerm,
              category: pattern.category,
              severity: pattern.severity
            });
          }
        });

        // Human rights risks - be extra careful and specific
        if (content.includes('human rights') || 
            content.includes('child labor') || 
            content.includes('forced labor') || 
            content.includes('labor rights')) {
          
          // Only if there's strong evidence in the text
          if (content.includes('violation') || 
              content.includes('abuse') || 
              content.includes('allegation') || 
              content.includes('lawsuit')) {
            risks.push({
              text: 'human rights concerns',
              category: 'social',
              severity: 'high'
            });
          } else {
            // For more general mentions, lower severity
            risks.push({
              text: 'human rights considerations',
              category: 'social',
              severity: 'medium'
            });
          }
        }

        // Ensure we have at least one risk factor
        if (risks.length === 0) {
          // Default fallback with low severity
          risks.push({
            text: "potential regulatory considerations",
            category: "compliance",
            severity: "low"
          });
        }

        return risks.slice(0, 3); // Return up to 3 most relevant risk factors
      };

      // Map API response format to the expected article format
      const mappedArticles = rawData.data.map((item: any) => {
        // Use provided risk factors or determine based on content
        const riskFactors = item.riskFactors && item.riskFactors.length > 0 
          ? item.riskFactors 
          : determineDefaultRiskFactors(companyName, item.title, item.snippet);
          
        return {
          id: item.id || `article-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: item.title,
          snippet: item.snippet,
          source: item.source,
          url: item.url,
          date: item.date,
          riskFactors: riskFactors
        };
      });
      
      if (mappedArticles.length === 0) {
        setError("No news articles found. Try a different search term.")
        setIsLoading(false)
        return
      }
      
      setArticles(mappedArticles)
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching news:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch news articles")
      setIsLoading(false)
    }
  }

  // Refresh news feed
  const refreshNewsFeed = () => {
    setIsRefreshing(true)
    fetchNewsArticles().finally(() => {
      setIsRefreshing(false)
    })
  }

  // Fetch articles on component mount
  useEffect(() => {
    fetchNewsArticles()
  }, [companyName])

  // Helper function to get severity color
  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  // Helper function to get category color
  const getCategoryColor = (category: "environmental" | "social" | "governance" | "compliance") => {
    switch (category) {
      case "environmental":
        return "bg-green-100 text-green-800 border-green-200"
      case "social":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "governance":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "compliance":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  // Helper function to highlight risk factors in text
  const highlightRiskFactors = (text: string, riskFactors: { text: string }[]) => {
    let highlightedText = text

    riskFactors.forEach((factor) => {
      const regex = new RegExp(factor.text, "gi")
      highlightedText = highlightedText.replace(
        regex,
        (match) => `<span class="bg-amber-100 px-1 rounded">${match}</span>`,
      )
    })

    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{title}</h3>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshNewsFeed}
            disabled={isLoading || isRefreshing}
            className="h-7"
          >
            {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            // Error display
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : articles.length === 0 ? (
            // No articles found
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No News Found</AlertTitle>
              <AlertDescription>We couldn't find any recent news articles about {companyName}.</AlertDescription>
            </Alert>
          ) : (
            // Display articles
            <div className="space-y-4">
              {articles.map((article) => (
                <Card key={article.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">{article.title}</h4>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <div className="flex items-center">
                          <Newspaper className="h-3.5 w-3.5 mr-1" />
                          {article.source}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {article.date}
                        </div>

                        {article.riskFactors.map((factor, idx) => (
                          <Badge key={idx} variant="outline" className={`text-xs ${getCategoryColor(factor.category)}`}>
                            {factor.category.charAt(0).toUpperCase() + factor.category.slice(1)}
                          </Badge>
                        ))}

                        {article.riskFactors.map((factor, idx) => (
                          <Badge
                            key={`severity-${idx}`}
                            variant="outline"
                            className={`text-xs ${getSeverityColor(factor.severity)}`}
                          >
                            {factor.severity.charAt(0).toUpperCase() + factor.severity.slice(1)} Risk
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm text-slate-700">
                        {highlightRiskFactors(article.snippet, article.riskFactors)}
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0"
                          onClick={() => {
                            if (article.url) {
                              const validUrl = ensureValidUrl(article.url);
                              window.open(validUrl, "_blank", "noopener,noreferrer");
                            }
                          }}
                        >
                          Read Full Article
                          <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
} 