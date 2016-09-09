<?php
require_once "./common.inc";

for($i=1;$i<=28;$i++)
{
    updateEventNumParticipated($i);
}

function updateEventNumParticipated($evetId)
{
    global $link;
    $sql = "SELECT COUNT(*) as num FROM `participate` WHERE event_id = '$evetId';";
    $result = mysqli_query($link, $sql);

    if(!$result) quit(mysqli_error($link));
    else
    {
        $data = mysqli_fetch_assoc($result);
        $num = $data['num'];

        $sql = "UPDATE `events` SET `num_participated` = '$num' WHERE `events`.`id` = $evetId;";
        $result = mysqli_query($link, $sql);

        if(!$result) quit(mysqli_error($link));

        echo "event id: $evetId done</br>";
    }
}