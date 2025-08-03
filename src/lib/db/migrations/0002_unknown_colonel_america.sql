CREATE TABLE "project_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"description" text,
	"file_type" varchar(20) NOT NULL,
	"file_size" numeric(10, 0) NOT NULL,
	"url" varchar(1000) NOT NULL,
	"is_downloadable" boolean DEFAULT true,
	"sort_order" numeric(5, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;