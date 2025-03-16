"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, AlertTriangle } from "lucide-react"
import { AnalysisResult, NewsArticle } from "./types"
import { SourceLink } from "./shared-components"
import { findArticleUrl } from "./utils"

interface AnalysisRendererProps {
  analysis: AnalysisResult | null;
  articles: NewsArticle[];
  regulationType: 'lksg' | 'csrd' | 'cbam' | 'reach' | 'general';
}

export function AnalysisRenderer({ analysis, articles, regulationType }: AnalysisRendererProps) {
  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Analysis Available</AlertTitle>
        <AlertDescription>
          We couldn't generate analysis for this company. Try refreshing or try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Call the appropriate renderer based on regulation type
  switch (regulationType) {
    case 'lksg':
      return <LksgAnalysisRenderer analysis={analysis} articles={articles} />;
    case 'csrd':
      return <CsrdAnalysisRenderer analysis={analysis} articles={articles} />;
    case 'cbam':
      return <CbamAnalysisRenderer analysis={analysis} articles={articles} />;
    case 'reach':
      return <ReachAnalysisRenderer analysis={analysis} articles={articles} />;
    case 'general':
    default:
      return <GeneralAnalysisRenderer analysis={analysis} articles={articles} />;
  }
}

// Renderer for LkSG (German Supply Chain Act) analysis
function LksgAnalysisRenderer({ analysis, articles }: { analysis: AnalysisResult | null, articles: NewsArticle[] }) {
  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No LkSG Analysis Available</AlertTitle>
        <AlertDescription>
          We couldn't generate supply chain due diligence analysis for this company. Try refreshing or try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Add this console log to debug
  console.log("Environmental risks:", analysis.esgRisks.environmental);
  console.log("Full analysis object:", analysis);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h4 className="font-medium">Supply Chain Due Diligence Analysis</h4>
          </div>
          <p className="text-sm text-slate-700">{analysis.summary}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Human Rights Issues</h4>
            <ul className="space-y-2">
              {analysis.esgRisks.social.length > 0 ? (
                analysis.esgRisks.social.map((risk, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span className="flex-1">{risk.text}</span>
                    {risk.source || findArticleUrl(risk.text, articles) ? (
                      <SourceLink url={risk.source || findArticleUrl(risk.text, articles)} color="blue" />
                    ) : null}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500 italic">No specific human rights issues identified</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Environmental Due Diligence</h4>
            <ul className="space-y-2">
              {analysis.esgRisks.environmental && analysis.esgRisks.environmental.length > 0 ? (
                analysis.esgRisks.environmental.map((risk, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span className="flex-1">{risk.text}</span>
                    {risk.source || findArticleUrl(risk.text, articles) ? (
                      <SourceLink url={risk.source || findArticleUrl(risk.text, articles)} color="emerald" />
                    ) : null}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500 italic">No specific environmental issues identified</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Supply Chain Risk Assessment</h4>
          <ul className="space-y-2">
            {analysis.keyFindings.map((finding, idx) => (
              <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                <span className="text-purple-500 mt-0.5">→</span>
                <span className="flex-1">{finding.text}</span>
                {finding.source || findArticleUrl(finding.text, articles) ? (
                  <SourceLink url={finding.source || findArticleUrl(finding.text, articles)} color="amber" />
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Renderer for CSRD (Corporate Sustainability Reporting Directive) analysis
function CsrdAnalysisRenderer({ analysis, articles }: { analysis: AnalysisResult | null, articles: NewsArticle[] }) {
  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No CSRD Analysis Available</AlertTitle>
        <AlertDescription>
          We couldn't generate sustainability reporting analysis for this company. Try refreshing or try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h4 className="font-medium">Sustainability Reporting Analysis</h4>
          </div>
          <p className="text-sm text-slate-700">{analysis.summary}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Disclosure Quality</h4>
            <ul className="space-y-2">
              {analysis.esgRisks.governance.length > 0 ? (
                analysis.esgRisks.governance.map((risk, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span className="flex-1">{risk.text}</span>
                    {risk.source || findArticleUrl(risk.text, articles) ? (
                      <SourceLink url={risk.source || findArticleUrl(risk.text, articles)} color="blue" />
                    ) : null}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500 italic">No specific disclosure issues identified</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Materiality Assessment</h4>
            <ul className="space-y-2">
              {analysis.keyFindings.slice(0, 3).map((finding, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span className="flex-1">{finding.text}</span>
                  {finding.source || findArticleUrl(finding.text, articles) ? (
                    <SourceLink url={finding.source || findArticleUrl(finding.text, articles)} color="amber" />
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">CSRD Compliance Gaps</h4>
          <ul className="space-y-2">
            {analysis.keyFindings.slice(3).concat(analysis.esgRisks.compliance).map((finding, idx) => (
              <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                <span className="text-purple-500 mt-0.5">→</span>
                <span className="flex-1">{typeof finding === 'string' ? finding : finding.text}</span>
                {typeof finding !== 'string' && (finding.source || findArticleUrl(finding.text, articles)) ? (
                  <SourceLink url={finding.source || findArticleUrl(finding.text, articles)} color="amber" />
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Renderer for CBAM (Carbon Border Adjustment Mechanism) analysis
function CbamAnalysisRenderer({ analysis, articles }: { analysis: AnalysisResult | null, articles: NewsArticle[] }) {
  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No CBAM Analysis Available</AlertTitle>
        <AlertDescription>
          We couldn't generate carbon border adjustment analysis for this company. Try refreshing or try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h4 className="font-medium">Carbon Border Adjustment Analysis</h4>
          </div>
          <p className="text-sm text-slate-700">{analysis.summary}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Carbon Intensive Products</h4>
            <ul className="space-y-2">
              {analysis.esgRisks.environmental.length > 0 ? (
                analysis.esgRisks.environmental.map((risk, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span className="flex-1">{risk.text}</span>
                    {risk.source || findArticleUrl(risk.text, articles) ? (
                      <SourceLink url={risk.source || findArticleUrl(risk.text, articles)} color="emerald" />
                    ) : null}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500 italic">No specific carbon-intensive products identified</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Trade Impact</h4>
            <ul className="space-y-2">
              {analysis.esgRisks.compliance.length > 0 ? (
                analysis.esgRisks.compliance.map((risk, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span className="flex-1">{risk.text}</span>
                    {risk.source || findArticleUrl(risk.text, articles) ? (
                      <SourceLink url={risk.source || findArticleUrl(risk.text, articles)} color="amber" />
                    ) : null}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500 italic">No specific trade impacts identified</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Emissions Data Status</h4>
          <ul className="space-y-2">
            {analysis.keyFindings.map((finding, idx) => (
              <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                <span className="text-purple-500 mt-0.5">→</span>
                <span className="flex-1">{finding.text}</span>
                {finding.source || findArticleUrl(finding.text, articles) ? (
                  <SourceLink url={finding.source || findArticleUrl(finding.text, articles)} color="amber" />
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Renderer for REACH (Registration, Evaluation, Authorisation and Restriction of Chemicals) analysis
function ReachAnalysisRenderer({ analysis, articles }: { analysis: AnalysisResult | null, articles: NewsArticle[] }) {
  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No REACH Analysis Available</AlertTitle>
        <AlertDescription>
          We couldn't generate chemical regulation compliance analysis for this company. Try refreshing or try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h4 className="font-medium">Chemical Regulation Compliance Analysis</h4>
          </div>
          <p className="text-sm text-slate-700">{analysis.summary}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Substances of Concern</h4>
            <ul className="space-y-2">
              {analysis.esgRisks.environmental.length > 0 ? (
                analysis.esgRisks.environmental.map((risk, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span className="flex-1">{risk.text}</span>
                    {risk.source || findArticleUrl(risk.text, articles) ? (
                      <SourceLink url={risk.source || findArticleUrl(risk.text, articles)} color="emerald" />
                    ) : null}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500 italic">No specific substances of concern identified</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Registration Status</h4>
            <ul className="space-y-2">
              {analysis.esgRisks.compliance.length > 0 ? (
                analysis.esgRisks.compliance.map((risk, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span className="flex-1">{risk.text}</span>
                    {risk.source || findArticleUrl(risk.text, articles) ? (
                      <SourceLink url={risk.source || findArticleUrl(risk.text, articles)} color="amber" />
                    ) : null}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500 italic">No specific registration issues identified</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Safety Data Communication</h4>
          <ul className="space-y-2">
            {analysis.keyFindings.map((finding, idx) => (
              <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                <span className="text-purple-500 mt-0.5">→</span>
                <span className="flex-1">{finding.text}</span>
                {finding.source || findArticleUrl(finding.text, articles) ? (
                  <SourceLink url={finding.source || findArticleUrl(finding.text, articles)} color="amber" />
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Renderer for general ESG analysis
function GeneralAnalysisRenderer({ analysis, articles }: { analysis: AnalysisResult | null, articles: NewsArticle[] }) {
  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Analysis Available</AlertTitle>
        <AlertDescription>
          We couldn't generate analysis for this company. Try refreshing or try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h4 className="font-medium">AI Analysis Summary</h4>
          </div>
          <p className="text-sm text-slate-700">{analysis.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">ESG Risks</h4>
            <div className="space-y-4">
              {/* Environmental Risks */}
              <div>
                <h5 className="text-sm font-medium text-emerald-700 mb-1">Environmental</h5>
                <ul className="space-y-2">
                  {analysis.esgRisks.environmental.length > 0 ? (
                    analysis.esgRisks.environmental.map((risk, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span className="flex-1">{risk.text}</span>
                        {risk.source || findArticleUrl(risk.text, articles) ? (
                          <SourceLink url={risk.source || findArticleUrl(risk.text, articles)} color="emerald" />
                        ) : null}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500 italic">No environmental risks identified</li>
                  )}
                </ul>
              </div>

              {/* Social Risks */}
              <div>
                <h5 className="text-sm font-medium text-blue-700 mb-1">Social</h5>
                <ul className="space-y-2">
                  {analysis.esgRisks.social.length > 0 ? (
                    analysis.esgRisks.social.map((risk, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span className="flex-1">{risk.text}</span>
                        {risk.source || findArticleUrl(risk.text, articles) ? (
                          <SourceLink url={risk.source || findArticleUrl(risk.text, articles)} color="blue" />
                        ) : null}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500 italic">No social risks identified</li>
                  )}
                </ul>
              </div>

              {/* Governance Risks */}
              <div>
                <h5 className="text-sm font-medium text-purple-700 mb-1">Governance</h5>
                <ul className="space-y-2">
                  {analysis.esgRisks.governance.length > 0 ? (
                    analysis.esgRisks.governance.map((risk, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                        <span className="text-purple-500 mt-0.5">•</span>
                        <span className="flex-1">{risk.text}</span>
                        {risk.source || findArticleUrl(risk.text, articles) ? (
                          <SourceLink url={risk.source || findArticleUrl(risk.text, articles)} color="purple" />
                        ) : null}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500 italic">No governance risks identified</li>
                  )}
                </ul>
              </div>

              {/* Compliance Risks */}
              <div>
                <h5 className="text-sm font-medium text-amber-700 mb-1">Compliance</h5>
                <ul className="space-y-2">
                  {analysis.esgRisks.compliance.length > 0 ? (
                    analysis.esgRisks.compliance.map((risk, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span className="flex-1">{risk.text}</span>
                        {risk.source || findArticleUrl(risk.text, articles) ? (
                          <SourceLink url={risk.source || findArticleUrl(risk.text, articles)} color="amber" />
                        ) : null}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500 italic">No compliance risks identified</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Key Findings</h4>
              <ul className="space-y-2">
                {analysis.keyFindings.map((finding, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-purple-500 mt-0.5">→</span>
                    <span className="flex-1">{finding.text}</span>
                    {finding.source || findArticleUrl(finding.text, articles) ? (
                      <SourceLink url={finding.source || findArticleUrl(finding.text, articles)} color="purple" />
                    ) : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 