import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Configure the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { company, industry, articles } = body

    if (!company || !industry || !articles || articles.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // If no API key is provided, return an error
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is required for analysis' },
        { status: 401 }
      )
    }

    // Create an article lookup map for source URLs
    const articleLookup = new Map()
    articles.forEach((article: any) => {
      if (article.id && article.url) {
        articleLookup.set(article.id, article.url)
      }
    })

    // Convert articles to a single text for analysis
    const articlesForAnalysis = articles.map((article: any, index: number) => {
      return `
Article ID: ${article.id || `article-${index}`}
Title: ${article.title}
Source: ${article.source}
Date: ${article.date}
URL: ${article.url || "N/A"}
Content: ${article.snippet}
Risk Factors: ${article.riskFactors.map((rf: any) => `${rf.category} (${rf.severity}): ${rf.text}`).join(', ')}
      `
    }).join('\n\n---\n\n')

    // Prepare prompt for Gemini
    const prompt = `
You are an AI ESG analyst specializing in supply chain risk assessment. Analyze the following news articles about the company ${company} in the ${industry} industry.

${articlesForAnalysis}

Provide a comprehensive analysis covering:
1. A brief summary of the key ESG and compliance risks identified in the news articles
2. Specific ESG risks identified, categorized as:
   - Environmental risks (look carefully for issues related to climate, pollution, emissions, waste, energy, water, or other environmental impacts)
   - Social risks
   - Governance risks
   - Compliance risks
3. An overall risk level (Low, Medium, or High) based on the severity and frequency of identified risks
4. Key findings from the news analysis
5. Specific recommendations for risk mitigation and due diligence

For each identified risk, finding, and recommendation, when possible, provide a reference to the article ID it came from.

It's important to thoroughly examine articles for any environmental issues or risks, even if they're subtle or implied. This analysis is especially important for ESG reporting.

Format your response as a JSON object with the following structure:
{
  "summary": "A concise summary of the key risks identified",
  "esgRisks": {
    "environmental": [
      {"text": "Risk 1", "source": "article-id-that-mentioned-this"},
      {"text": "Risk 2", "source": "article-id-that-mentioned-this"}
    ],
    "social": [
      {"text": "Risk 1", "source": "article-id-that-mentioned-this"},
      {"text": "Risk 2", "source": "article-id-that-mentioned-this"}
    ],
    "governance": [
      {"text": "Risk 1", "source": "article-id-that-mentioned-this"},
      {"text": "Risk 2", "source": "article-id-that-mentioned-this"}
    ],
    "compliance": [
      {"text": "Risk 1", "source": "article-id-that-mentioned-this"},
      {"text": "Risk 2", "source": "article-id-that-mentioned-this"}
    ]
  },
  "riskLevel": "Low|Medium|High",
  "keyFindings": [
    {"text": "Finding 1", "source": "article-id-that-mentioned-this"},
    {"text": "Finding 2", "source": "article-id-that-mentioned-this"},
    {"text": "Finding 3", "source": "article-id-that-mentioned-this"}
  ],
  "recommendations": [
    {"text": "Recommendation 1", "source": "article-id-that-mentioned-this"},
    {"text": "Recommendation 2", "source": "article-id-that-mentioned-this"},
    {"text": "Recommendation 3", "source": "article-id-that-mentioned-this"}
  ]
}

If you're unsure about which article a particular risk or finding comes from, you can omit the source field.

Ensure your analysis is fact-based, precise, and directly related to the information in the news articles.
`

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    // Note: We need to extract the JSON from the text, as sometimes the model
    // might include explanatory text before or after the JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to extract valid JSON from Gemini response')
    }

    const analysisResult = JSON.parse(jsonMatch[0])
    
    // Process the result to replace article IDs with actual URLs
    const processSourceUrls = (items: any[]) => {
      if (!items) return items
      
      return items.map((item: any) => {
        if (item && item.source && articleLookup.has(item.source)) {
          return {
            ...item,
            source: articleLookup.get(item.source)
          }
        }
        return item
      })
    }
    
    // Initialize empty arrays if they don't exist
    if (!analysisResult.esgRisks) {
      analysisResult.esgRisks = {
        environmental: [],
        social: [],
        governance: [],
        compliance: []
      }
    }
    
    // Ensure all risk categories exist
    if (!analysisResult.esgRisks.environmental) {
      analysisResult.esgRisks.environmental = []
    }
    if (!analysisResult.esgRisks.social) {
      analysisResult.esgRisks.social = []
    }
    if (!analysisResult.esgRisks.governance) {
      analysisResult.esgRisks.governance = []
    }
    if (!analysisResult.esgRisks.compliance) {
      analysisResult.esgRisks.compliance = []
    }
    
    // Generate default environmental risk if none were found
    if (analysisResult.esgRisks.environmental.length === 0) {
      const newsHeadlines = articles.map((a: any) => a.title).join(" ");
      // Check if there might be environmental implications in the news
      if (newsHeadlines.toLowerCase().includes("climate") || 
          newsHeadlines.toLowerCase().includes("environment") ||
          newsHeadlines.toLowerCase().includes("emission") ||
          newsHeadlines.toLowerCase().includes("carbon")) {
        analysisResult.esgRisks.environmental.push({
          text: `Potential environmental impact requiring further assessment for ${company}.`,
          source: null
        });
      }
    }
    
    if (analysisResult.esgRisks.environmental) {
      analysisResult.esgRisks.environmental = processSourceUrls(analysisResult.esgRisks.environmental)
    }
    
    if (analysisResult.esgRisks.social) {
      analysisResult.esgRisks.social = processSourceUrls(analysisResult.esgRisks.social)
    }
    
    if (analysisResult.esgRisks.governance) {
      analysisResult.esgRisks.governance = processSourceUrls(analysisResult.esgRisks.governance)
    }
    
    if (analysisResult.esgRisks.compliance) {
      analysisResult.esgRisks.compliance = processSourceUrls(analysisResult.esgRisks.compliance)
    }
    
    if (analysisResult.keyFindings) {
      analysisResult.keyFindings = processSourceUrls(analysisResult.keyFindings)
    }
    
    if (analysisResult.recommendations) {
      analysisResult.recommendations = processSourceUrls(analysisResult.recommendations)
    }

    return NextResponse.json(analysisResult)
  } catch (error: any) {
    console.error('Error analyzing news with Gemini:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze news' },
      { status: 500 }
    )
  }
} 