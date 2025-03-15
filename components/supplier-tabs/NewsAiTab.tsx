"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewsFeedAnalyzer } from "@/components/news-feed-analyzer"
import { TabCommonProps } from "./types"
import { getGeneralPrompt } from "./prompts"

type NewsAiTabProps = Pick<TabCommonProps, 'supplier'>

export function NewsAiTab({ supplier }: NewsAiTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Newsfeed</CardTitle>
        <CardDescription>
          Real-time news analysis and AI-driven insights about {supplier.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NewsFeedAnalyzer 
          companyName={supplier.name} 
          industry={supplier.industry} 
          customPrompt={getGeneralPrompt(supplier.name)} 
        />
      </CardContent>
    </Card>
  )
} 