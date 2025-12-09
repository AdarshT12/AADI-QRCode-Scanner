<?php
// Allow cross-origin requests (optional if same origin)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");

// Get the POST data from React
$data = json_decode(file_get_contents("php://input"), true);

// Validate input
$name     = isset($data['name']) ? strip_tags($data['name']) : '';
$email    = isset($data['email']) ? strip_tags($data['email']) : '';
$password = isset($data['password']) ? strip_tags($data['password']) : '';


if (!$name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

// Prepare email
$to      = $email; 
$subject = "Your Account Credentials";
$message = "Hello $name,\n\n"
         . "Your account has been created successfully.\n"
         . "Email: $email\n"
         . "Password: $password\n"
         
$headers = "From: info@theaadi.org" ;
$headers .= "Cc: adarsh.tiwari8843@gmail.com\r\n";
    
// Send email
$sent = mail($to, $subject, $message, $headers);

if ($sent) {
    echo json_encode(["success" => true, "message" => "Mail sent successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to send mail"]);
}
?>
