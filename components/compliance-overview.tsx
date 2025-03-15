"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"

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

export function ComplianceOverview() {
  // Mock data for compliance frameworks
  const frameworks: ComplianceFramework[] = [
    {
      name: "German Supply Chain Act",
      shortName: "LkSG",
      description:
        "Requires companies to identify risks of human rights violations and environmental destruction in their supply chains",
      compliantCount: 24,
      partialCount: 12,
      nonCompliantCount: 8,
      unknownCount: 6,
      totalCount: 50,
    },
    {
      name: "Carbon Border Adjustment Mechanism",
      shortName: "CBAM",
      description: "EU regulation to prevent carbon leakage by pricing carbon-intensive imports",
      compliantCount: 18,
      partialCount: 15,
      nonCompliantCount: 10,
      unknownCount: 7,
      totalCount: 50,
    },
    {
      name: "Corporate Sustainability Due Diligence",
      shortName: "CSDD",
      description:
        "EU directive requiring companies to identify and address adverse human rights and environmental impacts",
      compliantCount: 16,
      partialCount: 18,
      nonCompliantCount: 9,
      unknownCount: 7,
      totalCount: 50,
    },
    {
      name: "Corporate Sustainability Reporting",
      shortName: "CSRD",
      description: "EU directive requiring large companies to report on sustainability matters",
      compliantCount: 14,
      partialCount: 16,
      nonCompliantCount: 12,
      unknownCount: 8,
      totalCount: 50,
    },
    {
      name: "Registration, Evaluation, Authorization of Chemicals",
      shortName: "REACH",
      description: "EU regulation addressing the production and use of chemical substances",
      compliantCount: 20,
      partialCount: 14,
      nonCompliantCount: 11,
      unknownCount: 5,
      totalCount: 50,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-500" />
          Compliance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}

