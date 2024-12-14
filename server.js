require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { initializeSockets } = require('./sockets/socketHandler');

const app = express();
const server = http.createServer(app); // Create server instance
initializeSockets(server); // Pass server to Socket.IO

app.use(express.json());
// app.use(cors({credentials:true}))
app.use(cors({
  origin: process.env.CLIENT_ADDRESS,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(cookieParser());

// Connect to MongoDB
const uri = process.env.DB_STRING;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB!');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Middleware imports
const isVerified = require('./middlewares/isVerified');
const validateUserInput = require('./middlewares/signupValidation');
const authenticateAccessToken = require('./middlewares/authenticate_access_token');

// Routes imports
const signup = require('./routes/auth/signup');
const signin = require('./routes/auth/signin');
const mailVerify = require('./routes/auth/mail_verify');
const resendConfirmation = require('./routes/auth/resend_confirmation');
const refreshToken = require('./routes/auth/refresh_token');
const logout = require('./routes/auth/logout');

const sendFriendRequest = require('./routes/user/send_friend_request');
const acceptFriendRequest = require('./routes/user/accept_friend_request');
const getFriends = require('./routes/user/get_friends');
const getUserInfo = require('./routes/user/get_user_info');
const findPeople = require('./routes/user/find_people');

const addPeople = require('./routes/server/add_people');
const createNewServer = require('./routes/server/create_new_server');
const deleteChatFromServer = require('./routes/server/delete_chat_from_server');
const deleteServer = require('./routes/server/delete_server');
const getServerInfo=require("./routes/server/get_server_info")
const insertChatToServer = require('./routes/server/insert_chat_to_server');
const kickPeople = require('./routes/server/kick_people');
const promoteToAdmin = require('./routes/server/promote_to_admin');

const getPrivateMessage=require('./routes/messages/private/get_message')
const sendPrivateMessage=require('./routes/messages/private/send_message')

const getServerMessage=require("./routes/messages/server/get_message")
const sendServerMessage=require("./routes/messages/server/send_message")

// Auth routes
app.use('/signup', validateUserInput, signup);
app.use('/signin', isVerified, signin);
app.use('/mail_verify', mailVerify);
app.use('/resend_confirmation', resendConfirmation);
app.use('/refresh_token', refreshToken);
app.use('/logout', logout);
//User routes
app.use('/send_friend_request', authenticateAccessToken, sendFriendRequest);
app.use('/accept_friend_request', authenticateAccessToken, acceptFriendRequest);
app.use('/get_friends', authenticateAccessToken, getFriends);
app.use('/get_user_info', authenticateAccessToken, getUserInfo);
app.use('/find_people', authenticateAccessToken, findPeople);
//server routes
app.use('/add_people', authenticateAccessToken, addPeople);
app.use('/create_new_server', authenticateAccessToken, createNewServer);
app.use('/delete_chat_from_server', authenticateAccessToken, deleteChatFromServer);
app.use('/delete_server', authenticateAccessToken, deleteServer);
app.use("/get_server_info", authenticateAccessToken, getServerInfo)
app.use('/insert_chat_to_server', authenticateAccessToken, insertChatToServer);
app.use('/kick_people', authenticateAccessToken, kickPeople);
app.use('/promote_to_admin', authenticateAccessToken, promoteToAdmin);
//Messages routes
  //Private
app.use('/messages/private/get_message', authenticateAccessToken, getPrivateMessage)
app.use("/messages/private/send_message", authenticateAccessToken, sendPrivateMessage)
  //Server
app.use("/messages/server/get_message", authenticateAccessToken, getServerMessage)
app.use("/messages/server/send_message", authenticateAccessToken, sendServerMessage)


// Base route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
