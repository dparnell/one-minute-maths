<?php

$db_file = $dir = dirname(__FILE__)."/db/database.sqlite3";
$create_db = !file_exists($db_file);

$db = new SQLite3($db_file);
if($create_db) {
    $db->exec("create table results (first_name varchar(64), last_name varchar(64), grade varchar(16), variation varchar(16), number_correct integer, time_taken real, results text, inserted_at integer)");
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, TRUE);

    if(isset($data["first_name"]) && isset($data["last_name"]) && isset($data["grade"]) && isset($data["variation"]) && isset($data["correct_count"]) && isset($data["time_taken"]) ) {
        $s = $db->prepare("insert into results(first_name, last_name, grade, variation, number_correct, time_taken, results, inserted_at) values (:first_name, :last_name, :grade, :variation, :number_correct, :time_taken, :results, :now)");
        $s->bindValue("first_name", $data["first_name"], SQLITE3_TEXT);
        $s->bindValue("last_name", $data["last_name"], SQLITE3_TEXT);
        $s->bindValue("grade", $data["grade"], SQLITE3_TEXT);
        $s->bindValue("variation", $data["variation"], SQLITE3_TEXT);
        $s->bindValue("number_correct", $data["correct_count"], SQLITE3_INTEGER);
        $s->bindValue("time_taken", floatval($data["time_taken"]), SQLITE3_FLOAT);
        $s->bindValue("results", $raw, SQLITE3_TEXT);
        $s->bindValue("now", time(), SQLITE3_INTEGER);
        $s->execute();
        $s->close();

        $result = "OK";
    } else {
        $result = "REQUIRED DATA MISSING";
    }
} else {
    $result = "INVALID REQUEST";
}


header("Content-Type: text/plain");
echo($result);

$db->close();

?>