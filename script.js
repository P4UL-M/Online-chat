//variable html
var historique = document.getElementById("historique");
var button = document.getElementById("button").firstChild;
var myForm = document.getElementById('zone_message');
var Style = document.getElementById('modify_style');
var connecté = document.getElementById('connectés');
//variable globale
var max_index = [0];
var scroll_auto = true;
var last_pos_scroll = 0;
var compteur = 0;
var lastNotification = null;

//initialisation des annimation de chargement
button.innerHTML = '';
disable_Anim();

//récupération du pseudo
var pseudo = document.cookie.split(";");
for (i = 0; i < pseudo.length; i++) {
    if (pseudo[i].includes("pseudo")) {
        pseudo = decodeURI(pseudo[i].split("").splice(7).join(""));
        break;
    }
};

//lancement de la websocket
connect();

//demande des permission de notification
window.addEventListener('load', function () {
    if (window.Notification && Notification.permission == "default") {
        Notification.requestPermission(function (status) {
            if (Notification.permission !== status)
                Notification.permission = status;
        });
    }
});

//boutton
myForm.addEventListener('submit', function (e) {
    if (button.innerHTML == "Envoyer ") {
        var message = document.getElementById("textarea")
        var match = message.value.match(/\n/g);
        if (message.value !== "" && !match) {
            //nettoyage de la zone de texte 
            var valeur = message.value;
            message.value = "";
            // communication avec le serveur
            var myJSON = { "event": "new_message", "pseudo": pseudo, "text": valeur };
            server.send(JSON.stringify(myJSON));
        }
    }
    e.preventDefault();
});

//raccourcis
document.addEventListener('keypress', function (e) {
    if (button.innerHTML == "Envoyer ") {
        var message = document.getElementById("textarea")
        var match = message.value.match(/\n/g);
        if (e.keyCode == 13 && message.value !== "" && !match) {
            //nettoyage de la zone de texte 
            var valeur = message.value;
            message.value = "";
            // communication avec le serveur
            var myJSON = { "event": "new_message", "pseudo": pseudo, "text": valeur };
            server.send(JSON.stringify(myJSON));
            e.preventDefault();
        }
        else if (e.keyCode == 13) {
            e.preventDefault();
        }
    }
    else {
        e.preventDefault();
    }
});

//fonction de lancement nouvelle connection de websocket
function connect() {
    //lancement de la websocket
    server = new WebSocket(`wss://deway.fr/wss/?pseudo=${pseudo}`);

    //lancement de l'historique
    server.onopen = function (e) {
        button.innerHTML = 'Envoyer ';
        Enable_Anim(); compteur = 0;
        var myJSON = { "event": "historique", "index": max_index[max_index.length - 1] };
        server.send(JSON.stringify(myJSON));
    };

    //actualisation
    server.onmessage = function (e) {
        message = JSON.parse(e.data);
        if (message.event == "ping") {
            var myJSON = { "event": "historique", "index": max_index[max_index.length - 1] };
            server.send(JSON.stringify(myJSON));
        }
        else if (message.event == "message") {
            message.content.forEach(element => {
                if (!max_index.includes(element.index)) {
                    historique.innerHTML += "<strong>" + decodeURI(element.pseudo) + "</strong> : " + element.txt + "<br />";
                    if (scroll_auto) {
                        historique.scrollTop = historique.scrollHeight;
                    }
                    New_notification(decodeURI(element.pseudo), element.txt)
                    max_index.push(parseInt(element.index));
                }
            });
        }
        else if (message.event == "users") {
            var update = "";
            message.users.forEach(element => {
                if (element == pseudo) {
                    update += "- <strong>" + element + "</strong>" + "<br />";
                }
                else {
                    update += "- " + element + "<br />";
                }
                connecté.innerHTML = update;
            });
        }
        else if (message.event == "pseudo_incorect") {
            document.location.href = "change_pseudo.php";
        }
    };

    //si fermeture reconnection
    server.onclose = function (e) {
        //alert l'utilisateur
        if (compteur == 15) {
            alert('Impossible de se connecter pour le moment au chat,\nil se peut que le serveur soit momentanément indisponible, réessayer plus tard.');
            compteur = 0;
        }
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function () {
            compteur += 1;
            connect();
        }, 1000);
        disable_Anim();
        if (button.innerHTML == "..." || button.innerHTML == "Envoyer ") {
            button.innerHTML = "";
        }
        button.innerHTML += '.';
    }
}

// gestion du scroll
historique.addEventListener("scroll", function (e) {
    if (last_pos_scroll > this.scrollTop) {
        scroll_auto = false
    } else if ((this.scrollTop + this.clientHeight - this.scrollHeight) > -0.05 * this.scrollHeight) {
        scroll_auto = true
    }
    last_pos_scroll = this.scrollTop;
})

// gestion de l'animation du bouton
function disable_Anim() {
    Style.innerHTML =
        `#button span:after 
        {
            content: '' !important;
        }
        #button:hover span 
        {
            padding-right: 0 !important;
        }
        #button:active span 
        {
            font-size: 15px !important;
            opacity: 1 !important;
        }`;
}
// "      "
function Enable_Anim() {
    Style.innerHTML = "";
}

//function d'envoie de notification
function New_notification(pseudo, text) {
    if (window.Notification && Notification.permission === "granted" && document.hidden) {
        var n = new Notification(pseudo, { body: text, tag: "open" });
        if (lastNotification != null) {
            if (lastNotification.tag == 'shown')
                lastNotification.close();
            else
                lastNotification.tag = "close";
        }
        lastNotification = n;
        n.onshow = function () {
            if (n.tag == "close")
                n.close.bind(n)
            else {
                n.tag = "shown";
                setTimeout(n.close.bind(n), 5000);
            }
        }
    }
}