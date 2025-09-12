import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  unique,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'

// Helper function for CUID generation
const cuidPrimaryKey = () => text('id').primaryKey().$defaultFn(() => createId())

// Account table (for NextAuth)
export const accounts = pgTable(
  'Account',
  {
    id: cuidPrimaryKey(),
    userId: text('userId').notNull(),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => ({
    providerProviderAccountIdKey: unique().on(table.provider, table.providerAccountId),
  })
)

// Session table (for NextAuth)
export const sessions = pgTable('Session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId').notNull(),
  expires: timestamp('expires').notNull(),
})

// User table
export const users = pgTable('User', {
  id: cuidPrimaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified'),
  image: text('image'),
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdateFn(() => new Date()),
})

// Verification Token table (for NextAuth)
export const verificationTokens = pgTable(
  'VerificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: timestamp('expires').notNull(),
  },
  (table) => ({
    identifierTokenKey: unique().on(table.identifier, table.token),
  })
)

// Bookmark table
export const bookmarks = pgTable(
  'Bookmark',
  {
    id: cuidPrimaryKey(),
    userId: text('userId').notNull(),
    articleUrl: text('articleUrl').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    imageUrl: text('imageUrl'),
    publisher: text('publisher'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    tags: text('tags'),
  },
  (table) => ({
    userIdArticleUrlKey: unique().on(table.userId, table.articleUrl),
  })
)

// Post table
export const posts = pgTable('Post', {
  id: cuidPrimaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  summary: text('summary'),
  authorId: text('authorId').notNull(),
  published: boolean('published').notNull().default(false),
  featured: boolean('featured').notNull().default(false),
  tags: text('tags'),
  postType: text('postType').notNull().default('discussion'),
  voteCount: integer('voteCount').notNull().default(0),
  viewCount: integer('viewCount').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdateFn(() => new Date()),
})

// Comment table
export const comments = pgTable('Comment', {
  id: cuidPrimaryKey(),
  content: text('content').notNull(),
  authorId: text('authorId').notNull(),
  postId: text('postId').notNull(),
  parentId: text('parentId'),
  voteCount: integer('voteCount').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdateFn(() => new Date()),
})

// Vote table
export const votes = pgTable(
  'Vote',
  {
    id: cuidPrimaryKey(),
    userId: text('userId').notNull(),
    postId: text('postId'),
    commentId: text('commentId'),
    type: text('type').notNull(), // 'up' or 'down'
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdPostIdKey: unique().on(table.userId, table.postId),
    userIdCommentIdKey: unique().on(table.userId, table.commentId),
  })
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  bookmarks: many(bookmarks),
  posts: many(posts),
  comments: many(comments),
  votes: many(votes),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  votes: many(votes),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'CommentReplies',
  }),
  replies: many(comments, {
    relationName: 'CommentReplies',
  }),
  votes: many(votes),
}))

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [votes.commentId],
    references: [comments.id],
  }),
}))

// Type exports for use in application
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type VerificationToken = typeof verificationTokens.$inferSelect
export type NewVerificationToken = typeof verificationTokens.$inferInsert
export type Bookmark = typeof bookmarks.$inferSelect
export type NewBookmark = typeof bookmarks.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type Vote = typeof votes.$inferSelect
export type NewVote = typeof votes.$inferInsert