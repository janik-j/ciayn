"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Newsfeed } from "../news-analysis/newsfeed"
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
        <Newsfeed 
          companyName={supplier.name}
          title="Recent News"
          description={`Real-time news analysis and AI-driven insights about ${supplier.name}`}
        />
      </CardContent>
    </Card>
  )
} 