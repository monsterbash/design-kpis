CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_protection_enabled` integer DEFAULT false NOT NULL,
	`site_password_hash` text,
	`password_version` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
