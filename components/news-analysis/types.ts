export interface NewsArticle {
  title: string;
  snippet: string;
  url: string;
  source: string;
  imageUrl?: string;
  publishedAt: string;
}

export interface RiskItem {
  text: string;
  source?: string;
}

export interface ESGRisks {
  environmental: RiskItem[];
  social: RiskItem[];
  governance: RiskItem[];
  compliance: RiskItem[];
}

export interface AnalysisResult {
  summary: string;
  riskLevel: "Low" | "Medium" | "High";
  esgRisks: ESGRisks;
  keyFindings: RiskItem[];
  recommendations: RiskItem[];
}

export interface NewsApiResponse {
  articles: NewsArticle[];
  totalResults: number;
}

export interface AnalyzerProps {
  companyName: string;
  industry?: string;
  customPrompt?: string;
  title?: string;
  description?: string;
  regulationType?: 'lksg' | 'csrd' | 'cbam' | 'reach' | 'general';
}

export type RegulationType = 'lksg' | 'csrd' | 'cbam' | 'reach' | 'general';

export interface NewsFeedAnalyzerProps {
  companyName: string;
  industry: string;
  customPrompt?: string;
}

export interface AIAnalysisOnlyProps {
  companyName: string;
  industry: string;
  customPrompt: string;
  title?: string;
  description?: string;
  regulationType?: 'lksg' | 'csrd' | 'cbam' | 'reach' | 'general';
} 