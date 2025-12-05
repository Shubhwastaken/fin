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
-- Table structure for table `goal_investment_mapping`
--

DROP TABLE IF EXISTS `goal_investment_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goal_investment_mapping` (
  `map_id` int NOT NULL AUTO_INCREMENT,
  `goal_id` int NOT NULL,
  `investment_id` int NOT NULL,
  `allocation_percentage` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`map_id`),
  KEY `goal_id` (`goal_id`),
  KEY `investment_id` (`investment_id`),
  CONSTRAINT `goal_investment_mapping_ibfk_1` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`),
  CONSTRAINT `goal_investment_mapping_ibfk_2` FOREIGN KEY (`investment_id`) REFERENCES `investments` (`investment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goal_investment_mapping`
--

LOCK TABLES `goal_investment_mapping` WRITE;
/*!40000 ALTER TABLE `goal_investment_mapping` DISABLE KEYS */;
INSERT INTO `goal_investment_mapping` VALUES (1,1,1,50.00),(2,1,2,50.00),(3,2,8,80.00),(4,3,1,20.00),(5,3,3,60.00),(6,3,4,20.00),(7,4,5,70.00),(8,5,9,60.00),(9,6,4,40.00),(10,7,10,50.00),(11,8,7,40.00),(12,12,7,90.00);
/*!40000 ALTER TABLE `goal_investment_mapping` ENABLE KEYS */;
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
