"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  BookmarkIcon,
  Share2,
  ExternalLink,
  Clock,
  User,
  MessageSquare,
  Heart,
  Eye,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { ResizablePanel } from "@/components/ui/resizable-panel";
import { ArticleAnalysisDisplay } from "@/components/article-analysis";
import { StreamingAnalysisVisual } from "@/components/streaming-analysis-visual";
import { useStreamingAnalysis } from "@/hooks/use-streaming-analysis";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ArticleContent {
  title?: string;
  content?: string;
  author?: string;
  publishedDate?: string;
  summary?: string;
  image?: string;
  tags?: string[];
  error?: string;
}

function ArticlePageContent() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [useStreaming, setUseStreaming] = useState(true); // Toggle for streaming vs non-streaming
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Streaming analysis hook
  const streaming = useStreamingAnalysis(
    "https://sharad31-news-agent.hf.space"
  );

  const articleUrl = searchParams.get("url");
  const originalTitle = searchParams.get("title");
  const originalPublisher = searchParams.get("publisher");
  const originalImage = searchParams.get("image");
  const originalDate = searchParams.get("date");
  const originalSource = searchParams.get("source");

  useEffect(() => {
    const fetchArticleContent = async () => {
      if (!articleUrl) return;

      try {
        setLoading(true);
        const response = await fetch("/api/article-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: articleUrl }),
        });

        const data = await response.json();

        if (response.ok) {
          setArticle(data);
        } else {
          throw new Error(data.error || "Failed to fetch article");
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        toast({
          title: "Error",
          description: "Failed to load article content. Please try again.",
          variant: "destructive",
        });
        // Use fallback data from URL params
        setArticle({
          title: originalTitle || "Article Title",
          content:
            "Unable to load full article content. Please visit the original source.",
          author: originalPublisher || "Unknown",
          publishedDate: originalDate || new Date().toISOString(),
          image: originalImage || undefined,
        });
      } finally {
        setLoading(false);
      }
    };

    if (!articleUrl) {
      router.push("/");
      return;
    }

    fetchArticleContent();
  }, [
    articleUrl,
    router,
    originalTitle,
    originalPublisher,
    originalDate,
    originalImage,
    toast,
  ]);

  const handleBookmark = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark articles.",
        variant: "destructive",
      });
      return;
    }

    if (!articleUrl || !article?.title) return;

    setBookmarking(true);

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleUrl,
          title: article.title,
          description: article.summary || article.title,
          imageUrl: article.image || originalImage,
          publisher: article.author || originalPublisher,
          tags: [originalSource],
        }),
      });

      if (response.ok) {
        setBookmarked(true);
        toast({
          title: "Bookmarked!",
          description: "Article saved to your bookmarks.",
        });
      } else {
        const error = await response.json();
        if (response.status === 409) {
          setBookmarked(true);
          toast({
            title: "Already bookmarked",
            description: "This article is already in your bookmarks.",
          });
        } else {
          throw new Error(error.error || "Failed to bookmark article");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bookmark article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookmarking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && articleUrl) {
      try {
        await navigator.share({
          title: article?.title || originalTitle || undefined,
          text: article?.summary,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Article link copied to clipboard.",
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Article link copied to clipboard.",
      });
    }
  };

  const handleAnalyzeArticle = async () => {
    if (!articleUrl) return;

    setShowAnalysis(true);
    setAnalysisError(null);

    // Helper function to strip HTML tags from content
    const stripHtml = (html: string) => {
      if (!html) return "";
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };

    // Helper function to format date to DD-MM-YYYY format
    const formatDate = (dateString: string) => {
      if (!dateString)
        return new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
      try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      } catch {
        return dateString;
      }
    };

    try {
      // First, check if analysis exists in database (POST route - NO LLM CALL)
      const checkResponse = await fetch("/api/article-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: articleUrl }),
      });

      if (checkResponse.ok) {
        // Analysis found in database - use cached version
        const cachedData = await checkResponse.json();
        setAnalysis(cachedData.analysis);
        toast({
          title: "Analysis loaded",
          description:
            "Using cached analysis from database (no LLM call needed).",
        });
        return;
      }

      // Analysis not found in database - use streaming API
      if (checkResponse.status === 404) {
        const articleData = {
          headline: article?.title || originalTitle || "",
          summary: article?.summary || "",
          source: originalSource || "",
          date: formatDate(article?.publishedDate || originalDate || ""),
          url: articleUrl,
          content: stripHtml(article?.content || ""),
        };

        if (useStreaming) {
          // Use streaming analysis
          streaming.reset();
          await streaming.analyzeWithStreaming(articleData);

          // After streaming completes, save to database if we have a response
          if (streaming.finalResponse) {
            setAnalysis(streaming.finalResponse);

            // Save to database
            const saveResponse = await fetch("/api/article-analysis", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                articleData: streaming.finalResponse,
                url: articleUrl,
              }),
            });

            if (saveResponse.ok) {
              toast({
                title: "Analysis complete",
                description: "Article analyzed and saved to database.",
              });
            }
          }
        } else {
          // Use non-streaming API (fallback)
          setAnalysisLoading(true);
          const llmResponse = await fetch(
            `https://sharad31-news-agent.hf.space/api/analyze-news`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(articleData),
            }
          );

          const llmData = await llmResponse.json();

          if (llmResponse.ok) {
            setAnalysis(llmData);

            // Save to database
            await fetch("/api/article-analysis", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ articleData: llmData, url: articleUrl }),
            });

            toast({
              title: "Analysis complete",
              description: "Article analyzed and saved to database.",
            });
          } else {
            throw new Error(llmData.error || "Failed to analyze article");
          }
          setAnalysisLoading(false);
        }
      } else {
        throw new Error("Failed to check database for existing analysis");
      }
    } catch (error) {
      console.error("Error analyzing article:", error);
      setAnalysisError(
        error instanceof Error ? error.message : "Failed to analyze article"
      );
      setAnalysisLoading(false);
      toast({
        title: "Error",
        description: "Failed to analyze article. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Watch for streaming completion and save to database
  useEffect(() => {
    if (streaming.finalResponse && !analysis) {
      setAnalysis(streaming.finalResponse);

      // Save to database
      if (articleUrl) {
        fetch("/api/article-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleData: streaming.finalResponse,
            url: articleUrl,
          }),
        }).then((response) => {
          if (response.ok) {
            toast({
              title: "Analysis complete",
              description: "Article analyzed and saved to database.",
            });
          }
        });
      }
    }
  }, [streaming.finalResponse, analysis, articleUrl, toast]);

  if (loading) {
    return <ArticleSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Floating Analysis Button */}
      {!showAnalysis && articleUrl && (
        <div className="fixed bottom-8 right-8 z-50 group">
          <Button
            onClick={handleAnalyzeArticle}
            className="h-14 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200
                        bg-primary text-primary-foreground
                        hover:scale-105 transform"
            aria-label="Analyze Article with AI"
          >
            <Brain className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
            <span className="text-sm font-medium ml-2">AI Analysis</span>
          </Button>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      )}

      {/* Analysis Sidebar / Bottom Sheet */}
      {showAnalysis && (
        isDesktop ? (
          <ResizablePanel
            title="Article Analysis"
            onClose={() => {
              setShowAnalysis(false);
              setAnalysis(null);
              setAnalysisError(null);
              streaming.reset();
              streaming.cancelAnalysis();
            }}
            defaultWidth={60}
            minWidth={40}
            maxWidth={85}
          >
            {/* Show streaming progress while analyzing */}
            {streaming.isStreaming ||
            (streaming.progress > 0 && streaming.progress < 100 && !analysis) ? (
              <StreamingAnalysisVisual
                state={streaming}
                onCancel={() => {
                  streaming.cancelAnalysis();
                  setShowAnalysis(false);
                }}
              />
            ) : (
              <ArticleAnalysisDisplay
                analysis={analysis || streaming.finalResponse}
                loading={analysisLoading}
                error={analysisError || streaming.error}
              />
            )}
          </ResizablePanel>
        ) : (
          <Sheet open={showAnalysis} onOpenChange={(open) => {
            if (!open) {
              setShowAnalysis(false);
              setAnalysis(null);
              setAnalysisError(null);
              streaming.reset();
              streaming.cancelAnalysis();
            }
          }}>
            <SheetContent side="bottom" className="h-[90vh] sm:max-w-none rounded-t-xl p-0 overflow-x-hidden">
              <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle>Article Analysis</SheetTitle>
                <SheetDescription className="sr-only">
                  AI-powered analysis of the article
                </SheetDescription>
              </SheetHeader>
              <div className="h-full overflow-y-auto pb-20">
                 {/* Show streaming progress while analyzing */}
                {streaming.isStreaming ||
                (streaming.progress > 0 && streaming.progress < 100 && !analysis) ? (
                  <StreamingAnalysisVisual
                    state={streaming}
                    onCancel={() => {
                      streaming.cancelAnalysis();
                      setShowAnalysis(false);
                    }}
                  />
                ) : (
                  <ArticleAnalysisDisplay
                    analysis={analysis || streaming.finalResponse}
                    loading={analysisLoading}
                    error={analysisError || streaming.error}
                  />
                )}
              </div>
            </SheetContent>
          </Sheet>
        )
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="group -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={bookmarking}
              className={cn(
                "transition-colors",
                bookmarked
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookmarkIcon
                className={cn("w-4 h-4 mr-2", bookmarked && "fill-current")}
              />
              {bookmarking ? "Saving..." : bookmarked ? "Saved" : "Save"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <a
                href={articleUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Original
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16 font-serif">
        <article className="space-y-8">
          {/* Article Header */}
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground font-sans">
              {originalSource && (
                <Badge
                  variant="secondary"
                  className="capitalize px-3 py-1 rounded-full font-medium"
                >
                  {originalSource.replace(/([A-Z])/g, " $1").trim()}
                </Badge>
              )}
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1.5" />
                {article?.publishedDate || originalDate
                  ? formatDistanceToNow(
                      new Date(article?.publishedDate || originalDate!),
                      { addSuffix: true }
                    )
                  : "Recently"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
              {article?.title || originalTitle || "Article Title"}
            </h1>

            {article?.summary && (
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {article.summary}
              </p>
            )}

            {article?.author && (
              <div className="flex items-center justify-center text-sm font-medium text-foreground pt-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mr-3 text-primary">
                  <User className="w-4 h-4" />
                </div>
                {article.author}
              </div>
            )}
          </div>

          {/* Article Image */}
          {(article?.image || originalImage) && (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl my-12 ring-1 ring-border/10">
              <Image
                src={article?.image || originalImage!}
                alt={article?.title || originalTitle || "Article image"}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                priority
              />
            </div>
          )}

          <Separator className="max-w-xs mx-auto opacity-50" />

          {/* Article Body */}
          <div className="prose prose-zinc dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
            {article?.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: article.content }}
                className="leading-relaxed"
              />
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border/50">
                <p className="text-muted-foreground mb-4">
                  Content could not be loaded directly.
                </p>
                <Button
                  variant="default"
                  size="lg"
                  asChild
                  className="rounded-full shadow-lg shadow-primary/20"
                >
                  <a
                    href={articleUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read on {originalSource || "Original Site"}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Article Footer Actions */}
          <div className="mt-16 pt-8 border-t border-border/50 font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Like
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Discuss
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <Eye className="w-4 h-4 inline mr-1.5" />
                Reading
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

import { ArticleSkeleton } from "@/components/ui/loading-screen";

export default function ArticlePage() {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticlePageContent />
    </Suspense>
  );
}
