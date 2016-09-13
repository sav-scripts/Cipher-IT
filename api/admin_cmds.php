<?php

require_once "./_private/common.inc";


//exit(microtime(true));

if(!isset($_POST["cmd"]))
{
    quit("lack cmd");
}

$cmd = $_POST["cmd"];


session_start();
//start_session(10);

//$_SESSION['login_user'] = 'john';
//$_SESSION['login_time'] = microtime(true);

if($cmd == 'logout')
{
    unset($_SESSION['login_user']);
    unset($_SESSION['login_time']);
    response();
}


$loginUser = __check_login();

if($cmd != "check_login" && $cmd != "login" && $loginUser == '')
{
    quit("尚未登入或連線逾時");
}

switch($cmd)
{
    case "check_login": response($loginUser); break;

    case "login": login(); break;

    case "get_event_data": get_event_data(); break;

    case "get_all_participate_data": get_all_participate_data(); break;

    case "get_lottery_data": get_lottery_data(); break;

    case "change_participate_able": change_participate_able(); break;

    default: quit("uknown cmd: ['$cmd']");
}


/** methods **/
function get_lottery_data()
{
    $pageIndex = getInput('page_index');
    $pageSize = getInput('page_size');
    $mode = getInput('mode');

    $firstIndex = $pageIndex * $pageSize;

    $limit = "";

    if($pageSize != 0) $limit = "LIMIT $firstIndex,$pageSize";

    global $link;

    if($mode == 'view')
    {
        $sql = "SELECT SQL_CALC_FOUND_ROWS * FROM `lottery` ".$limit;
    }
    else if($mode == 'lottery_success')
    {
        $sql = "SELECT SQL_CALC_FOUND_ROWS * FROM `lottery` WHERE `lottery`.`is_fail` = 0 GROUP BY `phone` ORDER BY rand() ".$limit;
    }
    else if($mode == 'lottery_all')
    {
        $sql = "SELECT SQL_CALC_FOUND_ROWS * FROM `lottery` GROUP BY `phone` ORDER BY rand() ".$limit;
    }
    else
    {
        quit("unknown mode: $mode");
    }



    $result = mysqli_query($link, $sql);

    $NORResult=mysqli_query($link,"Select FOUND_ROWS()");
    $NORRow=mysqli_fetch_array($NORResult);
    $NOR=$NORRow["FOUND_ROWS()"];



    $rows = array();
    while($r = mysqli_fetch_assoc($result)) {
        $rows[] = $r;
    }

    $response = (object)["data" => $rows, "num_entries" => $NOR];

    response($response);
}

function change_participate_able()
{
    $id = @$_POST['id'];
    $participateAble = @$_POST['participate_able'];

    if($id == '' || $participateAble == '')
    {
        quit('lack params');
    }
    else
    {
        global $link;
        $sql = "UPDATE `events` SET `participate_able` = '$participateAble' WHERE `events`.`id` = $id;";
        $result = mysqli_query($link, $sql);

        if(!$result) quit(mysqli_error($link));
        response($participateAble);
    }

}
function get_all_participate_data(){

    global $link;

    $sql = "SELECT * FROM `participate`";
    $result = mysqli_query($link, $sql);

    $rows = array();
    while($r = mysqli_fetch_assoc($result)) {
        $rows[] = $r;
    }


    response($rows);
}
function get_event_data(){

    global $link;

    $sql = "SELECT * FROM `events`";
    $result = mysqli_query($link, $sql);

    $rows = array();
    while($r = mysqli_fetch_assoc($result)) {
        $rows[] = $r;
    }


    response($rows);
}

function check_login()
{
    $user = __check_login();
    response($user);
}

function __check_login()
{
    $timeout = 3600;
    if(isset($_SESSION['login_user']) && isset($_SESSION['login_time']))
    {
        $dtime = microtime(true) - $_SESSION['login_time'];

//        return $dtime;

        if($dtime > $timeout)
        {
            unset($_SESSION['login_user']);
            unset($_SESSION['login_time']);

//            return $dtime;
            return '';
        }
        else
        {
            return $_SESSION['login_user'];
        }
    }
    else
    {
        return '';
    }
}

function login()
{
    if(isset($_SESSION['login_user']))
    {
        response($_SESSION['login_user']);
    }

    if (empty($_POST['username']) || empty($_POST['password'])) {

        quit("帳號或密碼不正確");
    }
    else
    {
        $username=$_POST['username'];
        $password=$_POST['password'];

        global $link;

// To protect MySQL injection for Security purpose
        $username = stripslashes($username);
        $password = stripslashes($password);
        $username = mysqli_real_escape_string($link, $username);
        $password = mysqli_real_escape_string($link, $password);

        $sql = "select * from login where user_password='$password' AND user_name='$username'";
        $result = mysqli_query($link, $sql);

        if(!$result) quit(mysqli_error($link));

        $rows = mysqli_num_rows($result);

        if ($rows == 1)
        {
            $_SESSION['login_user'] = $username;
            $_SESSION['login_time'] = microtime(true);
            quit();
        }
        else
        {
            quit("帳號或密碼不正確");
        }
    }
}


function getInput($fieldName)
{
    if (!isset($_POST[$fieldName])) {
        quit("lack field: [$fieldName]");
    }

    return $_POST[$fieldName];
}