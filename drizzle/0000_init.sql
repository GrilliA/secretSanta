CREATE TABLE "assignment" (
	"event_id" uuid NOT NULL,
	"giver_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	CONSTRAINT "assignment_giver_id_pk" PRIMARY KEY("giver_id")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"exchange_date" date,
	"budget" text,
	"message" text,
	"organizer_name" text NOT NULL,
	"organizer_email" text NOT NULL,
	"admin_token" text NOT NULL,
	"drawn_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_admin_token_unique" UNIQUE("admin_token")
);
--> statement-breakpoint
CREATE TABLE "exclusion" (
	"event_id" uuid NOT NULL,
	"a_id" uuid NOT NULL,
	"b_id" uuid NOT NULL,
	CONSTRAINT "exclusion_a_id_b_id_pk" PRIMARY KEY("a_id","b_id")
);
--> statement-breakpoint
CREATE TABLE "participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"managed_by_id" uuid,
	"token" text NOT NULL,
	"is_organizer" boolean DEFAULT false NOT NULL,
	"invite_sent_at" timestamp with time zone,
	"invite_opened_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participant_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "wish" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_giver_id_participant_id_fk" FOREIGN KEY ("giver_id") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_receiver_id_participant_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exclusion" ADD CONSTRAINT "exclusion_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exclusion" ADD CONSTRAINT "exclusion_a_id_participant_id_fk" FOREIGN KEY ("a_id") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exclusion" ADD CONSTRAINT "exclusion_b_id_participant_id_fk" FOREIGN KEY ("b_id") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_managed_by_id_participant_id_fk" FOREIGN KEY ("managed_by_id") REFERENCES "public"."participant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wish" ADD CONSTRAINT "wish_participant_id_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assignment_receiver_unique" ON "assignment" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "exclusion_event_idx" ON "exclusion" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "participant_event_idx" ON "participant" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "wish_participant_idx" ON "wish" USING btree ("participant_id");