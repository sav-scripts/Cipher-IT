<?php


$link = mysqli_connect('localhost', 'ogilvyrw_ciphsql', '13=(1nFtks1R', 'ogilvyrw_cipher');
mysqli_set_charset($link, "utf8");

if (mysqli_connect_errno())
{
    quit('fail to connect data base');
}


function quit($error = '', $outputAsText = false)
{
    global $link;
    if(isset($link))
    {
        mysqli_close($link);
    }

    if($error == 1 || !$error)
    {
        if($outputAsText) exit("success");
        $res = (object)['error' => ''];
    }
    else
    {
        if($outputAsText) exit($error);
        $res = (object)['error' => $error];
    }

    exit(json_encode($res));
}

function response($data = '', $responseName = 'data')
{
    global $link;
    if(isset($link))
    {
        mysqli_close($link);
    }

    $res = (object)['error' => '', $responseName => $data];
    exit(json_encode($res));
}


function start_session($expire = 0)
{
    if ($expire == 0) {
        $expire = ini_get('session.gc_maxlifetime');
    } else {
        ini_set('session.gc_maxlifetime', $expire);
    }

    if (empty($_COOKIE['PHPSESSID'])) {
        session_set_cookie_params($expire);
        session_start();
    } else {
        session_start();
        setcookie('PHPSESSID', session_id(), time() + $expire);
    }
}