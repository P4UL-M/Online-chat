<?php
    if(isset($_COOKIE["pseudo"]))
    {
        setcookie('pseudo', "", time() - 3600);
    }
    header('Location: pseudo');
    exit();
?>
