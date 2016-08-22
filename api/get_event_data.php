<?php
include "db.inc";

$sql = "SELECT * FROM `events`";
$result = mysqli_query($link, $sql);

$rows = array();
while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
}

print json_encode($rows);