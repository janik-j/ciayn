import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

// Define interfaces for our data
interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  snippet: string;
}

export async function GET(request: Request) {
  try {
    // Get query parameters from the request
    const url = new URL(request.url);
    const company = url.searchParams.get('company') || 'Apple';
    const industry = url.searchParams.get('industry') || 'Technology';
    
    // Google News RSS feed URL with the company as the search term
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(company)}&hl=en&gl=US&ceid=US:en`;
    
    // Fetch the RSS feed
    const response = await fetch(rssUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch news feed: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Parse XML to JSON
    const xmlData = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '_',
    });
    const feed = parser.parse(xmlData);
    
    // Extract items from the feed
    const items = feed.rss?.channel?.item || [];
    const newsItems: NewsItem[] = Array.isArray(items) ? items.map((item: any, index: number) => {
      // Extract source from title (Google News puts source in title like "Title - Source")
      const titleParts = item.title.split(' - ');
      const source = titleParts.length > 1 ? titleParts.pop() : 'Unknown Source';
      const title = titleParts.join(' - ');
      
      // Create a clean news item
      return {
        id: `news-${index}-${Date.now()}`,
        title: title,
        source: source,
        date: item.pubDate || new Date().toUTCString(),
        url: item.link,
        snippet: item.description || 'No description available',
      };
    }) : [];
    
    // Add risk analysis for each news item
    const analyzedNews = newsItems.map(item => analyzeNewsItem(item, company, industry));
    
    return NextResponse.json({ data: analyzedNews });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Function to analyze news items for risk factors
function analyzeNewsItem(
  item: NewsItem, 
  company: string, 
  industry: string
): NewsItem & { 
  riskFactors: Array<{
    text: string;
    category: "environmental" | "social" | "governance" | "compliance";
    severity: "low" | "medium" | "high";
  }> 
} {
  const riskFactors = [];
  const combinedText = `${item.title} ${item.snippet}`.toLowerCase();
  
  // Check for environmental risks
  const environmentalTerms = [
    'pollution', 'emission', 'climate', 'carbon', 'environmental', 
    'waste', 'sustainable', 'green', 'eco'
  ];
  
  // Check for social risks
  const socialTerms = [
    'worker', 'labor', 'employee', 'safety', 'diversity', 'discrimination',
    'human rights', 'privacy', 'data breach', 'community'
  ];
  
  // Check for governance risks
  const governanceTerms = [
    'corruption', 'bribery', 'executive', 'board', 'compensation',
    'accountability', 'transparency', 'ethics', 'conduct'
  ];
  
  // Check for compliance risks
  const complianceTerms = [
    'regulation', 'compliance', 'legal', 'lawsuit', 'fine', 'penalty',
    'investigation', 'violation', 'audit', 'regulatory'
  ];
  
  // Look for environmental terms
  for (const term of environmentalTerms) {
    if (combinedText.includes(term)) {
      const severity = calculateSeverity(combinedText, term);
      riskFactors.push({
        text: term,
        category: 'environmental',
        severity
      });
      break; // Only add one environmental risk factor
    }
  }
  
  // Look for social terms
  for (const term of socialTerms) {
    if (combinedText.includes(term)) {
      const severity = calculateSeverity(combinedText, term);
      riskFactors.push({
        text: term,
        category: 'social',
        severity
      });
      break; // Only add one social risk factor
    }
  }
  
  // Look for governance terms
  for (const term of governanceTerms) {
    if (combinedText.includes(term)) {
      const severity = calculateSeverity(combinedText, term);
      riskFactors.push({
        text: term,
        category: 'governance',
        severity
      });
      break; // Only add one governance risk factor
    }
  }
  
  // Look for compliance terms
  for (const term of complianceTerms) {
    if (combinedText.includes(term)) {
      const severity = calculateSeverity(combinedText, term);
      riskFactors.push({
        text: term,
        category: 'compliance',
        severity
      });
      break; // Only add one compliance risk factor
    }
  }
  
  // If no risks found, add a default low risk if there are negative terms
  if (riskFactors.length === 0) {
    const negativeTerms = ['issue', 'problem', 'concern', 'risk', 'challenge', 'difficulty'];
    for (const term of negativeTerms) {
      if (combinedText.includes(term)) {
        riskFactors.push({
          text: term,
          category: 'governance',
          severity: 'low'
        });
        break;
      }
    }
  }
  
  return {
    ...item,
    riskFactors: riskFactors as {
      text: string;
      category: "compliance" | "environmental" | "social" | "governance";
      severity: "low" | "medium" | "high";
    }[]
  };
}

// Calculate severity based on context
function calculateSeverity(text: string, term: string): "low" | "medium" | "high" {
  const highRiskContexts = ['violation', 'serious', 'major', 'significant', 'critical', 'illegal', 'investigation'];
  const mediumRiskContexts = ['issue', 'problem', 'concern', 'risk', 'lawsuit'];
  
  for (const context of highRiskContexts) {
    if (text.includes(context)) {
      return 'high';
    }
  }
  
  for (const context of mediumRiskContexts) {
    if (text.includes(context)) {
      return 'medium';
    }
  }
  
  return 'low';
} 