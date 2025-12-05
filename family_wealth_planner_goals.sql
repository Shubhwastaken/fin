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
-- Table structure for table `goals`
--

DROP TABLE IF EXISTS `goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goals` (
  `goal_id` int NOT NULL AUTO_INCREMENT,
  `created_by_user_id` int NOT NULL,
  `beneficiary_member_id` int NOT NULL,
  `goal_name` varchar(255) NOT NULL,
  `target_amount` decimal(15,2) NOT NULL,
  `years_until_due` int NOT NULL,
  `horizon` enum('short','medium','long','retirement') NOT NULL,
  `expected_return` decimal(5,2) DEFAULT NULL,
  `volatility` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`goal_id`),
  KEY `created_by_user_id` (`created_by_user_id`),
  KEY `beneficiary_member_id` (`beneficiary_member_id`),
  CONSTRAINT `goals_ibfk_1` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `goals_ibfk_2` FOREIGN KEY (`beneficiary_member_id`) REFERENCES `family_members` (`member_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goals`
--

LOCK TABLES `goals` WRITE;
/*!40000 ALTER TABLE `goals` DISABLE KEYS */;
INSERT INTO `goals` VALUES (1,1,3,'Shubh Post Graduation',10000000.00,4,'long',10.00,12.00,'2025-12-04 10:55:34'),(2,1,4,'Bhoomi Post Graduation',10000000.00,2,'short',8.00,10.00,'2025-12-04 10:55:34'),(3,1,1,'Father Retirement Goal',30000000.00,12,'retirement',8.00,8.00,'2025-12-04 10:55:34'),(4,1,3,'Shubh Marriage',10000000.00,10,'long',9.00,11.00,'2025-12-04 10:55:34'),(5,1,4,'Bhoomi Marriage',10000000.00,14,'long',9.00,12.00,'2025-12-04 10:55:34'),(6,1,2,'Shelly Retirement Fund',15000000.00,15,'retirement',8.00,7.00,'2025-12-04 10:55:34'),(7,1,8,'Arjun Education Goal',5000000.00,15,'long',10.00,12.00,'2025-12-04 10:55:34'),(8,1,9,'Priya Education Goal',7000000.00,12,'long',10.00,13.00,'2025-12-04 10:55:34'),(9,1,5,'Mother Medical Reserve',2000000.00,3,'short',7.00,5.00,'2025-12-04 10:55:34'),(10,1,10,'Grandfather Health Goal',2500000.00,2,'short',6.00,5.00,'2025-12-04 10:55:34'),(11,1,1,'Rajeev Early Retirement',10000000.00,8,'long',8.50,9.00,'2025-12-04 10:55:34'),(12,1,3,'Shubh Business Fund',2000000.00,5,'medium',12.00,15.00,'2025-12-04 10:55:34');
/*!40000 ALTER TABLE `goals` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-04 16:38:37
