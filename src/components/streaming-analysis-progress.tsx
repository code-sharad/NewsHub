"use client";

import { cn } from "@/lib/utils";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  AgentStatus,
  StreamingAnalysisState,
} from "@/hooks/use-streaming-analysis";

interface StreamingAnalysisProgressProps {
  state: StreamingAnalysisState;
  onCancel?: () => void;
}

const agentConfig: Record<
  string,
  {
    icon: React.ElementType;
    label: string;
    description: string;
  }
> = {
  historical: {
    icon: History,
    label: "Historical Context",
    description: "Finding historical precedents and patterns",
  },
  stakeholder: {
    icon: Users,
    label: "Stakeholder Analysis",
    description: "Identifying key players and their interests",
  },
  timeline: {
    icon: Calendar,
    label: "Timeline Builder",
    description: "Constructing event chronology",
  },
  impact: {
    icon: TrendingUp,
    label: "Impact Assessment",
    description: "Analyzing consequences and implications",
  },
  fact_verifier: {
    icon: Shield,
    label: "Fact Verification",
    description: "Checking claims and sources",
  },
};

function AgentStatusCard({
  agent,
  status,
}: {
  agent: string;
  status: AgentStatus;
}) {
  const config = agentConfig[agent];
  if (!config) return null;

  const Icon = config.icon;

  const statusIcon = {
    waiting: <Clock className="h-4 w-4 text-gray-400" />,
    running: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    complete: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
  }[status.status];

  const statusText = {
    waiting: "Waiting...",
    running: "Analyzing...",
    complete: "Complete",
    error: "Error",
  }[status.status];

  const statusColor = {
    waiting: "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900",
    running: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950",
    complete:
      "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950",
    error: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950",
  }[status.status];

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all duration-300",
        statusColor
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-2 rounded-lg",
            status.status === "running"
              ? "bg-blue-100 dark:bg-blue-900"
              : status.status === "complete"
              ? "bg-green-100 dark:bg-green-900"
              : status.status === "error"
              ? "bg-red-100 dark:bg-red-900"
              : "bg-gray-100 dark:bg-gray-800"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              status.status === "running"
                ? "text-blue-600 dark:text-blue-400"
                : status.status === "complete"
                ? "text-green-600 dark:text-green-400"
                : status.status === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {config.label}
            </span>
            {statusIcon}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {status.status === "complete" && status.result?.analysis
              ? status.result.analysis.slice(0, 60) + "..."
              : status.status === "error"
              ? status.error?.slice(0, 60)
              : config.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function StreamingAnalysisProgress({
  state,
  onCancel,
}: StreamingAnalysisProgressProps) {
  const phase1Agents = ["historical", "stakeholder", "timeline"];
  const phase2Agents = ["impact", "fact_verifier"];

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Analyzing Article
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Our AI agents are examining your article from multiple perspectives
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {state.progress}%
          </span>
        </div>
        <Progress value={state.progress} className="h-2" />
      </div>

      {/* Phase 1: Discovery */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              state.currentPhase >= 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500"
            )}
          >
            1
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Discovery Phase
          </span>
          {state.currentPhase > 1 && (
            <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
          )}
        </div>
        <div className="ml-8 grid gap-2">
          {phase1Agents.map((agent) => (
            <AgentStatusCard
              key={agent}
              agent={agent}
              status={state.agents[agent]}
            />
          ))}
        </div>
      </div>

      {/* Shared Context Preview */}
      {state.sharedContext.topics.length > 0 && (
        <div className="ml-8 p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <ChevronRight className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
              Shared Context Discovered
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {state.sharedContext.topics.slice(0, 5).map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
              >
                {topic}
              </span>
            ))}
            {state.sharedContext.topics.length > 5 && (
              <span className="text-xs text-purple-500">
                +{state.sharedContext.topics.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Phase 2: Analysis */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              state.currentPhase >= 2
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500"
            )}
          >
            2
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Analysis Phase
          </span>
          {state.synthesisStatus !== "waiting" && (
            <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
          )}
        </div>
        <div className="ml-8 grid gap-2">
          {phase2Agents.map((agent) => (
            <AgentStatusCard
              key={agent}
              agent={agent}
              status={state.agents[agent]}
            />
          ))}
        </div>
      </div>

      {/* Phase 3: Synthesis */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              state.synthesisStatus !== "waiting"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500"
            )}
          >
            3
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Report Synthesis
          </span>
          {state.synthesisStatus === "complete" && (
            <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
          )}
        </div>
        <div className="ml-8">
          <div
            className={cn(
              "rounded-lg border p-3 transition-all duration-300",
              state.synthesisStatus === "waiting"
                ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                : state.synthesisStatus === "running"
                ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950"
                : "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  state.synthesisStatus === "running"
                    ? "bg-blue-100 dark:bg-blue-900"
                    : state.synthesisStatus === "complete"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <Sparkles
                  className={cn(
                    "h-4 w-4",
                    state.synthesisStatus === "running"
                      ? "text-blue-600 dark:text-blue-400 animate-pulse"
                      : state.synthesisStatus === "complete"
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Generating Report
                  </span>
                  {state.synthesisStatus === "waiting" && (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  {state.synthesisStatus === "running" && (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  )}
                  {state.synthesisStatus === "complete" && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {state.synthesisStatus === "waiting"
                    ? "Waiting for agent analysis..."
                    : state.synthesisStatus === "running"
                    ? "Combining insights into comprehensive report..."
                    : "Report ready!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      {state.isStreaming && onCancel && (
        <div className="text-center pt-2">
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
          >
            Cancel Analysis
          </button>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Analysis Failed
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {state.error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
