-- Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
-- WSO2 LLC. licenses this file to you under the Apache License,
-- Version 2.0 (the "License"); you may not use this file except
-- in compliance with the License.
-- You may obtain a copy of the License at
-- http://www.apache.org/licenses/LICENSE-2.0
-- Unless required by applicable law or agreed to in writing,
-- software distributed under the License is distributed on an
-- "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
-- KIND, either express or implied.  See the License for the
-- specific language governing permissions and limitations
-- under the License.

CREATE DATABASE IF NOT EXISTS `se_wiki`;

use se_wiki;

CREATE TABLE `route` (
    `route_id` int NOT NULL AUTO_INCREMENT COMMENT 'Route ID',
    `parent_id` int DEFAULT NULL COMMENT 'Parent ID of route',
    `label` varchar(100) DEFAULT NULL COMMENT 'Label of route',
    `title` varchar(50) DEFAULT NULL COMMENT 'Page title',
    `thumbnail` varchar(300) DEFAULT NULL COMMENT 'Page thumbnail',
    `description` text,
    `is_deleted` tinyint(1) DEFAULT '0' COMMENT 'Page deletion status',
    `route_path` varchar(300) DEFAULT NULL,
    `menu_item` varchar(100) DEFAULT NULL,
    `styling_info` json DEFAULT NULL COMMENT 'Styling information',
    PRIMARY KEY (`route_id`),
    KEY `parent_id` (`parent_id`),
    CONSTRAINT `route_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `route` (`route_id`)
);
INSERT INTO route (parent_id, label, title, description, is_deleted)
VALUES (
        NULL,
        'home',
        'THIS . IS . YOUR',
        'Your platform to access sales resources to sell better!',
        0
    );
CREATE TABLE `section` (
    `section_id` int NOT NULL AUTO_INCREMENT COMMENT 'Section ID',
    `route_id` int DEFAULT NULL COMMENT 'Route ID',
    `title` varchar(300) DEFAULT NULL COMMENT 'Section title',
    `is_deleted` tinyint(1) DEFAULT '0' COMMENT 'Deletion status',
    `section_type` enum('section', 'image') DEFAULT 'section' COMMENT 'Section type',
    `image_url` varchar(500) DEFAULT NULL COMMENT 'Section image',
    `redirect_url` varchar(500) DEFAULT NULL COMMENT 'Section redirect URL',
    `styling_info` json DEFAULT NULL COMMENT 'Styling information',
    `section_order` int DEFAULT NULL,
    PRIMARY KEY (`section_id`),
    KEY `route_id` (`route_id`),
    CONSTRAINT `section_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `route` (`route_id`)
);

INSERT INTO section (
        section_id,
        route_id,
        title,
        description,
        section_type,
        section_order
    )
VALUES (
        -4,
        NULL,
        'Essentials',
        'Essential content for all users',
        'section',
        0
    );

CREATE TABLE `content` (
    `content_id` int NOT NULL AUTO_INCREMENT COMMENT 'Content ID',
    `section_id` int DEFAULT NOT NULL COMMENT 'Section ID',
    `content_link` varchar(300) DEFAULT NOT NULL COMMENT 'Content link',
    `content_type` enum(
        'pdf',
        'slides',
        'mp4',
        'youtube',
        'page',
        'docs',
        'gsheet',
        'lms',
        'salesforce',
        'external'
    ) DEFAULT 'external' COMMENT 'Content type',
    `description` varchar(300) DEFAULT NOT NULL COMMENT 'Content description',
    `thumbnail` varchar(300) DEFAULT NULL COMMENT 'Content thumbnail',
    `is_deleted` tinyint(1) DEFAULT '0' COMMENT 'Deletion status',
    `styling_info` json DEFAULT NULL COMMENT 'Styling information',
    `created_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`content_id`),
    KEY `section_id` (`section_id`),
    CONSTRAINT `content_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`)
);

ALTER TABLE content
ADD COLUMN is_visible TINYINT NOT NULL DEFAULT 1;

ALTER TABLE content
ADD COLUMN content_sub_type VARCHAR(200) DEFAULT NULL COMMENT 'Content subtype'
AFTER content_type;

CREATE TABLE `user` (
    `user_id` int NOT NULL AUTO_INCREMENT COMMENT 'User ID',
    `email` varchar(50) UNIQUE NOT NULL COMMENT 'User email',
    `thumbnail` varchar(300) DEFAULT NULL COMMENT 'User image',
    `first_name` varchar(50) DEFAULT NULL COMMENT 'User first name',
    `last_name` varchar(50) DEFAULT NULL COMMENT 'User last name',
    PRIMARY KEY `user_id` (`user_id`)
);

CREATE TABLE `comment` (
    `comment_id` int NOT NULL AUTO_INCREMENT COMMENT 'Comment ID',
    `content_id` int DEFAULT NOT NULL COMMENT 'Content ID',
    `user_id` int DEFAULT NOT NULL COMMENT 'User ID',
    `comment` varchar(500) NOT NULL COMMENT 'Comment',
    PRIMARY KEY (`comment_id`),
    KEY `content_id` (`content_id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`content_id`) REFERENCES `content` (`content_id`),
    CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
);

