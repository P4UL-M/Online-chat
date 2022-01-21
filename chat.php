<?php 
    if(isset($_COOKIE['pseudo']) == FALSE)
    {
        header('Location: pseudo');
        exit();
    }
?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="https://deway.fr/chat/style.css" />
    <link rel="icon" href="P.gif">
    <title><?php 
    if(isset($_COOKIE['pseudo']))
    {
        echo htmlspecialchars($_COOKIE["pseudo"]);
    }
    else
    {
        echo htmlspecialchars($pseudoTest); 
    }
    ?>'s channel</title>
</head>

<body>
    <div id="conteneur">
        <!-- case à coté une -->
        <aside>
            <h1>
                Poool's Chat
            </h1>
            <p id="description">
                Nouveau chat en ligne mit en service depuis le 15/08/2020
                <br>
                Dernière maj le 06/11/2021
            </p>

            <div id="tableau_des_connections">
                <strong>En ligne :</strong>
                <p id="connectés">
                </p>
            </div>

            <a id="changePseudo" href="change_pseudo.php">
                changer de pseudo
            </a>
        </aside>

        <!-- espace principale -->
        <div id="principale">
            <p id="historique">
            </p>

            <style id="modify_style">
            </style>

            <footer>
                <form id="zone_message" method="POST">
                    <textarea name="textarea" id="textarea" placeholder="blabla...." autofocus></textarea>
                    <button id="button" type="submit"><span>Envoyer </span></button>
                </form>
            </footer>
        </div>
    </div>
    <script src="script.js"></script>
</body>

</html>
