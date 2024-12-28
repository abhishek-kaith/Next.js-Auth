import { timestamp } from 'drizzle-orm/pg-core';

export const timeStams = {
    createdAt: timestamp('created_at', {
        withTimezone: true,
        mode: 'date',
    })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', {
        withTimezone: true,
        mode: 'date',
    })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
};
