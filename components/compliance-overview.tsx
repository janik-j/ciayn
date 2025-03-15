"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

type ComplianceFramework = {
  name: string
  shortName: string
  description: string
  compliantCount: number
  partialCount: number
  nonCompliantCount: number
  unknownCount: number
  totalCount: number
}

export function ComplianceOverview({ initialData = [] }: { initialData?: ComplianceFramework[] }) {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>(initialData);

  // Fetch data from API if no initial data is provided
  useEffect(() => {
    if (initialData.length === 0) {
      fetchComplianceData();
    }
  }, [initialData]);

  // Fetch compliance data from API
  const fetchComplianceData = async () => {
    try {
      const response = await fetch('/api/compliance');
      
      if (response.ok) {
        const { data } = await response.json();
        setFrameworks(data);
      } else {
        console.error('Error fetching compliance data:', response.statusText);
        setFrameworks([]); // Set empty array instead of mock data
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      setFrameworks([]); // Set empty array instead of mock data
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-500" />
          Compliance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {frameworks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">No compliance data available</h3>
            <p className="text-sm text-slate-500 mb-4">Unable to load compliance statistics</p>
            <Button onClick={fetchComplianceData} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="lksg">
            <TabsList className="grid grid-cols-5 mb-4">
              {frameworks.map((framework) => (
                <TabsTrigger key={framework.shortName.toLowerCase()} value={framework.shortName.toLowerCase()}>
                  {framework.shortName}
                </TabsTrigger>
              ))}
            </TabsList>

            {frameworks.map((framework) => (
              <TabsContent key={framework.shortName.toLowerCase()} value={framework.shortName.toLowerCase()}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{framework.name}</h3>
                    <p className="text-sm text-slate-500">{framework.description}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          Compliant
                        </span>
                        <span className="font-medium">
                          {framework.compliantCount} suppliers (
                          {Math.round((framework.compliantCount / framework.totalCount) * 100)}%)
                        </span>
                      </div>
                      <Progress
                        value={(framework.compliantCount / framework.totalCount) * 100}
                        className="h-2 bg-slate-100"
                        indicatorClassName="bg-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          Partially Compliant
                        </span>
                        <span className="font-medium">
                          {framework.partialCount} suppliers (
                          {Math.round((framework.partialCount / framework.totalCount) * 100)}%)
                        </span>
                      </div>
                      <Progress
                        value={(framework.partialCount / framework.totalCount) * 100}
                        className="h-2 bg-slate-100"
                        indicatorClassName="bg-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Non-Compliant
                        </span>
                        <span className="font-medium">
                          {framework.nonCompliantCount} suppliers (
                          {Math.round((framework.nonCompliantCount / framework.totalCount) * 100)}%)
                        </span>
                      </div>
                      <Progress
                        value={(framework.nonCompliantCount / framework.totalCount) * 100}
                        className="h-2 bg-slate-100"
                        indicatorClassName="bg-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-slate-400" />
                          Unknown
                        </span>
                        <span className="font-medium">
                          {framework.unknownCount} suppliers (
                          {Math.round((framework.unknownCount / framework.totalCount) * 100)}%)
                        </span>
                      </div>
                      <Progress
                        value={(framework.unknownCount / framework.totalCount) * 100}
                        className="h-2 bg-slate-100"
                        indicatorClassName="bg-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

