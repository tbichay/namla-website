CREATE TYPE "public"."project_status" AS ENUM('verfügbar', 'verkauft', 'in_planung', 'in_bau', 'fertiggestellt');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('einfamilienhaus', 'mehrfamilienhaus', 'eigentumswohnung', 'penthouse', 'villa', 'reihenhaus', 'doppelhaushälfte');--> statement-breakpoint
CREATE TABLE "project_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255),
	"url" varchar(1000) NOT NULL,
	"alt" varchar(255),
	"caption" varchar(500),
	"sort_order" numeric(5, 2) DEFAULT '0',
	"is_main_image" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"address" varchar(500),
	"status" "project_status" DEFAULT 'in_planung' NOT NULL,
	"type" "project_type" DEFAULT 'einfamilienhaus' NOT NULL,
	"price_from" varchar(50),
	"price_exact" numeric(12, 2),
	"description" text,
	"short_description" varchar(500),
	"details" json,
	"images" json DEFAULT '[]'::json,
	"meta_title" varchar(255),
	"meta_description" varchar(500),
	"features" json DEFAULT '[]'::json,
	"location_details" json,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;