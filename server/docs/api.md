# Authentication APIs

POST /api/auth/register

Description:
Registers a new user.

Request

{
    "name": "",
    "email": "",
    "password": "",
    "department": ""
}

Response

{
    "success": true,
    "message": "Registration Successful"
}