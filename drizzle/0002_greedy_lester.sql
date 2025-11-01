CREATE TABLE "ArticleAnalysis" (
	"id" text PRIMARY KEY NOT NULL,
	"articleUrl" text NOT NULL,
	"analysisData" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ArticleAnalysis_articleUrl_unique" UNIQUE("articleUrl")
);
