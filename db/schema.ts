import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const runs=sqliteTable('runs',{
 token:text('token').primaryKey(),chamber:integer('chamber').notNull(),player:text('player').notNull(),name:text('name').notNull(),ipHash:text('ip_hash').notNull(),
 startedAt:integer('started_at').notNull(),elapsedMs:integer('elapsed_ms'),falls:integer('falls'),version:text('version').notNull(),
},t=>[index('runs_ranking').on(t.version,t.chamber,t.elapsedMs,t.falls),index('runs_rate').on(t.ipHash,t.startedAt)]);
