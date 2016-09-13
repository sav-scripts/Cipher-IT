<?php
require_once "./common.inc";


$sql = "DROP TABLE IF EXISTS `lottery`";
$result = mysqli_query($link, $sql);
if(!$result) quit("clear lottery table fail => ".mysqli_error($link), true);

$sql = "CREATE TABLE `lottery` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `is_fail` tinyint(1) DEFAULT '0',
 `family_name` varchar(20) COLLATE utf8_bin NOT NULL,
 `name` varchar(20) COLLATE utf8_bin NOT NULL,
 `gender` varchar(6) COLLATE utf8_bin NOT NULL,
 `phone` int(10) NOT NULL,
 `email` varchar(100) COLLATE utf8_bin NOT NULL,
 `birth_year` int(4) NOT NULL,
 `birth_month` int(2) NOT NULL,
 `birth_day` int(2) NOT NULL,
 `address_county` varchar(20) COLLATE utf8_bin NOT NULL,
 `address_zone` varchar(20) COLLATE utf8_bin NOT NULL,
 `address_detail` varchar(100) COLLATE utf8_bin NOT NULL,
 `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_bin";

$result = mysqli_query($link, $sql);
if(!$result) quit(mysqli_error($link), true);


//quit('', true);
echo "lottery reset => OK</br>";