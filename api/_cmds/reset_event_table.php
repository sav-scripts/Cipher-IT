<?php

include "../db.inc";




$sql = "truncate events;";
$result = mysqli_query($link, $sql);
echo "clear table succes => $result </br>";

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
        $eventName = $timeDic[$time];

        $sql = "INSERT INTO `events` (`id`, `event_date`, `event_index`, `event_name`, `num_participated`) VALUES (NULL, '$date', '$time', '$eventName', '$numParticipated');";

        $result = mysqli_query($link, $sql);

        echo $sql." success => $result<br/>";
    }

}

//echo json_encode($obj);
//echo $obj[0]->date;