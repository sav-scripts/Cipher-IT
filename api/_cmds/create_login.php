<?php
/**
 * Created by PhpStorm.
 * User: sav
 * Date: 2016/8/23
 * Time: 下午 12:15
 */

require_once "../db.inc";

$defaultUserName = "admin";
$defaultUserPassword = "H&OCipher";


$sql = "DROP TABLE IF EXISTS `login`";
$result = mysqli_query($link, $sql);
if(!$result) quit("clear login table fail => ".mysqli_error($link), true);


$sql = "
CREATE TABLE `login` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `user_name` varchar(20) COLLATE utf8_bin NOT NULL,
 `user_password` varchar(20) COLLATE utf8_bin NOT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `uname` (`user_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin
";

$result = mysqli_query($link, $sql);
if(!$result) quit("create login table fail => ".mysqli_error($link), true);


$sql = "INSERT INTO `login` (`id`, `user_name`, `user_password`) VALUES (NULL, '$defaultUserName', '$defaultUserPassword');";
$result = mysqli_query($link, $sql);
if(!$result) quit("insert default user fail => ".mysqli_error($link), true);


quit("", true);

