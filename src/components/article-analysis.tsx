'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  FileText,
  History,
  Target,
  AlertCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react'
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 mx-auto">
              <Loader2 className="h-16 w-16 animate-spin text-black dark:text-white" />
            </div>
            <Sparkles className="h-5 w-5 absolute top-0 right-1/4 text-blue-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
              Analyzing article with AI
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Our agents are examining historical context, stakeholders, and impacts...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                  Analysis Failed
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <FileText className="h-6 w-6 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No analysis available
          </p>
        </div>
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
      <div className="space-y-8 pb-8 px-1">
        {/* Header Section with Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Analysis Report
            </h2>
            {analysis.status && (
              <Badge 
                variant={analysis.status === 'success' ? 'default' : 'destructive'}
                className="font-medium"
              >
                {analysis.status}
              </Badge>
            )}
          </div>
          
          {analysis.processingTime && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <span>Analyzed in {(analysis.processingTime / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>

        {/* Key Topics Section */}
        {sharedContext?.topics && sharedContext.topics.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Key Topics
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {sharedContext.topics.map((topic, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 border-0"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Key Stakeholders Section */}
        {sharedContext?.stakeholders && sharedContext.stakeholders.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Key Stakeholders
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {sharedContext.stakeholders.map((stakeholder, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="px-3 py-1.5 text-sm font-medium border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {stakeholder}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Synthesized Report */}
        {synthesizedReport && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Comprehensive Analysis
              </h3>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50 p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none 
                prose-headings:font-semibold prose-headings:tracking-tight
                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-gray-900 dark:prose-h2:text-gray-100
                prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-gray-800 dark:prose-h3:text-gray-200
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-[15px]
                prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
                prose-ul:my-4 prose-ol:my-4
                prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:my-1.5 prose-li:text-[15px]
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-code:text-gray-900 dark:prose-code:text-gray-100 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                first:prose-p:mt-0 last:prose-p:mb-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {synthesizedReport}
                </ReactMarkdown>
              </div>
            </div>
          </section>
        )}

        {/* Timeline Section */}
        {sharedContext?.timeline && sharedContext.timeline.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Timeline
              </h3>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="space-y-6">
                {sharedContext.timeline.map((item, index) => (
                  <div key={index} className="relative pl-8">
                    {/* Timeline line */}
                    {index !== (sharedContext.timeline?.length ?? 0) - 1 && (
                      <div className="absolute left-[7px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-600 dark:to-blue-800" />
                    )}
                    
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-600 ring-4 ring-white dark:ring-gray-900" />
                    
                    <div className="space-y-1.5">
                      <time className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {item.date}
                      </time>
                      <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100 leading-snug">
                        {item.event}
                      </p>
                      {item.significance && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.significance}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Agent Analyses in Tabs */}
        {agentAnalyses.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Detailed Agent Insights
              </h3>
            </div>
            
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
              <Tabs defaultValue={agentAnalyses[0]?.agent || ''} className="w-full">
                <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-6 py-2">
                  <TabsList className="bg-transparent border-0 p-0 h-auto w-full justify-start gap-1">
                    {historicalAgent && (
                      <TabsTrigger 
                        value="historical"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium"
                      >
                        <History className="h-4 w-4 mr-2" />
                        Historical
                      </TabsTrigger>
                    )}
                    {stakeholderAgent && (
                      <TabsTrigger 
                        value="stakeholder"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Stakeholders
                      </TabsTrigger>
                    )}
                    {timelineAgent && (
                      <TabsTrigger 
                        value="timeline"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Timeline
                      </TabsTrigger>
                    )}
                    {impactAgent && (
                      <TabsTrigger 
                        value="impact"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Impact
                      </TabsTrigger>
                    )}
                    {factVerifierAgent && (
                      <TabsTrigger 
                        value="fact_verifier"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Fact Check
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>

                {/* Historical Agent */}
                {historicalAgent && (
                  <TabsContent value="historical" className="p-6 pt-6">
                    <div className="space-y-6">
                      {historicalAgent.findings?.findings?.historical_precedents && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Historical Precedents
                          </h4>
                          <div className="space-y-4">
                            {Array.isArray(historicalAgent.findings.findings.historical_precedents) ? (
                              historicalAgent.findings.findings.historical_precedents.map((item: any, idx: number) => (
                                <div 
                                  key={idx} 
                                  className="group relative pl-4 py-2 border-l-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                                >
                                  <ChevronRight className="absolute left-[-9px] top-2.5 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                  {typeof item === 'string' ? (
                                    <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">{item}</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {item.theme && (
                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{item.theme}</p>
                                      )}
                                      {item.examples && (
                                        <ul className="space-y-1.5 ml-4">
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
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Pattern Analysis
                          </h4>
                          <div className="space-y-4">
                            {Array.isArray(historicalAgent.findings.findings.pattern_analysis) ? (
                              historicalAgent.findings.findings.pattern_analysis.map((item: any, idx: number) => (
                                <div 
                                  key={idx} 
                                  className="group relative pl-4 py-2 border-l-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                                >
                                  <ChevronRight className="absolute left-[-9px] top-2.5 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                  {typeof item === 'string' ? (
                                    <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">{item}</p>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {item.pattern && (
                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{item.pattern}</p>
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
                      )}

                      {historicalAgent.findings?.analysis && (
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Analysis
                          </h4>
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:text-[15px] prose-p:leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {historicalAgent.findings.analysis}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Stakeholder Agent */}
                {stakeholderAgent && (
                  <TabsContent value="stakeholder" className="p-6 pt-6">
                    <div className="space-y-6">
                      {stakeholderAgent.findings?.findings?.stakeholder_positions && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Stakeholder Positions
                          </h4>
                          <div className="space-y-4">
                            {Object.entries(stakeholderAgent.findings.findings.stakeholder_positions).map(([key, value]: [string, any]) => (
                              <div 
                                key={key} 
                                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                              >
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">{key}</p>
                                <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {stakeholderAgent.findings?.findings?.power_dynamics && (
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Power Dynamics
                          </h4>
                          <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
                            {stakeholderAgent.findings.findings.power_dynamics}
                          </p>
                        </div>
                      )}

                      {stakeholderAgent.findings?.findings?.conflicting_interests && (
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Conflicting Interests
                          </h4>
                          <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
                            {stakeholderAgent.findings.findings.conflicting_interests}
                          </p>
                        </div>
                      )}

                      {stakeholderAgent.findings?.analysis && (
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Analysis
                          </h4>
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:text-[15px] prose-p:leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {stakeholderAgent.findings.analysis}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Timeline Agent */}
                {timelineAgent && (
                  <TabsContent value="timeline" className="p-6 pt-6">
                    <div className="space-y-6">
                      {timelineAgent.findings?.timeline && Array.isArray(timelineAgent.findings.timeline) && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Detailed Timeline
                          </h4>
                          <div className="space-y-6">
                            {timelineAgent.findings.timeline.map((item: any, idx: number) => (
                              <div key={idx} className="relative pl-8">
                                {idx !== timelineAgent.findings.timeline.length - 1 && (
                                  <div className="absolute left-[7px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-600 dark:to-blue-800" />
                                )}
                                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-600 ring-4 ring-white dark:ring-gray-900" />
                                <div className="space-y-1.5">
                                  <time className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                    {item.date}
                                  </time>
                                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-snug">
                                    {item.event}
                                  </p>
                                  {item.significance && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Critical Turning Points
                          </h4>
                          <ul className="space-y-3">
                            {timelineAgent.findings.findings.critical_turning_points.map((point: string, idx: number) => (
                              <li 
                                key={idx} 
                                className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed pl-4 py-2 border-l-2 border-gray-200 dark:border-gray-700"
                              >
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {timelineAgent.findings?.analysis && (
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Analysis
                          </h4>
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:text-[15px] prose-p:leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {timelineAgent.findings.analysis}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Impact Agent */}
                {impactAgent && (
                  <TabsContent value="impact" className="p-6 pt-6">
                    <div className="space-y-6">
                      {impactAgent.findings?.findings?.immediate_impacts && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Immediate Impacts
                          </h4>
                          <div className="space-y-4">
                            {Object.entries(impactAgent.findings.findings.immediate_impacts).map(([key, value]: [string, any]) => (
                              <div 
                                key={key} 
                                className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-900/50"
                              >
                                <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2 capitalize">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <p className="text-[15px] text-blue-800 dark:text-blue-200 leading-relaxed">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {impactAgent.findings?.findings?.medium_term_implications && (
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Medium-Term Implications
                          </h4>
                          <div className="space-y-4">
                            {Object.entries(impactAgent.findings.findings.medium_term_implications).map(([key, value]: [string, any]) => (
                              <div 
                                key={key} 
                                className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-900/50"
                              >
                                <p className="font-semibold text-sm text-amber-900 dark:text-amber-100 mb-2 capitalize">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <p className="text-[15px] text-amber-800 dark:text-amber-200 leading-relaxed">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {impactAgent.findings?.findings?.long_term_consequences && (
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Long-Term Consequences
                          </h4>
                          <div className="space-y-4">
                            {Object.entries(impactAgent.findings.findings.long_term_consequences).map(([key, value]: [string, any]) => (
                              <div 
                                key={key} 
                                className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-900/50"
                              >
                                <p className="font-semibold text-sm text-purple-900 dark:text-purple-100 mb-2 capitalize">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <p className="text-[15px] text-purple-800 dark:text-purple-200 leading-relaxed">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {impactAgent.findings?.analysis && (
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Analysis
                          </h4>
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:text-[15px] prose-p:leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {impactAgent.findings.analysis}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Fact Verifier Agent */}
                {factVerifierAgent && (
                  <TabsContent value="fact_verifier" className="p-6 pt-6">
                    <div className="space-y-6">
                      {factVerifierAgent.findings?.findings?.verified_claims && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                              Verified Claims
                            </h4>
                          </div>
                          <ul className="space-y-3">
                            {factVerifierAgent.findings.findings.verified_claims.map((claim: string, idx: number) => (
                              <li 
                                key={idx} 
                                className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed pl-4 py-2.5 border-l-2 border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-green-950/20 rounded-r"
                              >
                                {claim}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {factVerifierAgent.findings?.findings?.unverified_claims && 
                       factVerifierAgent.findings.findings.unverified_claims.length > 0 && (
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                              Unverified Claims
                            </h4>
                          </div>
                          <ul className="space-y-3">
                            {factVerifierAgent.findings.findings.unverified_claims.map((claim: string, idx: number) => (
                              <li 
                                key={idx} 
                                className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed pl-4 py-2.5 border-l-2 border-amber-500 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 rounded-r"
                              >
                                {claim}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {factVerifierAgent.findings?.findings?.missing_context && 
                       factVerifierAgent.findings.findings.missing_context.length > 0 && (
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Missing Context
                          </h4>
                          <ul className="space-y-3">
                            {factVerifierAgent.findings.findings.missing_context.map((context: string, idx: number) => (
                              <li 
                                key={idx} 
                                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-4 py-2 border-l-2 border-gray-300 dark:border-gray-600"
                              >
                                {context}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {factVerifierAgent.findings?.analysis && (
                        <div className="space-y-3">
                          <Separator className="my-6" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            Analysis
                          </h4>
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:text-[15px] prose-p:leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {factVerifierAgent.findings.analysis}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </section>
        )}
      </div>
    </ScrollArea>
  )
}
