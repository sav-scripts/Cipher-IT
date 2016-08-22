<?php

function quit($error = '', $outputAsText = false)
{

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

$link = mysqli_connect('localhost', 'ogilvyrw_ciphsql', '13=(1nFtks1R', 'ogilvyrw_cipher');
mysqli_set_charset($link, "utf8");

if (mysqli_connect_errno())
{
    quit('fail to connect data base');
}
?>