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
-- Table structure for table `investment_transactions`
--

DROP TABLE IF EXISTS `investment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `investment_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `investment_id` int NOT NULL,
  `date` date NOT NULL,
  `type` enum('buy','sell','sip','dividend','split','bonus') NOT NULL,
  `units` decimal(15,4) DEFAULT NULL,
  `price_per_unit` decimal(15,4) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `investment_id` (`investment_id`),
  CONSTRAINT `investment_transactions_ibfk_1` FOREIGN KEY (`investment_id`) REFERENCES `investments` (`investment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investment_transactions`
--

LOCK TABLES `investment_transactions` WRITE;
/*!40000 ALTER TABLE `investment_transactions` DISABLE KEYS */;
INSERT INTO `investment_transactions` VALUES (1,1,'2024-01-10','sip',20.0000,1562.5000,31250.00,'2025-12-04 10:55:34'),(2,1,'2024-02-10','sip',20.0000,1580.2000,31604.00,'2025-12-04 10:55:34'),(3,2,'2024-03-05','buy',50.0000,1450.0000,72500.00,'2025-12-04 10:55:34'),(4,3,'2024-01-10','sip',10.0000,1320.0000,13200.00,'2025-12-04 10:55:34'),(5,4,'2023-12-01','buy',1.0000,500000.0000,500000.00,'2025-12-04 10:55:34'),(6,5,'2024-01-15','buy',10.0000,7500.0000,75000.00,'2025-12-04 10:55:34'),(7,6,'2024-02-02','buy',12.0000,8200.0000,98400.00,'2025-12-04 10:55:34'),(8,7,'2024-02-20','buy',15.0000,4667.0000,70000.00,'2025-12-04 10:55:34'),(9,8,'2023-12-10','buy',60.0000,1333.0000,80000.00,'2025-12-04 10:55:34'),(10,9,'2023-11-07','buy',300.0000,1000.0000,300000.00,'2025-12-04 10:55:34'),(11,10,'2024-01-28','buy',10.0000,12000.0000,120000.00,'2025-12-04 10:55:34'),(12,11,'2023-12-23','buy',50.0000,4000.0000,200000.00,'2025-12-04 10:55:34');
/*!40000 ALTER TABLE `investment_transactions` ENABLE KEYS */;
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
