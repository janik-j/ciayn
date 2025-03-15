import { NewsArticle } from "./types";

export const convertToArrayWithSource = (items: any[]): Array<{text: string, source?: string}> => {
  if (!items) return [];
  return items.map(item => {
    if (typeof item === 'string') {
      return { text: item };
    } else if (typeof item === 'object' && item.text) {
      return { text: item.text, source: item.source };
    }
    return { text: String(item) };
  });
}

export const findArticleUrl = (text: string, articles: NewsArticle[]): string | undefined => {
  if (!text || !articles || articles.length === 0) return undefined;
  
  // Try to find an exact match in article titles
  const exactTitleMatch = articles.find(article => 
    article.title.toLowerCase().includes(text.toLowerCase())
  );
  if (exactTitleMatch) return exactTitleMatch.url;
  
  // Try to find a match in article snippets
  const snippetMatch = articles.find(article => 
    article.snippet.toLowerCase().includes(text.toLowerCase())
  );
  if (snippetMatch) return snippetMatch.url;
  
  return undefined;
}

export const ensureValidUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's already an absolute URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Otherwise, assume it's a relative URL and prepend 'https://'
  return `https://${url}`;
}

export const getSeverityColor = (severity: "low" | "medium" | "high") => {
  switch (severity) {
    case "low":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "medium":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

export const getCategoryColor = (category: "environmental" | "social" | "governance" | "compliance") => {
  switch (category) {
    case "environmental":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "social":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "governance":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "compliance":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  } catch (e) {
    return dateString; // Return original if parsing fails
  }
} 