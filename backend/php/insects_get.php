<?php
declare(strict_types=1);

// Include environment
require_once("../../../common/php/environment.php");

// Connect to MySQL server
$db = new Database('plants_and_animals'); 

// Set query
$query ="SELECT `id`,
                `name`,
                 REPLACE(TO_BASE64(`img`), '\n', '') AS `img`,
								`img_type`,
                `type`,
                `metamorphosis`,
                `role`,
                `active_months`,
                `utility_level`
           FROM `insects`;";

// Execute SQL command
$result = $db->execute($query);

// Close connection
$db = null;

// Set response
Util::setResponse($result);