CREATE TABLE `content_like` (
    `like_id` int NOT NULL AUTO_INCREMENT COMMENT 'Like ID',
    `content_id` int DEFAULT NOT NULL COMMENT 'Content ID',
    `user_id` int DEFAULT NOT NULL COMMENT 'User ID',
    `status` tinyint(1) DEFAULT '0' COMMENT 'User like or not',
    PRIMARY KEY (`like_id`),
    KEY `content_id` (`content_id`),
    KEY `user_id` (`user_id`),
    UNIQUE KEY `unique_content_user` (`content_id`, `user_id`),
    CONSTRAINT `content_like_ibfk_1` FOREIGN KEY (`content_id`) REFERENCES `content` (`content_id`),
    CONSTRAINT `content_like_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
);

CREATE TABLE `audit` (
    `audit_id` int NOT NULL AUTO_INCREMENT,
    `action` varchar(100) DEFAULT NULL,
    `user_id` int DEFAULT NULL COMMENT 'User ID',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`audit_id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `audit_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
);


DELIMITER //
CREATE TRIGGER before_route_insert 
BEFORE INSERT ON route 
FOR EACH ROW 
BEGIN
    DECLARE route_var VARCHAR(255);
    IF new.parent_id = 1 THEN
         SET NEW.route_path = CONCAT('/', NEW.label);
    ELSE 
        WITH recursive RecursivePaths AS (
                SELECT
                    route_id,
                    parent_id,
                    CONCAT('/', label) AS route_path,
                    label
                FROM
                    route
                WHERE 
                    parent_id = 1
            UNION ALL
                SELECT
                    r.route_id,
                    r.parent_id,
                    CONCAT(rp.route_path, '/', r.label) AS route_path,
                    r.label
                FROM
                    route r
                JOIN RecursivePaths rp 
                ON r.parent_id = rp.route_id
        )
    SELECT route_path INTO route_var
	FROM RecursivePaths
	WHERE route_id = new.parent_id;
        SET NEW.route_path = CONCAT(route_var, '/', NEW.label);
    END IF;
END;
//
DELIMITER;

-- Run this queries to after creating the trigger--
UPDATE route
SET route_path = 
(
	WITH recursive RecursivePaths AS (
        SELECT
			route_id,
            parent_id,
            CONCAT('/', label) AS route_path,
            label
        FROM
            route
        WHERE 
            parent_id = 1
        UNION ALL
        SELECT
			r.route_id,
            r.parent_id,
            CONCAT(rp.route_path, '/', r.label) AS route_path,
            r.label
        FROM
            route r
            JOIN RecursivePaths rp ON r.parent_id = rp.route_id
    )
    SELECT route_path AS path
    FROM RecursivePaths rs
    WHERE rs.route_id = route.route_id
);

UPDATE section
SET section_type = 'section'
WHERE section_type IS NULL;

ALTER TABLE route ADD COLUMN `route_order` INT;
UPDATE route SET `route_order` = route_id;
DELIMITER //
CREATE TRIGGER before_insert_route
BEFORE INSERT ON route
FOR EACH ROW
BEGIN
    DECLARE max_order INT;
    SELECT IFNULL(MAX(`route_order`), 0) INTO max_order FROM route;
    SET NEW.`route_order` = max_order + 1;
END//
DELIMITER ;

ALTER TABLE content ADD COLUMN `content_order` INT;
UPDATE content SET `content_order` = content_id;
DELIMITER //
CREATE TRIGGER before_insert_content
BEFORE INSERT ON content
FOR EACH ROW
BEGIN
    DECLARE max_order INT;
    SELECT IFNULL(MAX(`content_order`), 0) INTO max_order FROM content;
    SET NEW.`content_order` = max_order + 1;
END//
DELIMITER ;

UPDATE section SET `section_order` = section_id;
DELIMITER //
CREATE TRIGGER before_insert_section
BEFORE INSERT ON section
FOR EACH ROW
BEGIN
    DECLARE max_order INT;
    SELECT IFNULL(MAX(`section_order`), 0) INTO max_order FROM section;
    SET NEW.`section_order` = max_order + 1;
END//
DELIMITER ;

ALTER TABLE route
ADD COLUMN `isRouteVisible` TINYINT(1) DEFAULT 1 COMMENT 'Visibility status of the route (1 = visible, 0 = hidden)';
ALTER TABLE content
MODIFY COLUMN content_type ENUM(
        'slides',
        'youtube',
        'page',
        'gsheet',
        'lms',
        'salesforce',
        'external',
        'route_content'
    );
ALTER TABLE content
ADD COLUMN route_id INT,
    ADD COLUMN parent_content_id INT;

CREATE TABLE `custom_buttons` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `content_id` INT NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `icon` VARCHAR(255),
    `color` VARCHAR(20) CHECK (`color` IN ('blue', 'green', 'red', 'orange')),
    `action` VARCHAR(50) CHECK (`action` IN ('link', 'download')),
    `action_value` VARCHAR(255),
    `is_visible` BOOLEAN DEFAULT TRUE,
    `is_deleted` BOOLEAN DEFAULT FALSE,
    `order` INT,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`content_id`) REFERENCES `content` (`content_id`) ON DELETE CASCADE
);
ALTER TABLE custom_buttons CHANGE `order` `button_order` INT;
CREATE TABLE pinned_content (
    `user_email` VARCHAR(255) NOT NULL,
    `content_id` INT NOT NULL,
    `pinned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_email`, `content_id`)
);
CREATE TABLE `customer_testimonial` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `logo_url` VARCHAR(500) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `sub_title` VARCHAR(255) NULL,
    `website_url` VARCHAR(500) NOT NULL,
    `link_label` VARCHAR(50) NOT NULL DEFAULT 'Visit Website',
    `created_by` VARCHAR(320) NOT NULL,
    `updated_by` VARCHAR(320),
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
);
ALTER TABLE `customer_testimonial`
ADD COLUMN `is_shareable` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `tag`
MODIFY COLUMN `tag_name` VARCHAR(255) COLLATE utf8mb4_bin NOT NULL;
