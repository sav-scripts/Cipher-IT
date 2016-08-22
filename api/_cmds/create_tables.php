<?php
include "../db.inc";


$sql = "DROP TABLE IF EXISTS `events`";
$result = mysqli_query($link, $sql);
if(!$result) quit(mysqli_error($link), true);


$sql = "CREATE TABLE `events` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `event_date` varchar(10) COLLATE utf8_bin NOT NULL,
 `event_index` int(2) NOT NULL,
 `event_name` varchar(100) COLLATE utf8_bin NOT NULL,
 `num_participated` int(2) NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8 COLLATE=utf8_bin";
$result = mysqli_query($link, $sql);
if(!$result) quit(mysqli_error($link), true);


$sql = "DROP TABLE IF EXISTS `participate`";
$result = mysqli_query($link, $sql);
if(!$result) quit(mysqli_error($link), true);


$sql = "CREATE TABLE `participate` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `name` varchar(50) COLLATE utf8_bin NOT NULL,
 `gender` varchar(6) COLLATE utf8_bin NOT NULL,
 `phone` int(10) NOT NULL,
 `email` varchar(100) COLLATE utf8_bin NOT NULL,
 `birth_year` int(4) NOT NULL,
 `birth_month` int(2) NOT NULL,
 `birth_day` int(2) NOT NULL,
 `event_date` varchar(10) COLLATE utf8_bin NOT NULL,
 `event_index` int(2) NOT NULL,
 `event_name` varchar(50) COLLATE utf8_bin NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin";
$result = mysqli_query($link, $sql);
if(!$result) quit(mysqli_error($link), true);


quit('', true);