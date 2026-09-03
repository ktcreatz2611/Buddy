import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaceMembers } from './workspaces';
import { accounts, sessions } from './auth-tables';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  username: text('username').unique(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { withTimezone: true, mode: 'date' }),
  passwordHash: text('password_hash'),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  workspaceMembers: many(workspaceMembers),
  accounts: many(accounts),
  sessions: many(sessions),
}));
