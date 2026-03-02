/*
 Navicat Premium Dump SQL

 Source Server         : sharenoteServerMysql
 Source Server Type    : MySQL
 Source Server Version : 50744 (5.7.44-log)
 Source Host           : 103.194.106.239:3306
 Source Schema         : sharenotev2

 Target Server Type    : MySQL
 Target Server Version : 50744 (5.7.44-log)
 File Encoding         : 65001

 Date: 02/03/2026 12:18:20
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for files
-- ----------------------------
DROP TABLE IF EXISTS `files`;
CREATE TABLE `files`  (
  `fileId` int(11) NOT NULL AUTO_INCREMENT,
  `publisherId` int(11) NOT NULL,
  `fileCustomName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fileOriginalName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fileName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fileType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `filePath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createdTime` datetime NOT NULL,
  PRIMARY KEY (`fileId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 106 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for group_activities
-- ----------------------------
DROP TABLE IF EXISTS `group_activities`;
CREATE TABLE `group_activities`  (
  `activityId` int(11) NOT NULL AUTO_INCREMENT COMMENT '活动ID',
  `groupId` int(11) NOT NULL COMMENT '小组ID',
  `userId` int(11) NOT NULL COMMENT '操作用户ID',
  `activityType` enum('join','leave','role_change','group_update') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '活动类型',
  `activityDetail` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '活动详情（JSON格式）',
  `createdTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`activityId`) USING BTREE,
  INDEX `idx_group`(`groupId`) USING BTREE,
  INDEX `idx_user`(`userId`) USING BTREE,
  INDEX `idx_type`(`activityType`) USING BTREE,
  INDEX `idx_time`(`createdTime`) USING BTREE,
  CONSTRAINT `group_activities_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `group_activities_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '小组活动日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for group_invitations
-- ----------------------------
DROP TABLE IF EXISTS `group_invitations`;
CREATE TABLE `group_invitations`  (
  `invitationId` int(11) NOT NULL AUTO_INCREMENT COMMENT '邀请ID',
  `groupId` int(11) NOT NULL COMMENT '小组ID',
  `inviterId` int(11) NOT NULL COMMENT '邀请人ID',
  `inviteeId` int(11) NULL DEFAULT NULL COMMENT '被邀请人ID（如果通过用户ID邀请）',
  `inviteeEmail` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '被邀请人邮箱（如果通过邮箱邀请）',
  `invitationCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '邀请码',
  `status` enum('pending','accepted','rejected','expired') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'pending' COMMENT '状态',
  `createdTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `expiresTime` datetime NULL DEFAULT NULL COMMENT '过期时间',
  `respondedTime` datetime NULL DEFAULT NULL COMMENT '响应时间',
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '邀请留言',
  PRIMARY KEY (`invitationId`) USING BTREE,
  UNIQUE INDEX `invitationCode`(`invitationCode`) USING BTREE,
  INDEX `idx_group`(`groupId`) USING BTREE,
  INDEX `idx_inviter`(`inviterId`) USING BTREE,
  INDEX `idx_invitee`(`inviteeId`) USING BTREE,
  INDEX `idx_code`(`invitationCode`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_expires`(`expiresTime`) USING BTREE,
  CONSTRAINT `group_invitations_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `group_invitations_ibfk_2` FOREIGN KEY (`inviterId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `group_invitations_ibfk_3` FOREIGN KEY (`inviteeId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '小组邀请表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for group_members
-- ----------------------------
DROP TABLE IF EXISTS `group_members`;
CREATE TABLE `group_members`  (
  `groupId` int(11) NOT NULL COMMENT '小组ID',
  `userId` int(11) NOT NULL COMMENT '用户ID',
  `role` enum('owner','admin','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'member' COMMENT '角色（owner-所有者，admin-管理员，member-普通成员）',
  `joinedTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `isActive` tinyint(1) NULL DEFAULT 1 COMMENT '是否激活（0-已退出，1-正常）',
  PRIMARY KEY (`groupId`, `userId`) USING BTREE,
  INDEX `idx_group`(`groupId`) USING BTREE,
  INDEX `idx_user`(`userId`) USING BTREE,
  INDEX `idx_role`(`role`) USING BTREE,
  CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '小组成员表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for groups
-- ----------------------------
DROP TABLE IF EXISTS `groups`;
CREATE TABLE `groups`  (
  `groupId` int(11) NOT NULL AUTO_INCREMENT COMMENT '小组ID',
  `groupName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '小组名称',
  `creatorId` int(11) NOT NULL COMMENT '创建者ID',
  `createdTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `isActive` tinyint(1) NULL DEFAULT 1 COMMENT '是否激活（0-已删除，1-正常）',
  `maxMembers` int(11) NULL DEFAULT 5 COMMENT '最大成员数（2-15人）',
  PRIMARY KEY (`groupId`) USING BTREE,
  INDEX `idx_creator`(`creatorId`) USING BTREE,
  INDEX `idx_created_time`(`createdTime`) USING BTREE,
  CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`creatorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '小组信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for markdownFiles
-- ----------------------------
DROP TABLE IF EXISTS `markdownFiles`;
CREATE TABLE `markdownFiles`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `markdownId` int(11) NOT NULL,
  `uploadUserId` int(11) NOT NULL,
  `imgName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `imgPath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `username` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phoneNumber` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `avatarpath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
