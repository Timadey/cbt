-- MySQL dump 10.13  Distrib 8.0.35, for Linux (x86_64)
--
-- Host: localhost    Database: cbt
-- ------------------------------------------------------
-- Server version	8.0.35-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
INSERT INTO `alembic_version` VALUES ('ed19a45148a4');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examinations`
--

DROP TABLE IF EXISTS `examinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examinations` (
  `name` varchar(128) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `id` varchar(60) NOT NULL,
  `created_at` datetime NOT NULL,
  `modified_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examinations`
--

LOCK TABLES `examinations` WRITE;
/*!40000 ALTER TABLE `examinations` DISABLE KEYS */;
INSERT INTO `examinations` VALUES ('sdfgh','2023-03-08 15:03:00','2023-03-31 08:04:00','0c80cd10-c0cf-4ec2-b756-dbaebc021869','2023-03-09 21:10:13','2023-03-09 21:10:13'),('Timothy Adeleke','2023-03-27 07:31:00','2023-03-30 03:32:00','0d1dcba6-9f03-4c7d-9c36-2cf215b646ab','2023-03-27 22:33:33','2023-03-27 22:33:33'),('Test Blueprint aftermath 2','2023-03-17 11:37:00','2023-03-31 18:43:00','1fe04898-baa4-4b40-8cd3-e4dc2b7fe9aa','2023-03-13 06:34:34','2023-03-13 06:34:34'),('Ola Exam','2023-03-30 13:26:00','2023-03-31 10:26:00','2366caef-4009-4f2f-a46f-3504736d9960','2023-03-30 10:26:54','2023-03-30 10:26:54'),('Test Blueprint aftermath','2023-03-17 11:37:00','2023-03-31 18:43:00','3a6d1a69-be63-40fe-9a4f-b5a93c3d65b6','2023-03-13 06:32:30','2023-03-13 06:32:30'),('dsgerge','2023-03-30 14:29:00','2023-03-31 10:29:00','44481172-8342-4b3e-a1df-ab5bb325c100','2023-03-30 10:29:37','2023-03-30 10:29:37'),('test hierachy aftermath','2023-03-17 01:08:00','2023-03-18 01:09:00','891afe22-4857-4ea9-839b-b4f12568e84f','2023-03-15 22:04:58','2023-03-15 22:04:58'),('New ','2023-03-08 15:03:00','2023-03-31 08:04:00','a1ed92b6-31f8-4c18-8f0f-1b4462163f0d','2023-03-09 14:39:29','2023-03-09 14:39:29'),('2023/2024 First Semester Examination','2023-03-08 15:03:00','2023-03-31 08:04:00','b5db76c4-1c88-4e05-a482-fabefa3396d8','2023-03-09 06:12:06','2023-03-09 06:12:06'),('New examination','2023-03-30 13:04:00','2023-03-31 10:04:00','d3d6566b-5e0d-4da1-9c30-50088cd94b1a','2023-03-30 10:04:14','2023-03-30 10:04:14'),('Rivers United','2023-03-08 15:03:00','2023-03-31 08:04:00','e9d416e8-2843-4940-930f-ed94ce425450','2023-03-09 20:59:56','2023-03-09 20:59:56');
/*!40000 ALTER TABLE `examinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_papers`
--

DROP TABLE IF EXISTS `question_papers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_papers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject_id` varchar(60) NOT NULL,
  `examination_id` varchar(60) DEFAULT NULL,
  `questions` json DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `modified_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `examination_id` (`examination_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `question_papers_ibfk_1` FOREIGN KEY (`examination_id`) REFERENCES `examinations` (`id`),
  CONSTRAINT `question_papers_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_papers`
--

LOCK TABLES `question_papers` WRITE;
/*!40000 ALTER TABLE `question_papers` DISABLE KEYS */;
INSERT INTO `question_papers` VALUES (6,'22cc6bc4-d6f7-4c56-884f-92f5e7d9f3fe','b5db76c4-1c88-4e05-a482-fabefa3396d8','\"{\\\"0\\\": {\\\"correct_option\\\": \\\"0\\\", \\\"options\\\": [\\\"Option 1\\\", \\\"Option 2\\\", \\\"Option 3\\\"], \\\"question\\\": \\\"A test question\\\"}, \\\"1\\\": {\\\"correct_option\\\": \\\"0\\\", \\\"options\\\": [\\\"ugowirgnwiorlgml\\\", \\\"new option\\\"], \\\"question\\\": \\\"sjubcukajnc\\\"}, \\\"2\\\": {\\\"correct_option\\\": \\\"0\\\", \\\"options\\\": [\\\"juhfick\\\"], \\\"question\\\": \\\"jqwfibuiwen\\\"}, \\\"3\\\": {\\\"question\\\": \\\"kdlmvklsd\\\", \\\"options\\\": [\\\"akcbsdbcjksvjsfj\\\", \\\"jkscbjkdbscjksda\\\"], \\\"correct_option\\\": \\\"1\\\"}, \\\"4\\\": {\\\"question\\\": \\\"dpmvsd\\\", \\\"options\\\": [\\\"jdnv\\\"], \\\"correct_option\\\": \\\"0\\\"}}\"','2023-03-09 05:11:37','2023-03-09 05:11:37','2023-03-09 06:11:37','2023-03-09 06:11:37'),(7,'ec8547cc-e684-4e70-9396-e65ad8d50d64','b5db76c4-1c88-4e05-a482-fabefa3396d8','\"{\\\"1\\\": {\\\"question\\\": \\\"What is an Noun?\\\", \\\"options\\\": [\\\"a place\\\\r\\\", \\\"an animal\\\\r\\\", \\\"a name\\\\r\\\", \\\"name of any person animal place or thing\\\"], \\\"correct_option\\\": \\\"name of any person animal place or thing\\\"}, \\\"2\\\": {\\\"question\\\": \\\"efergrt\\\", \\\"options\\\": [\\\"efwfrf\\\\r\\\", \\\"e24\\\"], \\\"correct_option\\\": \\\"e24\\\"}, \\\"3\\\": {\\\"question\\\": \\\"momrkemre\\\", \\\"options\\\": [\\\"mkmkmr\\\\r\\\", \\\"klmkmkr\\\"], \\\"correct_option\\\": \\\"klmkmkr\\\"}, \\\"4\\\": {\\\"question\\\": \\\"Ade question!\\\", \\\"options\\\": [\\\"efkefnlrn\\\\r\\\", \\\"wefkrlwfr\\\\r\\\", \\\"kmrklemrlk\\\"], \\\"correct_option\\\": \\\"efkefnlrn\\\\r\\\"}}\"','2023-03-09 05:11:37','2023-03-09 05:11:37','2023-03-09 06:11:37','2023-03-09 06:11:37'),(101,'22cc6bc4-d6f7-4c56-884f-92f5e7d9f3fe','a1ed92b6-31f8-4c18-8f0f-1b4462163f0d','\"{\\\"1\\\": {\\\"question\\\": \\\"2 + 3 = \\\", \\\"options\\\": [\\\"sjlno\\\\r\\\", \\\"sjbusc\\\"], \\\"correct_option\\\": \\\"sjbusc\\\"}, \\\"2\\\": {\\\"question\\\": \\\"jdbvbisnd\\\", \\\"options\\\": [\\\"nio\\\\r\\\", \\\"ihoh\\\\r\\\", \\\"oihoih\\\"], \\\"correct_option\\\": \\\"ihoh\\\\r\\\"}}\"','2023-03-09 13:28:54','2023-03-09 13:28:54','2023-03-09 14:28:54','2023-03-09 14:28:54'),(102,'61cf53c1-a081-47ab-b1ad-ed9f99210c7b','a1ed92b6-31f8-4c18-8f0f-1b4462163f0d','\"{\\\"1\\\": {\\\"question\\\": \\\"vuvuigui\\\", \\\"options\\\": [\\\"knuii\\\\r\\\", \\\"dfuruifr\\\\r\\\", \\\"fbiebf\\\"], \\\"correct_option\\\": \\\"dfuruifr\\\\r\\\"}}\"','2023-03-09 13:28:54','2023-03-09 13:28:54','2023-03-09 14:28:54','2023-03-09 14:28:54'),(103,'b23547e8-1d67-49de-87d3-60358a795833','a1ed92b6-31f8-4c18-8f0f-1b4462163f0d','\"{\\\"1\\\": {\\\"question\\\": \\\"buibui\\\", \\\"options\\\": [\\\"jbuib\\\\r\\\", \\\"ejbuibed\\\\r\\\", \\\"djkbbue\\\\r\\\", \\\"djbeubd\\\"], \\\"correct_option\\\": \\\"jbuib\\\\r\\\"}}\"','2023-03-09 13:28:54','2023-03-09 13:28:54','2023-03-09 14:28:54','2023-03-09 14:28:54'),(104,'ec8547cc-e684-4e70-9396-e65ad8d50d64','a1ed92b6-31f8-4c18-8f0f-1b4462163f0d','\"{\\\"1\\\": {\\\"question\\\": \\\"keugfuiegifeih\\\", \\\"options\\\": [\\\"uiwbuigeifgei\\\\r\\\", \\\"sfieigfe\\\\r\\\", \\\"efieuigfie\\\\r\\\", \\\"efigiugiegf\\\"], \\\"correct_option\\\": \\\"sfieigfe\\\\r\\\"}}\"','2023-03-09 13:28:54','2023-03-09 13:28:54','2023-03-09 14:28:54','2023-03-09 14:28:54'),(105,'61cf53c1-a081-47ab-b1ad-ed9f99210c7b','e9d416e8-2843-4940-930f-ed94ce425450','\"{}\"','2023-03-09 18:56:04','2023-03-09 18:56:04','2023-03-09 19:56:04','2023-03-09 19:56:04'),(106,'b23547e8-1d67-49de-87d3-60358a795833','e9d416e8-2843-4940-930f-ed94ce425450','\"{}\"','2023-03-09 18:56:04','2023-03-09 18:56:04','2023-03-09 19:56:04','2023-03-09 19:56:04'),(107,'22cc6bc4-d6f7-4c56-884f-92f5e7d9f3fe','0c80cd10-c0cf-4ec2-b756-dbaebc021869','\"{\\\"1\\\": {\\\"question\\\": \\\"Ade question!\\\", \\\"options\\\": [\\\"jnflnlf\\\\r\\\", \\\"jneflnelf\\\\r\\\", \\\"jnfelnfe\\\\r\\\", \\\"jneklenfl\\\"], \\\"correct_option\\\": 0}, \\\"2\\\": {\\\"question\\\": \\\"Olauiw\\\", \\\"options\\\": [\\\"dbbivurv\\\\r\\\", \\\"dfbbfiuf\\\\r\\\", \\\"dfiubfiruf\\\"], \\\"correct_option\\\": 1}, \\\"3\\\": {\\\"question\\\": \\\"ierughuiethguit\\\", \\\"options\\\": [\\\"bruegyergui\\\\r\\\", \\\"uerguietg uit\\\\r\\\", \\\"bryufreuigei\\\"], \\\"correct_option\\\": 2}, \\\"4\\\": {\\\"question\\\": \\\"dbbubuirviuriuriu\\\", \\\"options\\\": [\\\"wfruihirhirhgit\\\\r\\\", \\\"euierhuierhigerg\\\\r\\\", \\\"eruighruiehguiehg\\\\r\\\", \\\"bfiuriernerniereui\\\"], \\\"correct_option\\\": 3}}\"','2023-03-09 20:08:39','2023-03-09 20:08:39','2023-03-09 21:08:39','2023-03-09 21:08:39'),(108,'4465097c-1a5c-4238-8fec-c83bd41d9e0d','0c80cd10-c0cf-4ec2-b756-dbaebc021869','\"{}\"','2023-03-09 20:08:39','2023-03-09 20:08:39','2023-03-09 21:08:39','2023-03-09 21:08:39'),(109,'61cf53c1-a081-47ab-b1ad-ed9f99210c7b','0c80cd10-c0cf-4ec2-b756-dbaebc021869','\"{}\"','2023-03-09 20:08:39','2023-03-09 20:08:39','2023-03-09 21:08:39','2023-03-09 21:08:39'),(110,'22cc6bc4-d6f7-4c56-884f-92f5e7d9f3fe','3a6d1a69-be63-40fe-9a4f-b5a93c3d65b6','\"{}\"','2023-03-13 05:32:29','2023-03-13 05:32:29','2023-03-13 06:32:29','2023-03-13 06:32:29'),(111,'43f03a3d-566e-4b23-bb2d-258729c9dcee','3a6d1a69-be63-40fe-9a4f-b5a93c3d65b6','\"{}\"','2023-03-13 05:32:29','2023-03-13 05:32:29','2023-03-13 06:32:29','2023-03-13 06:32:29'),(112,'4465097c-1a5c-4238-8fec-c83bd41d9e0d','3a6d1a69-be63-40fe-9a4f-b5a93c3d65b6','\"{}\"','2023-03-13 05:32:29','2023-03-13 05:32:29','2023-03-13 06:32:29','2023-03-13 06:32:29'),(113,'22cc6bc4-d6f7-4c56-884f-92f5e7d9f3fe','1fe04898-baa4-4b40-8cd3-e4dc2b7fe9aa','\"{}\"','2023-03-13 05:34:27','2023-03-13 05:34:27','2023-03-13 06:34:27','2023-03-13 06:34:27'),(114,'43f03a3d-566e-4b23-bb2d-258729c9dcee','1fe04898-baa4-4b40-8cd3-e4dc2b7fe9aa','\"{}\"','2023-03-13 05:34:27','2023-03-13 05:34:27','2023-03-13 06:34:27','2023-03-13 06:34:27'),(115,'4465097c-1a5c-4238-8fec-c83bd41d9e0d','1fe04898-baa4-4b40-8cd3-e4dc2b7fe9aa','\"{}\"','2023-03-13 05:34:27','2023-03-13 05:34:27','2023-03-13 06:34:27','2023-03-13 06:34:27'),(116,'22cc6bc4-d6f7-4c56-884f-92f5e7d9f3fe','891afe22-4857-4ea9-839b-b4f12568e84f','\"{}\"','2023-03-15 21:03:02','2023-03-15 21:03:02','2023-03-15 22:03:02','2023-03-15 22:03:02'),(117,'4465097c-1a5c-4238-8fec-c83bd41d9e0d','891afe22-4857-4ea9-839b-b4f12568e84f','\"{}\"','2023-03-15 21:03:02','2023-03-15 21:03:02','2023-03-15 22:03:02','2023-03-15 22:03:02'),(118,'1059d835-0950-49f3-910f-a4081905c342','0d1dcba6-9f03-4c7d-9c36-2cf215b646ab','\"{}\"','2023-03-27 21:33:22','2023-03-27 21:33:22','2023-03-27 22:33:22','2023-03-27 22:33:22'),(119,'43f03a3d-566e-4b23-bb2d-258729c9dcee','0d1dcba6-9f03-4c7d-9c36-2cf215b646ab','\"{}\"','2023-03-27 21:33:22','2023-03-27 21:33:22','2023-03-27 22:33:22','2023-03-27 22:33:22'),(120,'1059d835-0950-49f3-910f-a4081905c342','d3d6566b-5e0d-4da1-9c30-50088cd94b1a','\"{\\\"0\\\": {\\\"question\\\": \\\"skmca\\\", \\\"options\\\": [\\\"dmlp\\\"], \\\"correct_option\\\": \\\"0\\\"}}\"','2023-03-30 08:35:48','2023-03-30 08:35:48','2023-03-30 09:35:48','2023-03-30 09:35:48'),(121,'22cc6bc4-d6f7-4c56-884f-92f5e7d9f3fe','d3d6566b-5e0d-4da1-9c30-50088cd94b1a','\"{}\"','2023-03-30 08:35:48','2023-03-30 08:35:48','2023-03-30 09:35:48','2023-03-30 09:35:48'),(122,'43f03a3d-566e-4b23-bb2d-258729c9dcee','d3d6566b-5e0d-4da1-9c30-50088cd94b1a','\"{}\"','2023-03-30 08:35:48','2023-03-30 08:35:48','2023-03-30 09:35:48','2023-03-30 09:35:48'),(123,'43f03a3d-566e-4b23-bb2d-258729c9dcee','2366caef-4009-4f2f-a46f-3504736d9960','\"{\\\"0\\\": {\\\"question\\\": \\\"iepioje\\\", \\\"options\\\": [\\\"nklnd\\\"], \\\"correct_option\\\": \\\"0\\\"}}\"','2023-03-30 09:19:04','2023-03-30 09:19:04','2023-03-30 10:19:04','2023-03-30 10:19:04'),(124,'22cc6bc4-d6f7-4c56-884f-92f5e7d9f3fe','44481172-8342-4b3e-a1df-ab5bb325c100','\"{\\\"0\\\": {\\\"question\\\": \\\"nacisnkdk\\\", \\\"options\\\": [\\\"jkefksjn\\\", \\\"m,d vksrnkvs\\\", \\\"jafiw\\\"], \\\"correct_option\\\": \\\"1\\\"}, \\\"1\\\": {\\\"question\\\": \\\"ncifaeiof\\\", \\\"options\\\": [\\\"jnkkwjn\\\"], \\\"correct_option\\\": \\\"0\\\"}}\"','2023-03-30 09:19:04','2023-03-30 09:19:04','2023-03-30 10:19:04','2023-03-30 10:19:04');
/*!40000 ALTER TABLE `question_papers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `results`
--

DROP TABLE IF EXISTS `results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `results` (
  `student_id` varchar(60) NOT NULL,
  `score` int DEFAULT NULL,
  `time_submitted` datetime DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `modified_at` datetime NOT NULL,
  `question_paper_id` int NOT NULL,
  `token` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `student_id` (`student_id`),
  KEY `question_paper_id` (`question_paper_id`),
  CONSTRAINT `results_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `results_ibfk_3` FOREIGN KEY (`question_paper_id`) REFERENCES `question_papers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `results`
--

LOCK TABLES `results` WRITE;
/*!40000 ALTER TABLE `results` DISABLE KEYS */;
INSERT INTO `results` VALUES ('bf1a1170-adc3-4c0d-be13-4296e2c9cd10',4,'2023-03-27 02:02:14',1,'2023-03-26 13:11:14','2023-03-26 13:11:14',6,22861),('10c692cb-b2f6-4fb8-bcca-4e261ae58311',NULL,NULL,2,'2023-03-29 14:47:28','2023-03-29 14:47:28',6,517878),('2ca59bca-76a0-404d-b6d0-b2b8a2db9a78',NULL,NULL,3,'2023-03-29 14:53:15','2023-03-29 14:53:15',6,944072),('10c692cb-b2f6-4fb8-bcca-4e261ae58311',NULL,NULL,4,'2023-05-03 21:56:17','2023-05-03 21:56:17',124,709729);
/*!40000 ALTER TABLE `results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `name` varchar(128) NOT NULL,
  `email` varchar(128) DEFAULT NULL,
  `id` varchar(60) NOT NULL,
  `created_at` datetime NOT NULL,
  `modified_at` datetime NOT NULL,
  `password` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('Timothy Adeleke','toluwanitimmo@gmail.com','10c692cb-b2f6-4fb8-bcca-4e261ae58311','2023-03-29 14:34:14','2023-03-29 14:34:14','pbkdf2:sha256:260000$1xaZWKvpe9Is7yHo$7d7ceb5a11eb877e8832ecff2f8bb4c73bd10ca6574730f1f1a8a6da60493b9b'),('Timothy Adeleke','toluwwwwwanitimo@gmail.com','2ca59bca-76a0-404d-b6d0-b2b8a2db9a78','2023-03-29 14:48:09','2023-03-29 14:48:09','pbkdf2:sha256:260000$5WuphUbyOdhAnpPU$d3caff7ed69da0540ac251f5a5727b9a019e346e6e63712d68211c0cc7056bc2'),('Timothy Adeleke','timothy@cbtstudent.com','3c676814-be9e-45fe-89c8-b4d3adeaa8ff','2023-03-29 13:27:50','2023-03-29 13:27:50','pbkdf2:sha256:260000$S0jnxiGbMemBTrTm$15037056707a30c562a4e464079a2c4688185d27243592488cbe67e3acf3f172'),('Great','great@cbt.com','4ff3e035-3360-4b6d-8619-40b8217265bf','2023-03-30 10:26:06','2023-03-30 10:26:06','pbkdf2:sha256:260000$iacuc9s4vAGC0CH3$7982b52f96223725853ac7c9aa2d8f2e54dc9349f5179072f369f5ba7226b61f'),('Timothy Adeleke','toluwanitiwmo@gmail.com','641fbd44-0b19-45b6-bd49-d8c8c3ccbb04','2023-03-29 14:42:57','2023-03-29 14:42:57','pbkdf2:sha256:260000$gGXlilS7o2rgk5AD$9e9eb3f145e97a192b1af5bd4ec557f87801724197fb3387b9eeb49e2b17bce1'),('Timothy Adeleke','toluwanirrtimo@gmail.com','6b36ca6d-efc8-473b-99af-c7713d7d3273','2023-03-29 14:37:06','2023-03-29 14:37:06','pbkdf2:sha256:260000$WN1ATJsl74CWupRd$365efc1bf87ff071e16aa302ae80460fe0a35ffe2d87593278e6493c9c815823'),('Timothy Adeleke','timothy@cbt.student.com','8bced60d-881c-431d-a265-d5395a7bdb49','2023-03-29 08:51:54','2023-03-29 08:51:54','pbkdf2:sha256:260000$TdbYEkv7GZ5oNqC9$9645d4858a60f22e7992f6bc995171aae377ae8a205324bcc48b76e5210cac96'),('Timothy Adeleke','toluwanietiwmo@gmail.com','a4ee1534-3443-4158-96a1-0b3d3d88ba42','2023-03-29 14:46:33','2023-03-29 14:46:33','pbkdf2:sha256:260000$tUcM7EblPLbReIhp$c95dd50b0b52bb219cb51ea602cf0db5c8db7de4012ef2a6942e00cdeaa617bf'),('Timothy Adeleke','toluwanitimo@gmail.com','b3e74f8c-e8d4-465f-949c-d34746c8a784','2023-03-29 13:46:12','2023-03-29 13:46:12','pbkdf2:sha256:260000$z9F6v1fnsDVsyxT1$1c8084c1f57ddbf238b588c22fda752baa6fcd56144aba0acd47ae1de3145d4c'),('Olakojo','olakojo@cbt.com','b48cecca-d16d-4b9e-b370-7a05116864a1','2023-03-30 10:24:52','2023-03-30 10:24:52','pbkdf2:sha256:260000$INRRCLMPMtbmO7Aa$8030cf808f77e21bacb80340e700a5b6cf55b9a0657455a8fd442d200288e628'),('Timothy STudent','timothy@student.com','bf1a1170-adc3-4c0d-be13-4296e2c9cd10','2023-03-13 11:33:03','2023-03-13 11:33:03','pbkdf2:sha256:260000$JIQ24NXWXo6YRT8T$20defe89a543fb777266486367998b8e5655bd34deaf3dabd638cd57ff8ff6c4'),('dfbuiwk','ewfkui@beiofh.feb','c55bb970-21a0-4ae9-a7cb-34c827764ce6','2023-03-30 11:23:48','2023-03-30 11:23:48','pbkdf2:sha256:260000$KRIJezYCY6dODspH$da116b66213dad7d692602fc8a10c3d2faea619147e127ed1e6ea73b72ada8e6'),('Timothy Adeleke','toluwwanietiwmo@gmail.com','c64d6499-0e0c-4ca9-b0e1-f56bb52b54d6','2023-03-29 14:47:39','2023-03-29 14:47:39','pbkdf2:sha256:260000$or98Gx2LEaYhF1jT$045664abe29b7963f303f516cf67aad89d155336b87cb1c3a4ca35229e459fbb'),('Timothy Adeleke','dbvuab@ebfui.cuneui','e8464cc3-5825-4264-9d55-b8dcf22eff05','2023-03-30 10:30:29','2023-03-30 10:30:29','pbkdf2:sha256:260000$QvTni8g46QDjfHDi$de6a5c79db336a0e0c970b177fcc26e1c404f871354df08d1a9fe5080b1ca934');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `name` varchar(128) NOT NULL,
  `teacher_id` varchar(60) NOT NULL,
  `id` varchar(60) NOT NULL,
  `created_at` datetime NOT NULL,
  `modified_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES ('Sociology','01476cbd-bb92-4716-85ac-0112aae892dd','1059d835-0950-49f3-910f-a4081905c342','2023-03-13 06:35:04','2023-03-13 06:35:04'),('Rivers United','01476cbd-bb92-4716-85ac-0112aae892dd','1d7999f2-22f5-41af-8a03-5088643f1562','2023-03-30 10:31:52','2023-03-30 10:31:52'),('Mathematics','01476cbd-bb92-4716-85ac-0112aae892dd','22cc6bc4-d6f7-4c56-884f-92f5e7d9f3fe','2023-03-07 23:14:33','2023-03-07 23:14:33'),('GES401','01476cbd-bb92-4716-85ac-0112aae892dd','43f03a3d-566e-4b23-bb2d-258729c9dcee','2023-03-09 21:08:43','2023-03-09 21:08:43'),('YOR304','01476cbd-bb92-4716-85ac-0112aae892dd','4465097c-1a5c-4238-8fec-c83bd41d9e0d','2023-03-09 21:08:58','2023-03-09 21:08:58'),('mat353','01476cbd-bb92-4716-85ac-0112aae892dd','61cf53c1-a081-47ab-b1ad-ed9f99210c7b','2023-03-08 05:33:14','2023-03-08 05:33:14'),('Choir','f528a283-4c00-4df0-939b-4a718ea5a065','7175354a-3972-45b2-b2e9-00772306a54f','2023-03-09 21:01:40','2023-03-09 21:01:40'),('Rivers United new','01476cbd-bb92-4716-85ac-0112aae892dd','7211f066-f357-4698-a7a7-3d00c8f140f1','2023-03-30 10:39:48','2023-03-30 10:39:48'),('PHE','01476cbd-bb92-4716-85ac-0112aae892dd','7edbd463-41cb-4604-a873-db0f1a686d9a','2023-03-09 21:12:02','2023-03-09 21:12:02'),('CSC301','01476cbd-bb92-4716-85ac-0112aae892dd','90dcce88-5441-42a1-95ff-ba66ea19b422','2023-03-09 21:08:12','2023-03-09 21:08:12'),('Computer Science','f528a283-4c00-4df0-939b-4a718ea5a065','93d86d9b-a300-457c-9db8-d7ae39064035','2023-03-30 10:19:29','2023-03-30 10:19:29'),('jkanfw','01476cbd-bb92-4716-85ac-0112aae892dd','95f363d9-dc1d-4cf0-b2ab-c58c61b9291e','2023-03-30 10:30:42','2023-03-30 10:30:42'),('Choir New','4c518e67-0fb2-4d71-8ed4-faad46c28d8a','a7e35722-2990-462f-9f6c-b48c0e7212b6','2023-03-30 10:38:54','2023-03-30 10:38:54'),('Math','b2f05c25-db1b-425d-9914-f6da69c61270','b23547e8-1d67-49de-87d3-60358a795833','2023-03-08 00:50:14','2023-03-08 00:50:14'),('Rivers Subject','01476cbd-bb92-4716-85ac-0112aae892dd','bb666456-a17d-4ef9-a33b-9f16310e24cf','2023-03-09 21:02:11','2023-03-09 21:02:11'),('Computer Science','01476cbd-bb92-4716-85ac-0112aae892dd','cadc9665-168e-4500-a9fc-a8446e913d5a','2023-03-30 10:31:17','2023-03-30 10:31:17'),('Computer Science','01476cbd-bb92-4716-85ac-0112aae892dd','dab61b59-8403-4258-92f9-e31860dac5cd','2023-03-30 10:23:24','2023-03-30 10:23:24'),('Plateau United','01476cbd-bb92-4716-85ac-0112aae892dd','dbdb6663-6a78-47e7-b25d-c45d29297377','2023-03-30 10:33:21','2023-03-30 10:33:21'),('Computer Science','f528a283-4c00-4df0-939b-4a718ea5a065','e1e73b6e-b86e-4f7f-a6e5-b74eab53814e','2023-03-30 10:23:10','2023-03-30 10:23:10'),('Eng','b2f05c25-db1b-425d-9914-f6da69c61270','ec8547cc-e684-4e70-9396-e65ad8d50d64','2023-03-08 00:50:31','2023-03-08 00:50:31'),('Computer Science','01476cbd-bb92-4716-85ac-0112aae892dd','f492468b-baa7-4fbd-9309-5f898a289020','2023-03-30 10:31:35','2023-03-30 10:31:35');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `name` varchar(128) NOT NULL,
  `email` varchar(128) DEFAULT NULL,
  `id` varchar(60) NOT NULL,
  `created_at` datetime NOT NULL,
  `modified_at` datetime NOT NULL,
  `password` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES ('Timothy','tim@gam.com','01476cbd-bb92-4716-85ac-0112aae892dd','2023-03-07 23:13:41','2023-03-07 23:13:41',''),('John Doe','johndoe@cbt.com','4c518e67-0fb2-4d71-8ed4-faad46c28d8a','2023-03-13 06:36:13','2023-03-13 06:36:13','pbkdf2:sha256:260000$wYg3swaZI1tHDl74$62d33039c498ac4802b1b19a6219e892fb37f54f15ea35f686dbbd449078743c'),('ola','akak@jssk.coks','b2f05c25-db1b-425d-9914-f6da69c61270','2023-03-08 00:56:00','2023-03-08 00:56:00',''),('Timothy Adeleke','admin@cbt.com','f528a283-4c00-4df0-939b-4a718ea5a065','2023-03-09 19:30:56','2023-03-09 19:30:56','pbkdf2:sha256:260000$D1Zx6TURZ1oFvwjK$b715a3e7956246a21ccb9371c7f7ee0cde96cc5f2a5e529e6a7f7cc29df897ba');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `users`
--

DROP TABLE IF EXISTS `users`;
/*!50001 DROP VIEW IF EXISTS `users`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `users` AS SELECT 
 1 AS `id`,
 1 AS `email`,
 1 AS `name`,
 1 AS `created_at`,
 1 AS `modified_at`,
 1 AS `password`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `users`
--

/*!50001 DROP VIEW IF EXISTS `users`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
-- /*!50013 DEFINER=`am_dev`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `users` AS select `teachers`.`id` AS `id`,`teachers`.`email` AS `email`,`teachers`.`name` AS `name`,`teachers`.`created_at` AS `created_at`,`teachers`.`modified_at` AS `modified_at`,`teachers`.`password` AS `password` from `teachers` union select `students`.`id` AS `id`,`students`.`email` AS `email`,`students`.`name` AS `name`,`students`.`created_at` AS `created_at`,`students`.`modified_at` AS `modified_at`,`students`.`password` AS `password` from `students` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-22 11:14:43
