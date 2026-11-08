ALTER TABLE "event" ADD COLUMN "ready_notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "wishlist_invited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "wishlist_ready_at" timestamp with time zone;