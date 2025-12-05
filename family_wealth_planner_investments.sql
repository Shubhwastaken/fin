-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: family_wealth_planner
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `investments`
--

DROP TABLE IF EXISTS `investments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `investments` (
  `investment_id` int NOT NULL AUTO_INCREMENT,
  `portfolio_id` int NOT NULL,
  `member_id` int NOT NULL,
  `asset_class_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `symbol` varchar(100) DEFAULT NULL,
  `folio_number` varchar(100) DEFAULT NULL,
  `invested_value` decimal(15,2) DEFAULT NULL,
  `current_value` decimal(15,2) DEFAULT NULL,
  `units` decimal(15,4) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`investment_id`),
  KEY `portfolio_id` (`portfolio_id`),
  KEY `member_id` (`member_id`),
  KEY `asset_class_id` (`asset_class_id`),
  CONSTRAINT `investments_ibfk_1` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`portfolio_id`),
  CONSTRAINT `investments_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `family_members` (`member_id`),
  CONSTRAINT `investments_ibfk_3` FOREIGN KEY (`asset_class_id`) REFERENCES `asset_classes` (`asset_class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investments`
--

LOCK TABLES `investments` WRITE;
/*!40000 ALTER TABLE `investments` DISABLE KEYS */;
INSERT INTO `investments` VALUES (1,1,1,1,'Axis Bluechip Fund','AXIS-BLUE','FOLIO001',500000.00,650000.00,320.0000,'2025-12-04 10:55:34'),(2,1,1,1,'HDFC Flexicap Fund','HDFC-FLEX','FOLIO002',300000.00,390000.00,210.0000,'2025-12-04 10:55:34'),(3,2,1,1,'SBI Smallcap Fund','SBI-SMALL','FOLIO003',200000.00,255000.00,150.0000,'2025-12-04 10:55:34'),(4,3,2,6,'HDFC Fixed Deposit','FD-HDFC','FD001',500000.00,500000.00,1.0000,'2025-12-04 10:55:34'),(5,4,3,4,'TCS Ltd','TCS',NULL,150000.00,170000.00,20.0000,'2025-12-04 10:55:34'),(6,4,3,4,'Infosys Ltd','INFY',NULL,100000.00,105000.00,12.0000,'2025-12-04 10:55:34'),(7,5,3,4,'Tata Motors','TATAMOT',NULL,70000.00,90000.00,15.0000,'2025-12-04 10:55:34'),(8,6,4,1,'Kotak Emerging Fund','KOTAK-EM','FOLIO004',80000.00,92000.00,60.0000,'2025-12-04 10:55:34'),(9,7,5,7,'Government Bond 2030','GOVBND',NULL,300000.00,315000.00,300.0000,'2025-12-04 10:55:34'),(10,8,6,4,'Reliance Industries','RELIANCE',NULL,120000.00,138000.00,10.0000,'2025-12-04 10:55:34'),(11,9,7,5,'SBI Gold ETF','GOLD-SBI','GOLD001',200000.00,230000.00,50.0000,'2025-12-04 10:55:34'),(12,10,10,6,'Post Office MIS','POMIS',NULL,100000.00,100000.00,1.0000,'2025-12-04 10:55:34');
/*!40000 ALTER TABLE `investments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-04 16:38:38
