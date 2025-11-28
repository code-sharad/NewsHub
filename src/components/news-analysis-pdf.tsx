import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a font that supports standard weights
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4TY17.ttf' },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4TY17.ttf', fontWeight: 'bold' }
  ]
});

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#333',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  meta: {
    fontSize: 10,
    color: '#888',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
    padding: 5,
  },
  text: {
    marginBottom: 8,
    textAlign: 'justify',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  timelineItem: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#3498db',
  },
  timelineDate: {
    fontSize: 10,
    color: '#3498db',
    fontWeight: 'bold',
  },
  timelineEvent: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  timelineSignificance: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  agentSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  agentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  findingItem: {
    marginBottom: 5,
    paddingLeft: 10,
  },
  bullet: {
    width: 3,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
    marginRight: 5,
    marginTop: 6,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
});

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

interface NewsAnalysisPDFProps {
  analysis: ArticleAnalysisResponse;
}

// Helper to strip markdown and clean text
const cleanText = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '')   // Remove italics
    .replace(/#/g, '')    // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
    .replace(/`/g, '');   // Remove code blocks
};

export const NewsAnalysisPDF = ({ analysis }: NewsAnalysisPDFProps) => {
  const { synthesizedReport, sharedContext, agentAnalyses = [], timestamp } = analysis;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Intelligence Report</Text>
          <Text style={styles.subtitle}>Comprehensive News Analysis</Text>
          <View style={styles.meta}>
            <Text>Generated: {timestamp ? new Date(timestamp).toLocaleDateString() : new Date().toLocaleDateString()}</Text>
            <Text>{agentAnalyses.length} Agents Consulted</Text>
          </View>
        </View>

        {/* Executive Summary */}
        {synthesizedReport && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.text}>{cleanText(synthesizedReport)}</Text>
          </View>
        )}

        {/* Key Topics & Stakeholders */}
        <View style={styles.section}>
          {sharedContext?.topics && sharedContext.topics.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Key Topics</Text>
              <View style={styles.badgeContainer}>
                {sharedContext.topics.map((topic, i) => (
                  <Text key={i} style={styles.badge}>{topic}</Text>
                ))}
              </View>
            </View>
          )}

          {sharedContext?.stakeholders && sharedContext.stakeholders.length > 0 && (
            <View>
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Key Stakeholders</Text>
              <View style={styles.badgeContainer}>
                {sharedContext.stakeholders.map((stakeholder, i) => (
                  <Text key={i} style={{ ...styles.badge, backgroundColor: '#e3f2fd', color: '#1565c0' }}>
                    {stakeholder}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Timeline */}
        {sharedContext?.timeline && sharedContext.timeline.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chronological Context</Text>
            {sharedContext.timeline.map((event, i) => (
              <View key={i} style={styles.timelineItem}>
                <Text style={styles.timelineDate}>{event.date}</Text>
                <Text style={styles.timelineEvent}>{event.event}</Text>
                {event.significance && (
                  <Text style={styles.timelineSignificance}>{event.significance}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Agent Findings - Page Break if needed */}
        <View break>
          <Text style={styles.sectionTitle}>Deep Dive Analysis</Text>
          {agentAnalyses.map((agent, i) => (
            <View key={i} style={styles.agentSection}>
              <Text style={styles.agentTitle}>{agent.agent.replace('_', ' ')} Agent</Text>

              {/* Main Analysis Text */}
              {agent.findings.analysis && (
                <Text style={styles.text}>{cleanText(agent.findings.analysis)}</Text>
              )}

              {/* Structured Findings */}
              {agent.findings.findings && (
                <View style={{ marginTop: 5 }}>
                  {Object.entries(agent.findings.findings).map(([key, value]: [string, any]) => (
                    <View key={key} style={{ marginBottom: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: 3 }}>
                        {key.replace(/_/g, ' ')}
                      </Text>

                      {Array.isArray(value) ? (
                        value.map((item: any, idx: number) => {
                          const text = typeof item === 'object'
                            ? (item.claim || item.statement || JSON.stringify(item))
                            : item;

                          return (
                            <View key={idx} style={styles.listItem}>
                              <View style={styles.bullet} />
                              <Text style={{ flex: 1, fontSize: 10 }}>{cleanText(String(text))}</Text>
                            </View>
                          );
                        })
                      ) : (
                        <Text style={{ fontSize: 10 }}>{String(value)}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};
