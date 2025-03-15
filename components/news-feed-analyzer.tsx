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
    ChevronUp,
    Bot,
    Sparkles,
    Loader2,
    KeyRound,
    Link,
  } from "lucide-react"
  import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface NewsFeedAnalyzerProps {
  companyName: string
  industry: string
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

type AnalysisResult = {
  summary: string
  esgRisks: {
    environmental: Array<{text: string, source?: string}>
    social: Array<{text: string, source?: string}>
    governance: Array<{text: string, source?: string}>
    compliance: Array<{text: string, source?: string}>
  }
  riskLevel: "Low" | "Medium" | "High"
  keyFindings: Array<{text: string, source?: string}>
  recommendations: Array<{text: string, source?: string}>
}

export function NewsFeedAnalyzer({ companyName, industry }: NewsFeedAnalyzerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"news" | "analysis">("news")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)

  // Function to fetch news articles from the API
  const fetchNewsArticles = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Call our API endpoint with company and industry parameters
      const response = await fetch(
        `/api/news?company=${encodeURIComponent(companyName)}&industry=${encodeURIComponent(industry)}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`)
      }

      const { data } = await response.json()
      setArticles(data)
    } catch (error) {
      console.error('Error fetching news articles:', error)
      setError('Failed to load news feed. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh news feed
  const refreshNewsFeed = async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      // Call our API endpoint with company and industry parameters
      const response = await fetch(
        `/api/news?company=${encodeURIComponent(companyName)}&industry=${encodeURIComponent(industry)}&refresh=true`
      )

      if (!response.ok) {
        throw new Error(`Failed to refresh news: ${response.statusText}`)
      }

      const { data } = await response.json()
      setArticles(data)
    } catch (error) {
      console.error('Error refreshing news feed:', error)
      setError('Failed to refresh news feed. Please try again later.')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Function to analyze news articles with Gemini
  const analyzeArticles = async () => {
    if (articles.length === 0) return
    
    setIsAnalyzing(true)
    setError(null)
    setApiKeyMissing(false)
    
    try {
      // Prepare the content for Gemini analysis
      const articlesForAnalysis = articles.map(article => ({
        id: article.id,
        title: article.title,
        source: article.source,
        date: article.date,
        url: article.url,
        snippet: article.snippet,
        riskFactors: article.riskFactors
      }))
      
      // Call our API endpoint to analyze with Gemini
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: companyName,
          industry: industry,
          articles: articlesForAnalysis
        }),
      })
      
      if (response.status === 401) {
        setApiKeyMissing(true)
        throw new Error('Gemini API key is missing. Please add it to your .env.local file.')
      }
      
      if (!response.ok) {
        throw new Error(`Failed to analyze news: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // Process result to ensure the data follows our expected format
      const processedResult: AnalysisResult = {
        summary: result.summary,
        esgRisks: {
          environmental: convertToArrayWithSource(result.esgRisks.environmental),
          social: convertToArrayWithSource(result.esgRisks.social),
          governance: convertToArrayWithSource(result.esgRisks.governance),
          compliance: convertToArrayWithSource(result.esgRisks.compliance)
        },
        riskLevel: result.riskLevel,
        keyFindings: convertToArrayWithSource(result.keyFindings),
        recommendations: convertToArrayWithSource(result.recommendations)
      }
      
      setAnalysis(processedResult)
      
    } catch (error: any) {
      console.error('Error analyzing articles:', error)
      setError(error.message || 'Failed to analyze news with AI. Please try again later.')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  // Helper function to convert string arrays to arrays with text and source properties
  const convertToArrayWithSource = (items: any[]): Array<{text: string, source?: string}> => {
    if (!items) return []
    
    return items.map(item => {
      if (typeof item === 'string') {
        return { text: item }
      } else if (typeof item === 'object' && item.text) {
        return item
      } else {
        return { text: String(item) }
      }
    })
  }

  // Find article URL based on a text search
  const findArticleUrl = (text: string): string | undefined => {
    // Simple algorithm to find a relevant article URL based on text content
    if (!text || articles.length === 0) return undefined
    
    const textLower = text.toLowerCase()
    
    // First try to find an exact match with title or snippet
    const exactMatch = articles.find(article => 
      article.title.toLowerCase().includes(textLower) || 
      article.snippet.toLowerCase().includes(textLower)
    )
    
    if (exactMatch) return exactMatch.url
    
    // If no exact match, look for keyword matches
    const words = textLower.split(/\s+/).filter(word => word.length > 4)
    
    for (const word of words) {
      const match = articles.find(article => 
        article.title.toLowerCase().includes(word) || 
        article.snippet.toLowerCase().includes(word)
      )
      
      if (match) return match.url
    }
    
    // If no matches, return the first article URL as a fallback
    return articles[0]?.url
  }

  // Fetch articles on component mount
  useEffect(() => {
    fetchNewsArticles()
  }, [companyName, industry])
  
  // Trigger analysis when switching to analysis view
  useEffect(() => {
    if (view === "analysis" && !analysis && articles.length > 0 && !isAnalyzing) {
      analyzeArticles()
    }
  }, [view, analysis, articles])

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

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }

  // Function to render API key missing state
  const renderApiKeyMissing = () => {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <KeyRound className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            A Gemini API key is required for AI analysis. Please add your API key to the .env.local file.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-3">How to Add Your Gemini API Key</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="bg-emerald-100 text-emerald-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 font-medium">1</span>
                <div>
                  <p>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Google AI Studio</a> to get your API key</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="bg-emerald-100 text-emerald-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 font-medium">2</span>
                <div>
                  <p>Open the .env.local file in your project's root directory</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="bg-emerald-100 text-emerald-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 font-medium">3</span>
                <div>
                  <p>Add your API key to the GEMINI_API_KEY variable:</p>
                  <pre className="bg-slate-100 p-2 mt-1 rounded">GEMINI_API_KEY=your_api_key_here</pre>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="bg-emerald-100 text-emerald-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 font-medium">4</span>
                <div>
                  <p>Restart your development server</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Function to render AI analysis results
  const renderAnalysis = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-700">Analyzing news with Gemini AI...</p>
          <p className="text-xs text-slate-500">This may take a few moments</p>
        </div>
      )
    }
    
    if (apiKeyMissing) {
      return renderApiKeyMissing()
    }
    
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }
    
    if (!analysis) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Analysis Available</AlertTitle>
          <AlertDescription>No analysis has been generated yet. Try refreshing the news feed.</AlertDescription>
        </Alert>
      )
    }
    
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h4 className="font-medium">AI Analysis Summary</h4>
            </div>
            <p className="text-sm text-slate-700">{analysis.summary}</p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${
                analysis.riskLevel === "Low" ? "bg-emerald-100 text-emerald-800" :
                analysis.riskLevel === "Medium" ? "bg-amber-100 text-amber-800" :
                "bg-red-100 text-red-800"
              }`}>
                {analysis.riskLevel} Overall Risk
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Environmental Risks */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">Environmental</Badge>
                ESG Risks
              </h4>
              <ul className="space-y-1">
                {analysis.esgRisks.environmental.length > 0 ? (
                  analysis.esgRisks.environmental.map((risk, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="flex-1">{risk.text}</span>
                      {risk.source || findArticleUrl(risk.text) ? (
                        <a 
                          href={risk.source || findArticleUrl(risk.text)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-emerald-500 hover:text-emerald-600 flex-shrink-0"
                        >
                          <Link className="h-4 w-4" />
                        </a>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No environmental risks identified</li>
                )}
              </ul>
            </CardContent>
          </Card>
          
          {/* Social Risks */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">Social</Badge>
                ESG Risks
              </h4>
              <ul className="space-y-1">
                {analysis.esgRisks.social.length > 0 ? (
                  analysis.esgRisks.social.map((risk, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="flex-1">{risk.text}</span>
                      {risk.source || findArticleUrl(risk.text) ? (
                        <a 
                          href={risk.source || findArticleUrl(risk.text)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:text-blue-600 flex-shrink-0"
                        >
                          <Link className="h-4 w-4" />
                        </a>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No social risks identified</li>
                )}
              </ul>
            </CardContent>
          </Card>
          
          {/* Governance Risks */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">Governance</Badge>
                ESG Risks
              </h4>
              <ul className="space-y-1">
                {analysis.esgRisks.governance.length > 0 ? (
                  analysis.esgRisks.governance.map((risk, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span className="flex-1">{risk.text}</span>
                      {risk.source || findArticleUrl(risk.text) ? (
                        <a 
                          href={risk.source || findArticleUrl(risk.text)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-purple-500 hover:text-purple-600 flex-shrink-0"
                        >
                          <Link className="h-4 w-4" />
                        </a>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No governance risks identified</li>
                )}
              </ul>
            </CardContent>
          </Card>
          
          {/* Compliance Risks */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">Compliance</Badge>
                ESG Risks
              </h4>
              <ul className="space-y-1">
                {analysis.esgRisks.compliance.length > 0 ? (
                  analysis.esgRisks.compliance.map((risk, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span className="flex-1">{risk.text}</span>
                      {risk.source || findArticleUrl(risk.text) ? (
                        <a 
                          href={risk.source || findArticleUrl(risk.text)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-orange-500 hover:text-orange-600 flex-shrink-0"
                        >
                          <Link className="h-4 w-4" />
                        </a>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No compliance risks identified</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        {/* Key Findings */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Key Findings</h4>
            <ul className="space-y-2">
              {analysis.keyFindings.map((finding, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span className="flex-1">{finding.text}</span>
                  {finding.source || findArticleUrl(finding.text) ? (
                    <a 
                      href={finding.source || findArticleUrl(finding.text)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-slate-500 hover:text-slate-700 flex-shrink-0"
                    >
                      <Link className="h-4 w-4" />
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Recommendations */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Recommendations</h4>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                  <span className="text-amber-500 mt-0.5">→</span>
                  <span className="flex-1">{recommendation.text}</span>
                  {recommendation.source || findArticleUrl(recommendation.text) ? (
                    <a 
                      href={recommendation.source || findArticleUrl(recommendation.text)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-slate-500 hover:text-slate-700 flex-shrink-0"
                    >
                      <Link className="h-4 w-4" />
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Live News Feed Analysis</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button 
              variant={view === "news" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setView("news")}
              className={`rounded-none border-0 h-7 px-3 ${view === "news" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
            >
              <Newspaper className="h-3.5 w-3.5 mr-1" />
              News Feed
            </Button>

            <Button 
              variant={view === "analysis" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setView("analysis")}
              className={`rounded-none border-0 h-7 px-3 ${view === "analysis" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
            >
              <Bot className="h-3.5 w-3.5 mr-1" />
              AI Analysis
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (view === "news") {
                refreshNewsFeed()
              } else {
                setAnalysis(null)
                setApiKeyMissing(false)
                analyzeArticles()
              }
            }}
            disabled={isLoading || isRefreshing || isAnalyzing}
            className="h-7"
          >
            {isRefreshing || isAnalyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        // Loading skeleton
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
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
      ) : error && view === "news" ? (
        // Error state for news view
        <Alert variant="destructive">
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
      ) : view === "news" ? (
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
                      {formatDate(article.date)}
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
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="link" size="sm" className="h-auto p-0">
                        Read Full Article
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Display AI analysis
        renderAnalysis()
      )}
    </div>
  )
}

