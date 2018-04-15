<?php
/*
  utopian api wrapper at server side
  thanks to @wehmoen for providing me api key
*/
define("ORIGIN", "");
define("API_KEY", "");
define("API_KEY_ID", "");

function CallAPI($url, &$error, $data = null, $headers = null) {
  $curl = curl_init($url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
  if ($headers) {
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
  }
  curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "GET");
  $response = curl_exec($curl);
  $data = json_decode($response);

  /* Check for 404 (file not found). */
  $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
  // Check the HTTP Status code
  switch ($httpCode) {
    case 200:
        $error = 200;
        break;
    case 404:
        $error = 404;
        break;
    case 500:
        $error = 500;
        break;
    case 502:
        $error = 502;
        break;
    case 503:
        $error = 503;
        break;
    default:
        $error = $httpCode;
        break;
  }
  curl_close($curl);
  return ($data);  
}    

$api = $_GET['api'] ?? '';
if (!$api) {
  die();
}

$headers = array("Origin: " . ORIGIN, "x-api-key: " . API_KEY, "x-api-key-id: " . API_KEY_ID);
$err = '';
$data = CallAPI($api, $err, null, $headers);
header("Access-Control-Allow-Origin: *");  
header('Content-Type: application/json');
if ($err === 200) {
  die(json_encode($data));
} else {
  die(json_encode(array("error" => $err, "raw" => $data)));
}
  
