CREATE TABLE `disciplinas` (
	`codigo` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`curriculo` integer,
	`periodo` integer,
	`pre_requisitos` text DEFAULT '' NOT NULL,
	`carga_horaria` integer
);
--> statement-breakpoint
CREATE TABLE `notas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`nome_disciplina` text NOT NULL,
	`curso` text NOT NULL,
	`media` real,
	`situacao` text NOT NULL,
	`semestre` text NOT NULL,
	`professor` text NOT NULL,
	`matricula` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notas_codigo` ON `notas` (`codigo`);--> statement-breakpoint
CREATE INDEX `notas_codigo_semestre` ON `notas` (`codigo`,`semestre`);--> statement-breakpoint
CREATE INDEX `notas_semestre` ON `notas` (`semestre`);