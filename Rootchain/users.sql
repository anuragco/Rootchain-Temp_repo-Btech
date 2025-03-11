-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:4306
-- Generation Time: Mar 11, 2025 at 09:29 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rootchain`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `user_type` enum('buyer','seller') DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `auth` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `user_type`, `password`, `created_at`, `auth`) VALUES
(1, 'Anurag Anand', 'aws.anu.co@gmail.com', 'buyer', '123', '2025-03-11 19:14:54', NULL),
(2, 'Anurag Anand', 'aws.an2.co@gmail.com', NULL, '123', '2025-03-11 19:24:21', NULL),
(3, 'Anurag Anand', 'aws.an3.co@gmail.com', 'seller', '$2b$10$K74hZtidXcTZ4NYgCsSTsuvPwrS84LreWD6cJqvMnEIdxuhxrJ5/m', '2025-03-11 19:25:33', '515d1647-c776-4027-8c59-47e0a2b276bd'),
(4, 'Anurag ANand', 'demo@gmail.com', NULL, '$2b$10$y7H1CagLMbfJTTkkNW1BWO.JiFFVgB/KB0gcV0MocwLdLfLKv918C', '2025-03-11 19:40:57', NULL),
(5, 'Anurag NAand', 'aws.anu4.co@gmail.com', NULL, '$2b$10$KQF6/.62eKmUR5ph6a7OvOfzKRuVXDeFBRJOf1KY0VHTrzLIRHZ1O', '2025-03-11 19:45:33', '44c4b91e-4c33-438c-819b-3c80700f19ff');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `auth` (`auth`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
