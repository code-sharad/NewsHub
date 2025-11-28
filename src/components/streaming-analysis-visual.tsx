'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  History,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Sparkles,
  CheckCircle2,
  Loader2,
  Brain,
  Search,
  FileText,
  ArrowDown,
  Lightbulb
} from 'lucide-react'
import { StreamingAnalysisState } from '@/hooks/use-streaming-analysis'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StreamingAnalysisVisualProps {
  state: StreamingAnalysisState
  onCancel?: () => void
}

const agentConfig: Record<string, {
  icon: React.ElementType
  label: string
  description: string
  color: string
  bgColor: string
}> = {
  historical: {
    icon: History,
    label: 'Historian',
    description: 'Analyzing precedents',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  stakeholder: {
    icon: Users,
    label: 'Sociologist',
    description: 'Mapping stakeholders',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  timeline: {
    icon: Calendar,
    label: 'Chronologist',
    description: 'Building timeline',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  impact: {
    icon: TrendingUp,
    label: 'Economist',
    description: 'Projecting impacts',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  fact_verifier: {
    icon: Shield,
    label: 'Fact Checker',
    description: 'Verifying claims',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
}

interface LogItem {
  id: string
  timestamp: Date
  agent?: string
  message: string
  type: 'info' | 'success' | 'finding' | 'phase'
  detail?: string
  data?: any
}

export function StreamingAnalysisVisual({ state, onCancel }: StreamingAnalysisVisualProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [logs, setLogs] = useState<LogItem[]>([])
  const processedAgents = useRef<Set<string>>(new Set())

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  // Generate rich logs based on state changes
  useEffect(() => {
    const newLogs: LogItem[] = []
    const now = new Date()

    // Phase changes
    if (state.currentPhase > 0 && !logs.some(l => l.message.includes(`Phase ${state.currentPhase}`))) {
       const phaseName = state.currentPhase === 1 ? 'Discovery & Context' : state.currentPhase === 2 ? 'Deep Analysis' : 'Synthesis';
       newLogs.push({
         id: `phase-${state.currentPhase}`,
         timestamp: now,
         message: `Entering Phase ${state.currentPhase}: ${phaseName}`,
         type: 'phase'
       })
    }

    // Check agent status changes
    Object.entries(state.agents).forEach(([agentKey, status]) => {
      const config = agentConfig[agentKey]
      if (!config) return

      // Started
      if (status.status === 'running' && !logs.some(l => l.id === `start-${agentKey}`)) {
        newLogs.push({
          id: `start-${agentKey}`,
          timestamp: now,
          agent: agentKey,
          message: `${config.label} is analyzing...`,
          type: 'info',
          detail: config.description
        })
      }

      // Completed with findings
      if (status.status === 'complete' && !processedAgents.current.has(agentKey)) {
        processedAgents.current.add(agentKey)

        let insight = ''
        let data = null

        if (status.result) {
            // Extract rich data based on agent type
            if (agentKey === 'timeline' && status.result.timeline) {
                insight = `Identified ${status.result.timeline.length} key events.`
                data = { type: 'timeline', items: status.result.timeline }
            } else if (agentKey === 'stakeholder' && status.result.stakeholders) {
                insight = `Identified ${status.result.stakeholders.length} key stakeholders.`
                data = { type: 'stakeholders', items: status.result.stakeholders }
            } else if (agentKey === 'historical' && status.result.topics) {
                insight = `Found ${status.result.topics.length} historical topics.`
                data = { type: 'topics', items: status.result.topics }
            } else if (agentKey === 'impact' && status.result.findings) {
                insight = "Impact analysis complete."
                data = { type: 'impact', findings: status.result.findings }
            } else if (agentKey === 'fact_verifier') {
                if (status.result.findings?.verified_claims?.length) {
                    insight = `Verified ${status.result.findings.verified_claims.length} claims.`
                    data = { type: 'verification', claims: status.result.findings.verified_claims }
                } else if (status.result.analysis) {
                    insight = "Fact verification complete."
                    data = { type: 'verification', analysis: status.result.analysis }
                }
            }
        }

        newLogs.push({
          id: `complete-${agentKey}`,
          timestamp: now,
          agent: agentKey,
          message: `${config.label} finished analysis`,
          type: 'success',
          detail: insight || 'Analysis data secured.',
          data: data
        })
      }
    })

    if (state.synthesisStatus === 'running' && !logs.some(l => l.id === 'synthesis-start')) {
      newLogs.push({
        id: 'synthesis-start',
        timestamp: now,
        message: 'Synthesizing final intelligence report...',
        type: 'info'
      })
    }

    if (newLogs.length > 0) {
      setLogs(prev => [...prev, ...newLogs])
    }
  }, [state.agents, state.synthesisStatus, state.currentPhase])

  const renderLogData = (data: any) => {
    if (!data) return null

    switch (data.type) {
        case 'timeline':
            if (!Array.isArray(data.items)) return null;
            return (
                <div className="mt-3 space-y-2">
                    {data.items.slice(0, 3).map((event: any, i: number) => (
                        <div key={i} className="flex gap-2 text-xs p-2 rounded-lg bg-muted/50 border border-border/50">
                            <Calendar className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                            <div>
                                <span className="font-mono text-primary/80 mr-1">{event.date}:</span>
                                <span className="text-muted-foreground">{event.event}</span>
                            </div>
                        </div>
                    ))}
                    {data.items.length > 3 && (
                        <div className="text-xs text-muted-foreground italic pl-1">
                            + {data.items.length - 3} more events...
                        </div>
                    )}
                </div>
            )
        case 'stakeholders':
            if (!Array.isArray(data.items)) return null;
            return (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {data.items.map((s: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900">
                            {s}
                        </Badge>
                    ))}
                </div>
            )
        case 'topics':
            if (!Array.isArray(data.items)) return null;
            return (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {data.items.map((t: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5 border-amber-500/30 text-amber-600 dark:text-amber-400">
                            {t}
                        </Badge>
                    ))}
                </div>
            )
        case 'impact':
            const impactText = typeof data.findings?.immediate_impacts === 'string'
                ? data.findings.immediate_impacts
                : 'Impact analysis available.';
            return (
                <div className="mt-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 text-xs text-muted-foreground italic">
                    "{impactText.slice(0, 150)}..."
                </div>
            )
        case 'verification':
            if (Array.isArray(data.claims)) {
                return (
                    <div className="mt-3 space-y-2">
                        {data.claims.slice(0, 3).map((claim: any, i: number) => (
                            <div key={i} className="flex gap-2 text-xs p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                                <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-foreground font-medium">{claim.claim}</p>
                                    <p className="text-[10px] text-muted-foreground">Source: {claim.source}</p>
                                </div>
                            </div>
                        ))}
                        {data.claims.length > 3 && (
                            <div className="text-xs text-muted-foreground italic pl-1">
                                + {data.claims.length - 3} more verified claims...
                            </div>
                        )}
                    </div>
                )
            }
            const analysisText = typeof data.analysis === 'string' ? data.analysis : 'Verification complete.';
            return (
                <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 mb-1 text-red-600 dark:text-red-400 font-medium">
                        <Shield className="w-3 h-3" />
                        Verification Note
                    </div>
                    {analysisText.slice(0, 150)}...
                </div>
            )
        default:
            return null
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Neural Analysis</span>
        </motion.div>
        <h2 className="text-3xl font-bold tracking-tight">Processing Intelligence</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Orchestrating multi-agent analysis to extract deep insights, verify facts, and map historical context.
        </p>
      </div>

      {/* 1. The Council Visualizer (Top) */}
      <Card className="p-8 overflow-hidden relative bg-gradient-to-b from-background to-muted/20 border-border/50 shadow-xl">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 h-[300px] flex items-center justify-center">
            {/* Center Core */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(var(--primary), 0.1)",
                  "0 0 60px rgba(var(--primary), 0.3)",
                  "0 0 20px rgba(var(--primary), 0.1)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute w-32 h-32 rounded-full bg-background border-4 border-muted flex items-center justify-center z-20 shadow-2xl"
            >
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold tabular-nums">{state.progress}%</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Complete</div>
              </div>
            </motion.div>

            {/* Orbiting Agents */}
            {Object.entries(agentConfig).map(([key, config], index) => {
              const status = state.agents[key]
              const isActive = status.status === 'running'
              const isComplete = status.status === 'complete'
              const angle = (index * (360 / Object.keys(agentConfig).length)) * (Math.PI / 180) - (Math.PI / 2) // Start from top
              const radius = 120

              return (
                <motion.div
                  key={key}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                    top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                    x: "-50%",
                    y: "-50%"
                  }}
                >
                  <div className="relative flex flex-col items-center gap-2">
                     {/* Connection Line to Center */}
                     <motion.div
                        className="absolute top-1/2 left-1/2 -z-10 h-[1px] bg-border origin-left"
                        style={{
                            width: radius,
                            rotate: `${angle * (180/Math.PI) + 180}deg`
                        }}
                     >
                        {isActive && (
                            <motion.div
                                className="h-full bg-primary w-1/2"
                                animate={{ x: [0, radius] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                     </motion.div>

                    <motion.div
                      animate={{
                        scale: isActive ? [1, 1.15, 1] : 1,
                        borderColor: isActive ? "var(--primary)" : isComplete ? "var(--green-500)" : "transparent"
                      }}
                      transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg bg-card",
                        isActive ? "border-primary shadow-primary/20" :
                        isComplete ? "border-green-500/50" : "border-muted"
                      )}
                    >
                      <config.icon className={cn(
                        "w-6 h-6 transition-colors duration-300",
                        isActive ? config.color : isComplete ? "text-green-500" : "text-muted-foreground"
                      )} />
                    </motion.div>

                    <div className="text-center">
                        <p className={cn("text-xs font-semibold transition-colors", isActive ? "text-foreground" : "text-muted-foreground")}>
                            {config.label}
                        </p>
                        {isActive && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1 mt-1">
                                Active
                            </Badge>
                        )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
        </div>
      </Card>

      {/* 2. Chain of Thought Feed (Bottom) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Chain of Thought
            </h3>
            <Badge variant="outline" className="font-mono text-xs">
                {state.phaseName || 'Initializing...'}
            </Badge>
        </div>

        <div
            ref={scrollRef}
            className="relative pl-8 pr-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent space-y-8"
        >
            {/* Vertical Timeline Line */}
            <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-gradient-to-b from-border via-border to-transparent" />

            <AnimatePresence mode="popLayout">
                {logs.map((log, i) => {
                    const isLast = i === logs.length - 1
                    const config = log.agent ? agentConfig[log.agent] : null

                    return (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative"
                        >
                            {/* Timeline Dot */}
                            <div className={cn(
                                "absolute -left-[29px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-background z-10 transition-colors duration-300",
                                isLast && state.isStreaming ? "border-primary animate-pulse" :
                                log.type === 'success' ? "border-green-500" : "border-muted-foreground"
                            )}>
                                {log.type === 'success' ? (
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                ) : log.type === 'phase' ? (
                                    <ArrowDown className="w-3 h-3 text-foreground" />
                                ) : (
                                    <div className={cn("w-2 h-2 rounded-full", isLast ? "bg-primary" : "bg-muted-foreground")} />
                                )}
                            </div>

                            {/* Content Card */}
                            <div className={cn(
                                "rounded-xl p-4 border transition-all duration-300",
                                isLast && state.isStreaming ? "bg-card border-primary/50 shadow-lg shadow-primary/5" : "bg-card/50 border-border"
                            )}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1 w-full">
                                        <div className="flex items-center gap-2">
                                            {config && (
                                                <config.icon className={cn("w-4 h-4", config.color)} />
                                            )}
                                            <span className={cn("font-semibold text-sm", config ? config.color : "text-foreground")}>
                                                {log.message}
                                            </span>
                                        </div>

                                        {log.detail && (
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {log.detail}
                                            </p>
                                        )}

                                        {/* Render Rich Data */}
                                        {log.data && renderLogData(log.data)}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                                        {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>

                                {/* Thinking Animation for active item */}
                                {isLast && state.isStreaming && log.type !== 'success' && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {state.isStreaming && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative py-4"
                >
                    <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary/20 animate-ping" />
                </motion.div>
            )}
        </div>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onCancel}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-destructive/10"
          >
            Cancel Analysis
          </button>
        </div>
      )}
    </div>
  )
}
