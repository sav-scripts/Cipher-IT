<?php
/**
 * Created by PhpStorm.
 * User: sav
 * Date: 2016/8/23
 * Time: 下午 02:26
 */

require_once "./_private/common.inc";


$name = checkInput('name');
$gender = checkInput('gender');
$phone = checkInput('phone');
$email = checkInput('email');
$eventId = checkInput('event_id');
$birthYear = checkInput('birth_year');
$birthMonth = checkInput('birth_month');
$birthDay = checkInput('birth_day');

checkIfEventOk($eventId);
checkIfUserParticipated($phone);




$sql = "INSERT INTO `participate` (`id`, `name`, `gender`, `phone`, `email`, `birth_year`, `birth_month`, `birth_day`, `event_id`) VALUES (NULL, '$name', '$gender', '$phone', '$email', '$birthYear', '$birthMonth', '$birthDay', '$eventId');";
$result = mysqli_query($link, $sql);
if(!$result) quit(mysqli_error($link));

updateEventNumParticipated($eventId);


quit();




// methods
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
    }
}

function checkIfUserParticipated($phone)
{
    global $link;
    $sql = "SELECT * FROM `participate` WHERE phone = '$phone';";
    $result = mysqli_query($link, $sql);

    if(!$result) quit(mysqli_error($link));
    else
    {
        $rows = mysqli_num_rows($result);
        if($rows > 0) quit('您已經報名過囉');
    }
}

function checkIfEventOk($eventId)
{
    global $link;
    $sql = "SELECT * FROM `events` WHERE id = '$eventId' and participate_able = 1 and num_participated < 10 ";
    $result = mysqli_query($link, $sql);

    if(!$result) quit(mysqli_error($link));
    else
    {
        $rows = mysqli_num_rows($result);
        if($rows == 0) quit('該場次名額已滿');
    }
}

function checkInput($fieldName, $fieldType = null)
{
    if(!isset($_POST[$fieldName]))
    {
        quit("lack field: [$fieldName]");
    }

    if($fieldType == null) $fieldType = $fieldName;

    $value = $_POST[$fieldName];



    switch ($fieldType)
    {
        case 'phone':

            if(!preg_match('/^(09)[0-9]{8}$/', $value)) quit("手機格式不正確");
            break;

        case 'email':

            if(!preg_match('/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/', $value)) quit("電子信箱格式不正確");
            break;

        case 'event_id':

            $value = intval($value);
            break;

        case 'birth_year':

            $value = intval($value);
            if($value < 1900 || $value > 2100) quit("生日資訊不正確");
            break;

        case 'birth_month':

            $value = intval($value);
            if($value < 1 || $value > 12) quit("生日資訊不正確");
            break;

        case 'birth_day':

            $value = intval($value);
            if($value < 1 || $value > 31) quit("生日資訊不正確");
            break;

        default:
            if(preg_match("/^\s*$/", $value)) quit("欄位 [$fieldName] 不能是空值");
    }

    return $value;

}