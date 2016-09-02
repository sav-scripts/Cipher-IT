<?php

require_once "./common.inc";



$sql = "DROP TABLE IF EXISTS `events`";
$result = mysqli_query($link, $sql);
if(!$result) quit(mysqli_error($link), true);


$sql = "CREATE TABLE `events` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `event_date` varchar(10) COLLATE utf8_bin NOT NULL,
 `event_index` int(2) NOT NULL,
 `event_name` varchar(100) COLLATE utf8_bin NOT NULL,
 `num_participated` int(2) NOT NULL,
 `participate_able` tinyint(1) NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8 COLLATE=utf8_bin";
$result = mysqli_query($link, $sql);
if(!$result) quit(mysqli_error($link), true);


$sql = "DROP TABLE IF EXISTS `participate`";
$result = mysqli_query($link, $sql);
if(!$result) quit(mysqli_error($link), true);



//$sql = "truncate events;";
//$result = mysqli_query($link, $sql);
//if(!$result) quit(mysqli_error($link), true);
//echo "clear table succes => $result </br>";

$eventDays = (array) [
    0 => (object)
    [
        'date' => '9/29(四)',
        'num_participated' => [ 15, 15, 15, 15, 0, 15, 0 ]
    ],
    1 => (object)
    [
        'date' => '9/30(五)',
        'num_participated' => [ 15, 15, 15, 0, 0, 0, 0 ]
    ],
    2 => (object)
    [
        'date' => '10/01(六)',
        'num_participated' => [ 0, 0, 0, 0, 0, 0, 0 ]
    ]
];

$timeDic = (array)
[
    0 => '11:00~12:00',
    1 => '12:30~13:30',
    2 => '14:00~15:00',
    3 => '15:30~16:30',
    4 => '17:00~18:00',
    5 => '18:30~19:30',
    6 => '20:00~21:00'
];

$eventDaysCount = count($eventDays);

for ($day = 0; $day < $eventDaysCount; $day ++)
{
    $date = $eventDays[$day]->date;

    $timeArray = $eventDays[$day]->num_participated;
    $timeArrayCount = count($timeArray);

    for($time = 0; $time < $timeArrayCount; $time++)
    {
        $numParticipated = $timeArray[$time];
        $participateAble = $numParticipated == 0? 1: 0;
        $eventName = $timeDic[$time];

        $sql = "INSERT INTO `events` (`id`, `event_date`, `event_index`, `event_name`, `num_participated`, `participate_able`) VALUES (NULL, '$date', '$time', '$eventName', '0', '$participateAble');";

        $result = mysqli_query($link, $sql);
        if(!$result) quit(mysqli_error($link), true);
//        echo $sql." success => $result<br/>";
    }
}

//echo json_encode($obj);
//echo $obj[0]->date;

echo "event reset => OK</br>";