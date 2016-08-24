<?php
require_once "./_private/common.inc";

$sql = "SELECT * FROM `events`";
$result = mysqli_query($link, $sql);

$rows = array();
while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
}

$response = (object)[
    "error" => "",
    "data" => $rows
];

exit(json_encode($response));