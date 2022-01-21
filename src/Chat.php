<?php
namespace MyApp;
require dirname(__DIR__) . '/vendor/autoload.php';
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Dotenv;
use PDO;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$user = $_ENV['USER_MYSQL'];
$pswd = $_SERVER['PWSD_MYSQL'];

class Chat implements MessageComponentInterface {
    protected $clients;
    protected $users = array();

    protected $mysql_user;
    protected $mysql_pswd;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->mysql_user = $_ENV['USER_MYSQL'];
        $this->mysql_pswd = $_ENV['PWSD_MYSQL'];
    }
    //fonction json
    protected function New_Message($event,$content = null,$users = null) {
        //création du tableau message
        $msg = array();
        $msg["event"] = $event;
        if ($content != null)
            $msg["content"] = $content;
        if ($users != null)
            $msg["users"] = $users;
        return json_encode($msg);
    }

    public function onOpen(ConnectionInterface $conn) {
        $query = $conn->httpRequest->getUri()->getQuery();
        parse_str($query,$get_array);
        //vérification que le pseudo est correct
        if ($get_array["pseudo"] == "" || in_array($get_array["pseudo"], $this->users)) {
            $conn->send($this->New_Message("pseudo_incorect"));
        }
        else {
            // Store the new connection to send messages to later
            $this->clients->attach($conn);
            $this->users[$conn->resourceId] = $get_array["pseudo"];
            //envoie d'actualisation des pseudo à tout les user
            foreach ($this->clients as $client) {
                // envoie d'ordre d'actualisation à tout les users connecté
                $client->send($this->New_Message("users",null, array_values ($this->users)));
            }
            echo "New connection! n°{$conn->resourceId} name {$this->users[$conn->resourceId]}\n";
        }
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $message = json_decode($msg,true);
        // si nouveau message
        if ($message["event"] === "new_message") {
            try
            {
                // On se connecte à MySQL
                $bdd = new PDO('mysql:host=localhost;dbname=historique;charset=utf8', $this->mysql_user, $this->mysql_pswd);
            }
            catch(Exception $e)
            {
                // En cas d'erreur, on affiche un message et on arrête tout
                    die('Erreur : '.$e->getMessage());
            }
            //vérification des donnée de l'utilisateur
            if ($message['pseudo'] != iconv('windows-1250', 'utf-8', $message['pseudo'])){
                $from->send($this->New_Message("pseudo_incorect"));
            }
            else {
                // ecriture dans la base de donnée
                $req = $bdd->prepare('INSERT INTO messages(user,txt) VALUES(:pseudo, :txt)');
                $req->execute(array(
                    'pseudo' => htmlspecialchars($message['pseudo']),
                    'txt' =>  htmlspecialchars($message['text'])
                ));
                foreach ($this->clients as $client) {
                    // envoie d'ordre d'actualisation à tout les users connecté
                    $client->send($this->New_Message("ping"));
                }
            }
        }
        //si demande d'actualisation
        elseif ($message["event"] === "historique") {
            //essai de connexion à la bdd
            try {
                // On se connecte à MySQL
                $bdd = new PDO('mysql:host=localhost;dbname=historique;charset=utf8', $this->mysql_user, $this->mysql_pswd);
            }
            catch(Exception $e) {
                // En cas d'erreur, on affiche un message et on arrête tout
                die('Erreur : '.$e->getMessage());
            }
            //préparation de la requête personaliser
            if ($message['index'] == 0) { 
                $req = $bdd->query('SELECT id,user,txt FROM (SELECT * FROM messages ORDER BY id DESC LIMIT 50) sub ORDER BY id ASC');
            }
            else {
                $req = $bdd->prepare('SELECT id,user,txt FROM messages WHERE id > :id');
                $req->execute(array('id' => $message["index"]));
            }
            $messages = array();
            //extraction des message
            while($donnée = $req->fetch())
            {
                array_push($messages,array("index"=>$donnée["id"],"pseudo"=>htmlspecialchars($donnée["user"]),"txt"=>htmlspecialchars($donnée["txt"])));
            }
            // renvoie des nouveaux messages
	    if (!empty($messages)) {
            	$from->send($this->New_Message("message", $messages));
	    }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        // The connection is closed, remove it, as we can no longer send it messages
        $this->clients->detach($conn);
        unset($this->users[$conn->resourceId]);
        //envoie d'actualisation des pseudo à tout les user
        foreach ($this->clients as $client) {
            // envoie d'ordre d'actualisation à tout les users connecté
            $client->send($this->New_Message("users",null, array_values ($this->users)));
        }
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
}
