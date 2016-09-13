<?php
/**
 * Created by PhpStorm.
 * User: sav
 * Date: 2016/8/23
 * Time: 下午 02:26
 */

require_once "./_private/common.inc";


$familyName = checkInput('family_name');
$name = checkInput('name');
$gender = checkInput('gender');
$phone = checkInput('phone');
$email = checkInput('email');
$birthYear = checkInput('birth_year');
$birthMonth = checkInput('birth_month');
$birthDay = checkInput('birth_day');
$addressCounty = checkInput('address_county');
$addressZone = checkInput('address_zone');
$addressDetail = checkInput('address_detail');
$isFail = checkInput('is_fail');

$sql = "INSERT INTO `lottery` (
    `id`, `is_fail`, `family_name`, `name`, `gender`, `phone`, `email`, `birth_year`, `birth_month`, `birth_day`, `address_county`, `address_zone`, `address_detail`) VALUES (
    NULL, '$isFail', '$familyName', '$name', '$gender', '$phone', '$email', '$birthYear', '$birthMonth', '$birthDay', '$addressCounty', '$addressZone', '$addressDetail');";

$result = mysqli_query($link, $sql);
if(!$result) quit(mysqli_error($link));

quit();




// methods
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