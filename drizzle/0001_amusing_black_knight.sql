ALTER TABLE "Session" DROP CONSTRAINT "Session_sessionToken_unique";--> statement-breakpoint
ALTER TABLE "Session" ADD PRIMARY KEY ("sessionToken");--> statement-breakpoint
ALTER TABLE "Session" DROP COLUMN "id";