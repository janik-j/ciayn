"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Sparkles, Search, RefreshCw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { AnalyzerProps, AnalysisResult, NewsApiResponse, NewsArticle } from "./types"
import { LoadingIndicator, ErrorAlert, ApiKeyMissing, SourceLink } from "./shared-components"
import { AnalysisRenderer } from "./analysis-renderers"
import { formatDate, findArticleUrl } from "./utils"

// Configuration
const NEWS_API_URL = "/api/news"
const ANALYSIS_API_URL = "/api/analyze"

/**
 * NewsFeedAnalyzer - Component that fetches news articles and provides AI analysis
 */
export function NewsFeedAnalyzer({
  companyName,
  industry,
  customPrompt,
  title = "News & AI Analysis",
  description = "Real-time news and AI-driven insights",
  regulationType = "general"
}: AnalyzerProps) {
  // State variables
  const [searchTerm, setSearchTerm] = useState<string>(companyName)
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [selectedTab, setSelectedTab] = useState<string>("news")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  // Fetch news articles on component mount
  useEffect(() => {
    fetchArticles(companyName)
  }, [companyName])

  // Filter articles when searchTerm changes
  useEffect(() => {
    if (articles.length > 0 && searchTerm) {
      const filtered = articles.filter(
        article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.snippet.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredArticles(filtered)
    } else {
      setFilteredArticles(articles)
    }
  }, [articles, searchTerm])

  // Fetch news articles from API
  const fetchArticles = async (company: string) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`${NEWS_API_URL}?query=${encodeURIComponent(company)}`)
      if (!response.ok) {
        throw new Error(`News API error: ${response.statusText}`)
      }
      const rawData = await response.json()
      
      // Check if response has the expected structure
      if (!rawData || !rawData.data || !Array.isArray(rawData.data)) {
        setError("Invalid response format from news API")
        setArticles([])
        setFilteredArticles([])
        setIsLoading(false)
        return
      }
      
      // Map API response format to the expected article format
      const mappedArticles = rawData.data.map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        source: item.source,
        url: item.url,
        publishedAt: item.date,
        imageUrl: '',
        id: item.id,
        riskFactors: item.riskFactors || []
      }));
      
      if (mappedArticles.length === 0) {
        setError("No news articles found. Try a different search term.")
        setIsLoading(false)
        return
      }
      
      setArticles(mappedArticles)
      setFilteredArticles(mappedArticles)
      
      // Automatically analyze articles if we have them
      if (mappedArticles.length > 0) {
        analyzeArticles(mappedArticles, company, industry)
      } else {
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error fetching news:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch news articles")
      setIsLoading(false)
    }
  }

  // Analyze articles using AI
  const analyzeArticles = async (
    articlesToAnalyze: NewsArticle[],
    company: string,
    industryType?: string
  ) => {
    setIsAnalyzing(true)
    setError("")
    try {
      const payload = {
        company,
        industry: industryType || "",
        articles: articlesToAnalyze,
        customPrompt
      }
      const response = await fetch(ANALYSIS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        if (response.status === 400) {
          const data = await response.json()
          throw new Error(data.error || "Bad request")
        } else if (response.status === 401) {
          throw new Error("API key is missing or invalid")
        } else {
          throw new Error(`Analysis API error: ${response.statusText}`)
        }
      }

      const analysisData: AnalysisResult = await response.json()
      setAnalysis(analysisData)
      setSelectedTab("analysis") // Switch to analysis tab when ready
    } catch (err) {
      console.error("Error analyzing articles:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze articles")
    } finally {
      setIsAnalyzing(false)
      setIsLoading(false) // Only set loading to false after analysis is complete
    }
  }

  // Handle refresh button click
  const handleRefresh = () => {
    fetchArticles(companyName)
  }

  // Render
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isAnalyzing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && <ErrorAlert title="Error" description={error} />}

      {isLoading ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-emerald-500 mb-4"></div>
            <p className="text-sm text-slate-500">
              {isAnalyzing ? `Analyzing news for ${companyName}...` : `Loading news for ${companyName}...`}
            </p>
          </div>
        </Card>
      ) : (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="news" className="flex-1 flex items-center gap-1.5">
              <Newspaper className="h-4 w-4" />
              <span>News</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex-1 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>AI Analysis</span>
              {isAnalyzing && <div className="ml-2 animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-emerald-500"></div>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Filter news articles..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <LoadingIndicator />
            ) : filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredArticles.map((article, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {article.imageUrl && (
                          <div className="hidden sm:block flex-shrink-0">
                            <Avatar className="h-16 w-16 rounded">
                              <AvatarImage src={article.imageUrl} alt={article.title} />
                              <AvatarFallback>{article.source.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="font-medium line-clamp-2">{article.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{article.source}</span>
                              <span>•</span>
                              <span>{formatDate(article.publishedAt)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">{article.snippet}</p>
                          <div className="flex justify-between items-center pt-1">
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {companyName}
                              </Badge>
                            </div>
                            <SourceLink url={article.url} color="blue" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground">No articles found. Try a different search term.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            {isAnalyzing ? (
              <LoadingIndicator />
            ) : (
              <AnalysisRenderer 
                analysis={analysis} 
                articles={articles} 
                regulationType={regulationType} 
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

/**
 * AIAnalysisOnly - Component that provides only the AI analysis without news feed
 */
export function AIAnalysisOnly({
  companyName,
  industry,
  customPrompt,
  title = "AI-Driven Insights",
  description = "AI analysis of recent news and developments",
  regulationType = "general"
}: AnalyzerProps) {
  // State variables
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  // Fetch news articles on component mount
  useEffect(() => {
    fetchArticles(companyName)
  }, [companyName])

  // Fetch news articles from API
  const fetchArticles = async (company: string) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`${NEWS_API_URL}?query=${encodeURIComponent(company)}`)
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
      
      // Map API response format to the expected article format
      const mappedArticles = rawData.data.map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        source: item.source,
        url: item.url,
        publishedAt: item.date,
        imageUrl: '',
        id: item.id,
        riskFactors: item.riskFactors || []
      }));
      
      if (mappedArticles.length === 0) {
        setError("No news articles found for analysis.")
        setIsLoading(false)
        return
      }
      
      setArticles(mappedArticles)
      
      // Automatically analyze articles if we have them
      if (mappedArticles.length > 0) {
        analyzeArticles(mappedArticles, company, industry)
      } else {
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error fetching news:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch news articles")
      setIsLoading(false)
    }
  }

  // Analyze articles using AI
  const analyzeArticles = async (
    articlesToAnalyze: NewsArticle[],
    company: string,
    industryType?: string
  ) => {
    setIsLoading(true)
    setError("")
    try {
      const payload = {
        company,
        industry: industryType || "",
        articles: articlesToAnalyze,
        customPrompt
      }
      const response = await fetch(ANALYSIS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        if (response.status === 400) {
          const data = await response.json()
          throw new Error(data.error || "Bad request")
        } else if (response.status === 401) {
          throw new Error("API key is missing or invalid")
        } else {
          throw new Error(`Analysis API error: ${response.statusText}`)
        }
      }

      const analysisData: AnalysisResult = await response.json()
      setAnalysis(analysisData)
    } catch (err) {
      console.error("Error analyzing articles:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze articles")
    } finally {
      setIsLoading(false) // Only set loading to false after analysis is complete
    }
  }

  // Handle refresh button click
  const handleRefresh = () => {
    fetchArticles(companyName)
  }

  // Render
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && <ErrorAlert title="Error" description={error} />}

      {isLoading ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-emerald-500 mb-4"></div>
            <p className="text-sm text-slate-500">Analyzing news for {companyName}...</p>
          </div>
        </Card>
      ) : (
        <AnalysisRenderer 
          analysis={analysis} 
          articles={articles}
          regulationType={regulationType} 
        />
      )}
    </div>
  )
} 