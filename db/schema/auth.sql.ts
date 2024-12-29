import { InferSelectModel, relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { timeStams } from './utils.sql';

export const userTable = pgTable('user', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    name: text('name'),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    emailVerifiedAt: timestamp('email_verified_at', {
        withTimezone: true,
        mode: 'date',
    }),
    ...timeStams,
});

export const userRelations = relations(userTable, ({ many }) => ({
    sessions: many(sessionTable),
    otps: many(otpTable),
}));

export const sessionTable = pgTable('session', {
    id: text('id').primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => userTable.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', {
        withTimezone: true,
        mode: 'date',
    }).notNull(),
    ...timeStams,
});

export const sessionRelations = relations(sessionTable, ({ one }) => ({
    user: one(userTable, {
        fields: [sessionTable.userId],
        references: [userTable.id],
    }),
}));

export const otpTable = pgTable('otp', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => userTable.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', {
        withTimezone: true,
        mode: 'date',
    }).notNull(),
    otpType: text('otp_type', {
        enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'],
    }).notNull(),
    otpHash: text('otp_hash').notNull(),
    isUsed: boolean('is_used').default(false).notNull(),
    ...timeStams,
});

export const otpRelations = relations(otpTable, ({ one }) => ({
    user: one(userTable, {
        fields: [otpTable.userId],
        references: [userTable.id],
    }),
}));

export type UserType = InferSelectModel<typeof userTable>;
export type SessionType = InferSelectModel<typeof sessionTable>;
export type OtpType = InferSelectModel<typeof otpTable>;
