import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
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
  Quote
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

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
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'AI-Intelligence-Report',
  })

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
    <ScrollArea className="h-full">
      <div ref={componentRef} className="print:p-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8 pb-12 px-4 sm:px-6 max-w-5xl mx-auto"
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
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => handlePrint()}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Report
              </Button>
            </div>
          </motion.div>

          <Separator className="my-8" />

          {/* Executive Summary (Synthesized Report) */}
          {synthesizedReport && (
            <motion.section variants={item} className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Quote className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold font-serif">Executive Summary</h3>
              </div>

              <div className="glass-card p-8 prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-serif prose-headings:font-semibold
                prose-p:leading-relaxed prose-p:text-muted-foreground
                prose-strong:text-foreground prose-strong:font-bold
                prose-li:text-muted-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {synthesizedReport}
                </ReactMarkdown>
              </div>
            </motion.section>
          )}

          {/* Key Insights Grid */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topics */}
            {sharedContext?.topics && sharedContext.topics.length > 0 && (
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="w-5 h-5" />
                  <h4 className="font-semibold">Key Topics</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sharedContext.topics.map((topic, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stakeholders */}
            {sharedContext?.stakeholders && sharedContext.stakeholders.length > 0 && (
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2 text-blue-500">
                  <Users className="w-5 h-5" />
                  <h4 className="font-semibold">Key Stakeholders</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sharedContext.stakeholders.map((stakeholder, i) => (
                    <Badge key={i} variant="outline" className="px-3 py-1.5 text-sm border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                      {stakeholder}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Timeline Section */}
          {sharedContext?.timeline && sharedContext.timeline.length > 0 && (
            <motion.section variants={item} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <History className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold font-serif">Chronological Context</h3>
              </div>

              <div className="glass-card p-8">
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {sharedContext.timeline.map((event, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                      </div>

                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-foreground">{event.event}</div>
                          <time className="font-mono text-xs text-muted-foreground">{event.date}</time>
                        </div>
                        {event.significance && (
                          <div className="text-sm text-muted-foreground">
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
          <motion.section variants={item} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold font-serif">Deep Dive Analysis</h3>
            </div>

            <Tabs defaultValue={agentAnalyses[0]?.agent} className="w-full">
              <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl overflow-x-auto print:hidden">
                {agentAnalyses.map((analysis) => (
                  <TabsTrigger
                    key={analysis.agent}
                    value={analysis.agent}
                    className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <span className="capitalize">{analysis.agent.replace('_', ' ')}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {agentAnalyses.map((analysis) => (
                <TabsContent key={analysis.agent} value={analysis.agent} className="mt-6">
                  <div className="glass-card p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold capitalize flex items-center gap-2">
                        {analysis.agent.replace('_', ' ')} Report
                      </h4>
                      <Badge variant="outline" className="capitalize">
                        {analysis.agent} Agent
                      </Badge>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {analysis.findings.analysis || "No detailed analysis provided."}
                      </ReactMarkdown>
                    </div>

                    {/* Dynamic Findings Rendering based on Agent Type */}
                    {analysis.findings.findings && (
                      <div className="grid gap-4 pt-4 border-t">
                        {Object.entries(analysis.findings.findings).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-muted/30 rounded-lg p-4">
                            <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-2">
                              {key.replace(/_/g, ' ')}
                            </h5>
                            {Array.isArray(value) ? (
                              <ul className="space-y-2">
                                {value.map((item: any, idx: number) => {
                                  // Handle Claim Objects (Disputed/Verified Claims)
                                  if (typeof item === 'object' && item !== null && (item.claim || item.statement)) {
                                    return (
                                      <li key={idx} className="text-sm bg-background/50 p-3 rounded-md border border-border/50">
                                        <div className="flex gap-2 items-start">
                                          <div className="mt-0.5">
                                            {key.includes('verified') ? (
                                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : key.includes('disputed') ? (
                                              <AlertCircle className="w-4 h-4 text-amber-500" />
                                            ) : (
                                              <ChevronRight className="w-4 h-4 text-primary" />
                                            )}
                                          </div>
                                          <div className="space-y-1.5 flex-1">
                                            <p className="font-medium text-foreground leading-snug">
                                              {item.claim || item.statement}
                                            </p>
                                            {item.reason && (
                                              <p className="text-muted-foreground text-xs">
                                                <span className="font-semibold">Reason:</span> {item.reason}
                                              </p>
                                            )}
                                            {item.source && (
                                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                                Source: {item.source}
                                              </Badge>
                                            )}
                                            {item.verification_status && (
                                              <Badge variant={item.verification_status === 'verified' ? 'default' : 'destructive'} className="text-[10px] h-5 px-1.5 ml-2">
                                                {item.verification_status}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </li>
                                    )
                                  }

                                  // Default List Item Rendering
                                  return (
                                    <li key={idx} className="text-sm flex gap-2 items-start">
                                      <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                      <span className="leading-relaxed">
                                        {typeof item === 'string' ? item : JSON.stringify(item)}
                                      </span>
                                    </li>
                                  )
                                })}
                              </ul>
                            ) : typeof value === 'object' && value !== null ? (
                              <div className="grid gap-2">
                                {Object.entries(value).map(([k, v]: [string, any]) => (
                                  <div key={k} className="text-sm">
                                    <span className="font-medium text-foreground capitalize">{k.replace(/_/g, ' ')}: </span>
                                    <span className="text-muted-foreground">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-foreground leading-relaxed">{String(value)}</p>
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
