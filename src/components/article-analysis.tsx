'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Clock, Users, TrendingUp, CheckCircle2, FileText } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AgentAnalysis {
  agent: string
  findings: any
}

interface ArticleAnalysisResponse {
  sessionId?: string
  status?: string
  timestamp?: string
  agentAnalyses?: AgentAnalysis[]
  synthesizedReport?: string
  processingTime?: number
  sharedContext?: {
    topics?: string[]
    stakeholders?: string[]
    timeline?: Array<{
      event: string
      date: string
      significance?: string
    }>
  }
}

interface ArticleAnalysisProps {
  analysis: ArticleAnalysisResponse | null
  loading: boolean
  error: string | null
}

export function ArticleAnalysisDisplay({ analysis, loading, error }: ArticleAnalysisProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Analyzing article...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            This may take a moment
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="py-12">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          No analysis available
        </p>
      </div>
    )
  }

  const { agentAnalyses = [], synthesizedReport, sharedContext } = analysis

  // Get agent by type
  const getAgentByType = (type: string) => {
    return agentAnalyses.find(a => a.agent === type)
  }

  const historicalAgent = getAgentByType('historical')
  const stakeholderAgent = getAgentByType('stakeholder')
  const timelineAgent = getAgentByType('timeline')
  const impactAgent = getAgentByType('impact')
  const factVerifierAgent = getAgentByType('fact_verifier')

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pb-6">
        {/* Status Badge */}
        {analysis.status && (
          <div className="flex items-center gap-2">
            <Badge variant={analysis.status === 'success' ? 'default' : 'destructive'}>
              {analysis.status}
            </Badge>
            {analysis.processingTime && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Processed in {(analysis.processingTime / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        )}

        {/* Shared Context - Topics */}
        {sharedContext?.topics && sharedContext.topics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Key Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sharedContext.topics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shared Context - Stakeholders */}
        {sharedContext?.stakeholders && sharedContext.stakeholders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Key Stakeholders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sharedContext.stakeholders.map((stakeholder, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {stakeholder}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Synthesized Report */}
        {synthesizedReport && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Comprehensive Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:text-sm prose-p:leading-relaxed prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-ul:list-disc prose-ol:list-decimal prose-li:my-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {synthesizedReport}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shared Context - Timeline */}
        {sharedContext?.timeline && sharedContext.timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sharedContext.timeline.map((item, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-800">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600"></div>
                    <div className="pb-4">
                      <p className="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-1">
                        {item.date}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">
                        {item.event}
                      </p>
                      {item.significance && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                          {item.significance}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Analyses in Tabs */}
        {agentAnalyses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Agent Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={agentAnalyses[0]?.agent || ''} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                  {historicalAgent && (
                    <TabsTrigger value="historical">Historical</TabsTrigger>
                  )}
                  {stakeholderAgent && (
                    <TabsTrigger value="stakeholder">Stakeholders</TabsTrigger>
                  )}
                  {timelineAgent && (
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  )}
                  {impactAgent && (
                    <TabsTrigger value="impact">Impact</TabsTrigger>
                  )}
                  {factVerifierAgent && (
                    <TabsTrigger value="fact_verifier">Fact Check</TabsTrigger>
                  )}
                </TabsList>

                {/* Historical Agent */}
                {historicalAgent && (
                  <TabsContent value="historical" className="mt-4">
                    <div className="space-y-4">
                      {historicalAgent.findings?.findings?.historical_precedents && (
                        <div>
                          <h3 className="font-semibold text-base mb-3">Historical Precedents</h3>
                          <div className="space-y-3">
                            {Array.isArray(historicalAgent.findings.findings.historical_precedents) ? (
                              historicalAgent.findings.findings.historical_precedents.map((item: any, idx: number) => (
                                <div key={idx} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                  {typeof item === 'string' ? (
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                                  ) : (
                                    <div>
                                      {item.theme && (
                                        <p className="font-semibold text-sm mb-1">{item.theme}</p>
                                      )}
                                      {item.examples && (
                                        <ul className="space-y-1 ml-4">
                                          {item.examples.map((ex: string, i: number) => (
                                            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 list-disc">
                                              {ex}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {JSON.stringify(historicalAgent.findings.findings.historical_precedents)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {historicalAgent.findings?.findings?.pattern_analysis && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Pattern Analysis</h3>
                            <div className="space-y-3">
                              {Array.isArray(historicalAgent.findings.findings.pattern_analysis) ? (
                                historicalAgent.findings.findings.pattern_analysis.map((item: any, idx: number) => (
                                  <div key={idx} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                    {typeof item === 'string' ? (
                                      <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                                    ) : (
                                      <div>
                                        {item.pattern && (
                                          <p className="font-semibold text-sm mb-1">{item.pattern}</p>
                                        )}
                                        {item.description && (
                                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {JSON.stringify(historicalAgent.findings.findings.pattern_analysis)}
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {historicalAgent.findings?.analysis && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Analysis</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {historicalAgent.findings.analysis}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Stakeholder Agent */}
                {stakeholderAgent && (
                  <TabsContent value="stakeholder" className="mt-4">
                    <div className="space-y-4">
                      {stakeholderAgent.findings?.findings?.stakeholder_positions && (
                        <div>
                          <h3 className="font-semibold text-base mb-3">Stakeholder Positions</h3>
                          <div className="space-y-3">
                            {Object.entries(stakeholderAgent.findings.findings.stakeholder_positions).map(([key, value]: [string, any]) => (
                              <div key={key} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-sm mb-1">{key}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {stakeholderAgent.findings?.findings?.power_dynamics && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Power Dynamics</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {stakeholderAgent.findings.findings.power_dynamics}
                            </p>
                          </div>
                        </>
                      )}

                      {stakeholderAgent.findings?.findings?.conflicting_interests && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Conflicting Interests</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {stakeholderAgent.findings.findings.conflicting_interests}
                            </p>
                          </div>
                        </>
                      )}

                      {stakeholderAgent.findings?.analysis && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Analysis</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {stakeholderAgent.findings.analysis}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Timeline Agent */}
                {timelineAgent && (
                  <TabsContent value="timeline" className="mt-4">
                    <div className="space-y-4">
                      {timelineAgent.findings?.timeline && Array.isArray(timelineAgent.findings.timeline) && (
                        <div>
                          <h3 className="font-semibold text-base mb-3">Detailed Timeline</h3>
                          <div className="space-y-4">
                            {timelineAgent.findings.timeline.map((item: any, idx: number) => (
                              <div key={idx} className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-800">
                                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600"></div>
                                <div className="pb-4">
                                  <p className="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-1">
                                    {item.date}
                                  </p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                    {item.event}
                                  </p>
                                  {item.significance && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                      {item.significance}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {timelineAgent.findings?.findings?.critical_turning_points && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Critical Turning Points</h3>
                            <ul className="space-y-2">
                              {timelineAgent.findings.findings.critical_turning_points.map((point: string, idx: number) => (
                                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {timelineAgent.findings?.analysis && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Analysis</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {timelineAgent.findings.analysis}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Impact Agent */}
                {impactAgent && (
                  <TabsContent value="impact" className="mt-4">
                    <div className="space-y-4">
                      {impactAgent.findings?.findings?.immediate_impacts && (
                        <div>
                          <h3 className="font-semibold text-base mb-3">Immediate Impacts</h3>
                          <div className="space-y-2">
                            {Object.entries(impactAgent.findings.findings.immediate_impacts).map(([key, value]: [string, any]) => (
                              <div key={key} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-sm mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {impactAgent.findings?.findings?.medium_term_implications && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Medium-Term Implications</h3>
                            <div className="space-y-2">
                              {Object.entries(impactAgent.findings.findings.medium_term_implications).map(([key, value]: [string, any]) => (
                                <div key={key} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                  <p className="font-semibold text-sm mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {impactAgent.findings?.findings?.long_term_consequences && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Long-Term Consequences</h3>
                            <div className="space-y-2">
                              {Object.entries(impactAgent.findings.findings.long_term_consequences).map(([key, value]: [string, any]) => (
                                <div key={key} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                  <p className="font-semibold text-sm mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {impactAgent.findings?.analysis && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Analysis</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {impactAgent.findings.analysis}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Fact Verifier Agent */}
                {factVerifierAgent && (
                  <TabsContent value="fact_verifier" className="mt-4">
                    <div className="space-y-4">
                      {factVerifierAgent.findings?.findings?.verified_claims && (
                        <div>
                          <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Verified Claims
                          </h3>
                          <ul className="space-y-2">
                            {factVerifierAgent.findings.findings.verified_claims.map((claim: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-green-200 dark:border-green-800">
                                {claim}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {factVerifierAgent.findings?.findings?.unverified_claims && 
                       factVerifierAgent.findings.findings.unverified_claims.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                              Unverified Claims
                            </h3>
                            <ul className="space-y-2">
                              {factVerifierAgent.findings.findings.unverified_claims.map((claim: string, idx: number) => (
                                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-yellow-200 dark:border-yellow-800">
                                  {claim}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {factVerifierAgent.findings?.findings?.missing_context && 
                       factVerifierAgent.findings.findings.missing_context.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Missing Context</h3>
                            <ul className="space-y-2">
                              {factVerifierAgent.findings.findings.missing_context.map((context: string, idx: number) => (
                                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                  {context}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {factVerifierAgent.findings?.analysis && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-base mb-3">Analysis</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {factVerifierAgent.findings.analysis}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}
