import { NextRequest, NextResponse } from 'next/server'
import { db, articleAnalyses } from '@/lib/drizzle'
import { eq } from 'drizzle-orm'


export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const { articleData, url } = requestBody

    console.log('POST /api/article-analysis called with:', { url, hasArticleData: !!articleData })

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Article URL is required' },
        { status: 400 }
      )
    }

    // Check if analysis already exists in database
    const existingAnalysis = await db
      .select()
      .from(articleAnalyses)
      .where(eq(articleAnalyses.articleUrl, url))
      .limit(1)

    // If only checking for existing analysis (no articleData provided)
    if (!articleData) {
      if (existingAnalysis.length > 0) {
        // Return cached analysis from database - NO LLM CALL
        console.log('Analysis found in database for URL:', url)
        return NextResponse.json({
          analysis: existingAnalysis[0].analysisData,
          cached: true,
          exists: true,
        })
      }

      // Analysis not found in database
      console.log('Analysis not found in database for URL:', url)
      return NextResponse.json(
        { 
          error: 'Analysis not found in database',
          exists: false,
          message: 'Please call the LLM API to generate analysis'
        },
        { status: 404 }
      )
    }

    // If articleData is provided, save it to database
    if (existingAnalysis.length > 0) {
      // Update existing analysis
      await db.update(articleAnalyses)
        .set({
          analysisData: articleData,
          updatedAt: new Date(),
        })
        .where(eq(articleAnalyses.articleUrl, url))
      console.log('Analysis updated in database for URL:', url)
    } else {
      // Insert new analysis
      try {
        await db.insert(articleAnalyses).values({
          articleUrl: url,
          analysisData: articleData,
        })
        console.log('Analysis saved to database for URL:', url)
      } catch (dbError) {
        console.error('Error saving analysis to database:', dbError)
        return NextResponse.json(
          { error: 'Failed to save analysis to database', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      analysis: articleData,
      cached: false,
      saved: true,
    })
  } catch (error) {
    console.error('Error in article analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

