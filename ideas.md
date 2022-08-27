Models
User

Required
\_id: ObjectId
email: String|Unique|Required
password: String|Required
name: String|Required

Not Required
sports_practiced: [String|Not Required]from drop down list
levels_sportPracticed: [Number|Not Required]
Trips: [ObjectId] Not required

Trip
\_id: ObjectId
location : String|Required --> If the time allows it the location will come through an API
activity_type: String|Drop Down List
level: String|Drop Down List
spaces: Number|Default by sport
participants: [User_id]
description: String

<!-- Web Structure -->

GET / Home Page -> Browse for Trips, Log In, Register

GET /auth/login -> Log in and click to go to register if trying to book a trip
POST /auth/login

GET /auth/register -> Register and click to login if user is already registered
POST /auth/register /user/userId
GET /user/:userId

GET /search -> List of trips that are being searched --> Maybe for later

GET /trip/:tripId -> Single Trip Information | By types, and by level
GET /trip/add -> Add a new trip to the collection
POST /trip/add

GET /trip/:tripId/request

GET /settings
GET /settings/update-user
POST /settings/update-user
GET /settings/update-password
POST /settings/update-password
