CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"confirmation_token" varchar(64),
	"unsubscribe_token" varchar(64),
	"interests" text,
	"source" varchar(50) DEFAULT 'coming_soon',
	"ip_address" varchar(45),
	"user_agent" text,
	"confirmed_at" timestamp,
	"unsubscribed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "newsletter_subscribers_confirmation_token_unique" UNIQUE("confirmation_token"),
	CONSTRAINT "newsletter_subscribers_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
