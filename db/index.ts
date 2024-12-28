import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '@/lib/env';
import * as auth from './schema/auth.sql';

const db = drizzle({
    connection: {
        connectionString: env.DATABASE_URL,
    },
    schema: {
        ...auth,
    },
});

export default db;
