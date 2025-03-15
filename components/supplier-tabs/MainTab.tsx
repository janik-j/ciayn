"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Building, 
  MapPin, 
  Users, 
  Globe, 
  AlertTriangle, 
  CheckCircle 
} from "lucide-react"
import { TabCommonProps } from "./types"

type MainTabProps = Pick<TabCommonProps, 'supplier' | 'getComplianceScore' | 'getComplianceColor'>

export function MainTab({ 
  supplier, 
  getComplianceScore, 
  getComplianceColor 
}: MainTabProps) {
  
  const getTotalComplianceScore = () => {
    const scores = [
      getComplianceScore(supplier.complianceStatus.lksg),
      getComplianceScore(supplier.complianceStatus.csrd),
      getComplianceScore(supplier.complianceStatus.cbam),
      getComplianceScore(supplier.complianceStatus.reach),
      getComplianceScore(supplier.complianceStatus.csdd)
    ];
    
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(average);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Company Information Card */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Industry</p>
                    <p className="text-sm font-medium">{supplier.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Country</p>
                    <p className="text-sm font-medium">{supplier.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Employees</p>
                    <p className="text-sm font-medium">{supplier.employees}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Website</p>
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      {supplier.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Red Flags</h3>
              <div className="space-y-2">
                {supplier.redFlags.length > 0 ? (
                  supplier.redFlags.map((flag, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <AlertTitle className="ml-2 text-sm font-medium">Risk Identified</AlertTitle>
                      <AlertDescription className="ml-2 text-sm">{flag}</AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <AlertTitle className="ml-2 text-sm font-medium">No Risks Identified</AlertTitle>
                    <AlertDescription className="ml-2 text-sm">
                      No significant red flags have been identified for this supplier.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Compliance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">German Supply Chain Act (LkSG)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={getComplianceColor(supplier.complianceStatus.lksg)}>
                        {supplier.complianceStatus.lksg}
                      </Badge>
                      <Progress value={getComplianceScore(supplier.complianceStatus.lksg)} className="w-24 h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">CSRD</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={getComplianceColor(supplier.complianceStatus.csrd)}>
                        {supplier.complianceStatus.csrd}
                      </Badge>
                      <Progress value={getComplianceScore(supplier.complianceStatus.csrd)} className="w-24 h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">CBAM</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={getComplianceColor(supplier.complianceStatus.cbam)}>
                        {supplier.complianceStatus.cbam}
                      </Badge>
                      <Progress value={getComplianceScore(supplier.complianceStatus.cbam)} className="w-24 h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">REACH</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={getComplianceColor(supplier.complianceStatus.reach)}>
                        {supplier.complianceStatus.reach}
                      </Badge>
                      <Progress value={getComplianceScore(supplier.complianceStatus.reach)} className="w-24 h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Total Score Card */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Compliance Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#e2e8f0" 
                    strokeWidth="10" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke={
                      getTotalComplianceScore() >= 75 ? "#10b981" : 
                      getTotalComplianceScore() >= 50 ? "#f59e0b" : 
                      "#ef4444"
                    } 
                    strokeWidth="10" 
                    strokeDasharray={`${getTotalComplianceScore() * 2.83} 283`} 
                    strokeDashoffset="0" 
                    strokeLinecap="round" 
                    transform="rotate(-90 50 50)" 
                  />
                </svg>
                <div className="absolute text-4xl font-bold">
                  {getTotalComplianceScore()}%
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-sm font-medium mb-2">Overall Rating</h3>
              <Badge 
                className={`
                  ${getTotalComplianceScore() >= 75 ? "bg-emerald-100 text-emerald-800" : 
                    getTotalComplianceScore() >= 50 ? "bg-amber-100 text-amber-800" : 
                    "bg-red-100 text-red-800"} 
                  px-3 py-1
                `}
              >
                {getTotalComplianceScore() >= 75 ? "Good" : 
                  getTotalComplianceScore() >= 50 ? "Needs Improvement" : 
                  "At Risk"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 