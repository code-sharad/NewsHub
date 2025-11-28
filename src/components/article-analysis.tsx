import { useRef, useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Clock,
  Users,
  TrendingUp,
  CheckCircle2,
  FileText,
  History,
  Target,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Download,
  Share2,
  Quote,
  Loader2
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { NewsAnalysisPDF } from './news-analysis-pdf'

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
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleShare = async () => {
    if (!analysis) return

    const shareData = {
      title: 'AI Intelligence Report',
      text: analysis.synthesizedReport || 'Check out this AI analysis report.',
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Report link copied to clipboard",
      })
    }
  }

  if (loading) return null // Handled by visual component

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

  if (!analysis) return null

  const { agentAnalyses = [], synthesizedReport, sharedContext } = analysis

  // Get agent by type
  const getAgentByType = (type: string) => agentAnalyses.find(a => a.agent === type)

  const historicalAgent = getAgentByType('historical')
  const stakeholderAgent = getAgentByType('stakeholder')
  const timelineAgent = getAgentByType('timeline')
  const impactAgent = getAgentByType('impact')
  const factVerifierAgent = getAgentByType('fact_verifier')

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="print:p-8 w-full overflow-hidden">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6 sm:space-y-8 pb-12 px-1 sm:px-6 max-w-5xl mx-auto w-full overflow-hidden box-border"
        >
          {/* Header Section */}
          <motion.div variants={item} className="space-y-6 text-center pt-8">
            <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="w-3 h-3 mr-2" />
              AI Intelligence Report
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-foreground">
              Comprehensive Analysis
            </h2>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Generated in {(analysis.processingTime ? analysis.processingTime / 1000 : 0).toFixed(1)}s</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>{agentAnalyses.length} Agents Consulted</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2 print:hidden">
              {isClient && (
                <PDFDownloadLink
                  document={<NewsAnalysisPDF analysis={analysis} />}
                  fileName={`analysis-report-${new Date().toISOString().split('T')[0]}.pdf`}
                >
                  {({ blob, url, loading, error }) => (
                    <Button variant="outline" size="sm" className="rounded-full" disabled={loading}>
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {loading ? 'Generating PDF...' : 'Export PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}

              <Button variant="outline" size="sm" className="rounded-full" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Report
              </Button>
            </div>
          </motion.div>

          <Separator className="my-8" />

          {/* Executive Summary (Synthesized Report) */}
          {synthesizedReport && (
            <motion.section variants={item} className="space-y-4 sm:space-y-6 overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Quote className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold font-serif">Executive Summary</h3>
              </div>

              <div className="glass-card p-3 sm:p-8 overflow-hidden">
                <div className="prose prose-sm dark:prose-invert max-w-none w-full
                  prose-headings:font-serif prose-headings:font-semibold prose-headings:text-base sm:prose-headings:text-lg
                  prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:text-sm sm:prose-p:text-base
                  prose-strong:text-foreground prose-strong:font-bold
                  prose-li:text-muted-foreground prose-li:text-sm sm:prose-li:text-base
                  break-words overflow-wrap-anywhere
                  [&_*]:max-w-full [&_img]:max-w-full [&_pre]:whitespace-pre-wrap [&_pre]:break-all [&_pre]:overflow-x-auto [&_pre]:text-xs [&_code]:text-xs [&_code]:break-all">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {synthesizedReport}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.section>
          )}

          {/* Key Insights Grid */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 overflow-hidden">
            {/* Topics */}
            {sharedContext?.topics && sharedContext.topics.length > 0 && (
              <div className="glass-card p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-hidden">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <h4 className="font-semibold text-sm sm:text-base">Key Topics</h4>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {sharedContext.topics.map((topic, i) => (
                    <Badge key={i} variant="secondary" className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm max-w-full truncate">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stakeholders */}
            {sharedContext?.stakeholders && sharedContext.stakeholders.length > 0 && (
              <div className="glass-card p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-hidden">
                <div className="flex items-center gap-2 text-blue-500">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <h4 className="font-semibold text-sm sm:text-base">Key Stakeholders</h4>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {sharedContext.stakeholders.map((stakeholder, i) => (
                    <Badge key={i} variant="outline" className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 max-w-full truncate">
                      {stakeholder}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Timeline Section */}
          {sharedContext?.timeline && sharedContext.timeline.length > 0 && (
            <motion.section variants={item} className="space-y-4 sm:space-y-6 overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10 text-green-500 shrink-0">
                  <History className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold font-serif">Chronological Context</h3>
              </div>

              <div className="glass-card p-3 sm:p-8 overflow-hidden">
                <div className="space-y-4 sm:space-y-8 relative before:absolute before:inset-0 before:ml-4 sm:before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {sharedContext.timeline.map((event, i) => (
                    <div key={i} className="relative flex items-start md:items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-background bg-muted shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full" />
                      </div>

                      <div className="w-[calc(100%-2.5rem)] sm:w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] p-2.5 sm:p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors shadow-sm ml-2 sm:ml-0">
                        <div className="flex flex-col gap-1 mb-1">
                          <div className="font-semibold text-foreground text-xs sm:text-sm leading-tight break-words">{event.event}</div>
                          <time className="font-mono text-[10px] sm:text-xs text-muted-foreground">{event.date}</time>
                        </div>
                        {event.significance && (
                          <div className="text-xs sm:text-sm text-muted-foreground break-words leading-relaxed">
                            {event.significance}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* Detailed Agent Findings */}
          <motion.section variants={item} className="space-y-4 sm:space-y-6 overflow-hidden">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold font-serif">Deep Dive Analysis</h3>
            </div>

            <Tabs defaultValue={agentAnalyses[0]?.agent} className="w-full overflow-hidden">
              <div className="overflow-x-auto -mx-1 px-1 pb-2">
                <TabsList className="inline-flex w-auto min-w-full sm:w-full justify-start h-auto p-1 bg-muted/50 rounded-xl print:hidden">
                  {agentAnalyses.map((analysis) => (
                    <TabsTrigger
                      key={analysis.agent}
                      value={analysis.agent}
                      className="rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <span className="capitalize">{analysis.agent.replace('_', ' ')}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {agentAnalyses.map((analysis) => (
                <TabsContent key={analysis.agent} value={analysis.agent} className="mt-4 sm:mt-6 w-full overflow-hidden">
                  <div className="glass-card p-3 sm:p-8 space-y-4 sm:space-y-6 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-base sm:text-lg font-semibold capitalize flex items-center gap-2">
                        {analysis.agent.replace('_', ' ')} Report
                      </h4>
                      <Badge variant="outline" className="capitalize text-xs w-fit">
                        {analysis.agent} Agent
                      </Badge>
                    </div>

                    <div className="overflow-hidden">
                      <div className="prose prose-sm dark:prose-invert max-w-none w-full
                        prose-p:text-sm prose-p:leading-relaxed
                        prose-li:text-sm
                        prose-headings:text-base
                        break-words overflow-wrap-anywhere
                        [&_*]:max-w-full [&_img]:max-w-full [&_pre]:whitespace-pre-wrap [&_pre]:break-all [&_pre]:overflow-x-auto [&_pre]:text-xs [&_code]:text-xs [&_code]:break-all">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {analysis.findings.analysis || "No detailed analysis provided."}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Dynamic Findings Rendering based on Agent Type */}
                    {analysis.findings.findings && (
                      <div className="grid grid-cols-1 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t overflow-hidden">
                        {Object.entries(analysis.findings.findings).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-muted/30 rounded-lg p-3 sm:p-4 overflow-hidden">
                            <h5 className="font-medium text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
                              {key.replace(/_/g, ' ')}
                            </h5>
                            {Array.isArray(value) ? (
                              <ul className="space-y-2">
                                {value.map((item: any, idx: number) => {
                                  // Handle Claim Objects (Disputed/Verified Claims)
                                  if (typeof item === 'object' && item !== null && (item.claim || item.statement)) {
                                    return (
                                      <li key={idx} className="text-xs sm:text-sm bg-background/50 p-2.5 sm:p-3 rounded-md border border-border/50 overflow-hidden">
                                        <div className="flex gap-2 items-start min-w-0">
                                          <div className="mt-0.5 shrink-0">
                                            {key.includes('verified') ? (
                                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                                            ) : key.includes('disputed') ? (
                                              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                                            ) : (
                                              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                                            )}
                                          </div>
                                          <div className="space-y-1.5 flex-1 min-w-0 overflow-hidden">
                                            <p className="font-medium text-foreground text-xs sm:text-sm leading-snug break-words">
                                              {item.claim || item.statement}
                                            </p>
                                            {item.reason && (
                                              <p className="text-muted-foreground text-[10px] sm:text-xs break-words">
                                                <span className="font-semibold">Reason:</span> {item.reason}
                                              </p>
                                            )}
                                            <div className="flex flex-wrap gap-1">
                                              {item.source && (
                                                <Badge variant="secondary" className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1 sm:px-1.5">
                                                  Source: {item.source}
                                                </Badge>
                                              )}
                                              {item.verification_status && (
                                                <Badge variant={item.verification_status === 'verified' ? 'default' : 'destructive'} className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1 sm:px-1.5">
                                                  {item.verification_status}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    )
                                  }

                                  // Default List Item Rendering
                                  return (
                                    <li key={idx} className="text-xs sm:text-sm flex gap-2 items-start min-w-0">
                                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
                                      <span className="leading-relaxed break-words">
                                        {typeof item === 'string' ? item : JSON.stringify(item)}
                                      </span>
                                    </li>
                                  )
                                })}
                              </ul>
                            ) : typeof value === 'object' && value !== null ? (
                              <div className="grid gap-2 overflow-hidden">
                                {Object.entries(value).map(([k, v]: [string, any]) => (
                                  <div key={k} className="text-xs sm:text-sm overflow-hidden">
                                    <span className="font-medium text-foreground capitalize">{k.replace(/_/g, ' ')}: </span>
                                    <span className="text-muted-foreground break-words">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs sm:text-sm text-foreground leading-relaxed break-words">{String(value)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.section>
        </motion.div>
      </div>
    </ScrollArea>
  )
}

