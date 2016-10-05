CREATE TABLE `lt_stats`.`lt_stats` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NULL,
  `rule` VARCHAR(45) NULL,
  `rule_id` INT NULL,
  `incorrect_text` TEXT NULL,
  `incorrect_position` INT NULL,
  `context` TEXT NULL,
  `suggestion` TEXT NULL,
  `suggestion_position` INT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `lt_stats`.`lt_stats`
ADD COLUMN `datetime` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER `suggestion_position`;

