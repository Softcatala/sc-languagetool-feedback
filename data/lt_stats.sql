drop table `lt_stats`;

CREATE TABLE `lt_stats`.`lt_stats` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` varchar(45) DEFAULT NULL,
  `rule_id` varchar(45) DEFAULT NULL,
  `rule_sub_id` int(11) DEFAULT NULL,
  `incorrect_text` text,
  `incorrect_position` int(11) DEFAULT NULL,
  `context` text,
  `suggestion` text,
  `suggestion_position` int(11) DEFAULT NULL,
  `datetime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_uuid` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rule` (`rule_id`,`rule_sub_id`),
  KEY `user` (`user_uuid`)
);

