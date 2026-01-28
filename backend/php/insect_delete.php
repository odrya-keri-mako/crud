<?php
declare(strict_types=1);

// Include environment
require_once("../../../common/php/environment.php");

// Get arguments (data)
$args = Util::getArgs();

// Connect to MySQL server
$db = new Database('plants_and_animals');

// Set query
$query = "DELETE FROM `insects` WHERE `id` = :id;";

// Execute SQL command
$result = $db->execute($query, $args);

// Close connection
$db = null;

// Set response
Util::setResponse($result);