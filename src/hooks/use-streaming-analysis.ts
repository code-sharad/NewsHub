"use client";

import { useState, useCallback, useRef } from "react";

export interface AgentStatus {
  agent: string;
  phase: number;
  status: "waiting" | "running" | "complete" | "error";
  result?: any;
  error?: string;
}

export interface StreamingAnalysisState {
  isStreaming: boolean;
  currentPhase: number;
  phaseName: string;
  agents: Record<string, AgentStatus>;
  sharedContext: {
    topics: string[];
    stakeholders: string[];
    timeline: any[];
  };
  synthesisStatus: "waiting" | "running" | "complete";
  finalResponse: any | null;
  error: string | null;
  progress: number; // 0-100
}

const initialState: StreamingAnalysisState = {
  isStreaming: false,
  currentPhase: 0,
  phaseName: "",
  agents: {
    historical: { agent: "historical", phase: 1, status: "waiting" },
    stakeholder: { agent: "stakeholder", phase: 1, status: "waiting" },
    timeline: { agent: "timeline", phase: 1, status: "waiting" },
    impact: { agent: "impact", phase: 2, status: "waiting" },
    fact_verifier: { agent: "fact_verifier", phase: 2, status: "waiting" },
  },
  sharedContext: {
    topics: [],
    stakeholders: [],
    timeline: [],
  },
  synthesisStatus: "waiting",
  finalResponse: null,
  error: null,
  progress: 0,
};

export function useStreamingAnalysis(
  apiUrl: string = "https://sharad31-news-agent.hf.space"
) {
  const [state, setState] = useState<StreamingAnalysisState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const calculateProgress = (
    agents: Record<string, AgentStatus>,
    synthesisStatus: string
  ): number => {
    const agentList = Object.values(agents);
    const completedAgents = agentList.filter(
      (a) => a.status === "complete" || a.status === "error"
    ).length;
    const totalAgents = agentList.length;

    // Agents are 80% of progress, synthesis is 20%
    const agentProgress = (completedAgents / totalAgents) * 80;
    const synthesisProgress =
      synthesisStatus === "complete"
        ? 20
        : synthesisStatus === "running"
        ? 10
        : 0;

    return Math.round(agentProgress + synthesisProgress);
  };

  const analyzeWithStreaming = useCallback(
    async (articleData: {
      headline: string;
      summary: string;
      source: string;
      date: string;
      url: string;
      content: string;
    }) => {
      // Reset state
      setState({ ...initialState, isStreaming: true });

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NEWS_AGENT_URL}/api/analyze-news/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(articleData),
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete events (SSE format: "data: {...}\n\n")
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const eventData = JSON.parse(line.slice(6));

                setState((prev) => {
                  const newState = { ...prev };

                  switch (eventData.type) {
                    case "phase":
                      newState.currentPhase = eventData.phase;
                      newState.phaseName = eventData.name;
                      break;

                    case "agent":
                      newState.agents = {
                        ...prev.agents,
                        [eventData.agent]: {
                          agent: eventData.agent,
                          phase: eventData.phase,
                          status: eventData.status,
                          result: eventData.result,
                          error: eventData.error,
                        },
                      };
                      break;

                    case "context":
                      newState.sharedContext = {
                        topics: eventData.topics || [],
                        stakeholders: eventData.stakeholders || [],
                        timeline: eventData.timeline || [],
                      };
                      break;

                    case "synthesis":
                      newState.synthesisStatus = eventData.status;
                      break;

                    case "complete":
                      newState.finalResponse = eventData.response;
                      newState.isStreaming = false;
                      newState.synthesisStatus = "complete";
                      break;

                    case "error":
                      newState.error = eventData.error;
                      newState.isStreaming = false;
                      break;

                    case "ready_for_synthesis":
                      // Synthesis about to start
                      break;
                  }

                  // Update progress
                  newState.progress = calculateProgress(
                    newState.agents,
                    newState.synthesisStatus
                  );

                  return newState;
                });
              } catch (e) {
                console.error("Failed to parse SSE event:", e, line);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Analysis cancelled");
        } else {
          setState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : "Unknown error",
            isStreaming: false,
          }));
        }
      }
    },
    [apiUrl]
  );

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState((prev) => ({ ...prev, isStreaming: false }));
    }
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    analyzeWithStreaming,
    cancelAnalysis,
    reset,
  };
}
