<?php

include "./db.inc";

//quit(session_get_cookie_params());

session_start();


if(isset($_SESSION['login_user']))
{
    quit($_SESSION['login_user']);
}


if (empty($_POST['username']) || empty($_POST['password'])) {

    quit("lack data");
}
else
{
    $username=$_POST['username'];
    $password=$_POST['password'];

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
        $_SESSION['login_user'] = $username; // Initializing Session
        quit();
    }
    else
    {
        quit("Username or Password is invalid");
    }
}