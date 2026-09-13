CREATE TABLE `runs` (
	`token` text PRIMARY KEY NOT NULL,
	`chamber` integer NOT NULL,
	`player` text NOT NULL,
	`name` text NOT NULL,
	`ip_hash` text NOT NULL,
	`started_at` integer NOT NULL,
	`elapsed_ms` integer,
	`falls` integer,
	`version` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `runs_ranking` ON `runs` (`version`,`chamber`,`elapsed_ms`,`falls`);--> statement-breakpoint
CREATE INDEX `runs_rate` ON `runs` (`ip_hash`,`started_at`);