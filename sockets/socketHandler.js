const { Server } = require("socket.io");
const decode_access_token = require("../utils/jwt/access_token/decode_access_token");
const PrivateMessage = require("../models/PrivateMessage.schema");
const ServerMessage = require("../models/ServerMessage.schema");
const ServerModel = require("../models/Server.schema");
const User=require("../models/User.schema")

function initializeSockets(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_ADDRESS,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication error: No token provided"));

        try {
            const decoded = await decode_access_token(token);
            if (!decoded.valid) return next(new Error(`Authentication error: ${decoded.error || 'Invalid token'}`));

            socket.user = decoded.payload;
            next();
        } catch (error) {
            return next(new Error(`Authentication error: ${error.message}`));
        }
    });

    const connectedUsers = new Map();

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("set-user", (user) => {
            if (!user) return;

            connectedUsers.set(socket.id, user);

            const usersWithThisUserAsFriend = Array.from(connectedUsers.values()).filter(
                connectedUser =>
                    connectedUser.friends &&
                    connectedUser.friends.some(friend => friend.email === user.email)
            );

            usersWithThisUserAsFriend.forEach(friendUser => {
                const socketId = Array.from(connectedUsers.entries())
                    .find(([id, u]) => u.email === friendUser.email)?.[0];
                if (socketId) {
                    io.to(socketId).emit("friend-online", user);
                }
            });

            const onlineFriends = user.friends.filter(friend =>
                Array.from(connectedUsers.values()).some(
                    connectedUser => connectedUser.email === friend.email
                )
            );

            socket.emit("show-user-friends-online", onlineFriends);
        });

        socket.on("send-private-message", async ({ receiverId, message }) => {
            const userId = socket.user.id;
            if (!userId || !receiverId || !message) return;

            const newMessage = new PrivateMessage({
                senderId: userId, 
                receiverId, 
                message:message.message, 
                senderName:message.senderName 
            });
            await newMessage.save();

            const receiverSocketId = Array.from(connectedUsers.entries()).find(
                ([, user]) => user._id === receiverId
            )?.[0];

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receive-private-message", {
                    _id: newMessage._id,
                    senderId: userId,
                    senderName:message.senderName,
                    receiverId,
                    message:message.message,
                    timestamp: newMessage.timestamp,
                });
            }
        });

        socket.on("send-server-message", async ({ serverId, message }) => {
            const userId = socket.user.id;
            if (!userId || !serverId || !message) return;

            // console.log("socket server message",message)

            const newServerMessage = new ServerMessage({
                serverId,
                senderId: userId,
                senderName:message.senderName,
                message:message.message,
            }); 

            await newServerMessage.save();

            const server = await ServerModel.findById(serverId).populate("members owners");

            if (!server) return;

            server.messages.push(newServerMessage._id);
            await server.save();

            const onlineMemberSocketIds = Array.from(connectedUsers.entries())
                .filter(([_, user]) =>
                    server.members.some(member => member._id.toString() === user._id) ||
                    server.owners.some(owner => owner._id.toString() === user._id)
                )
                .map(([socketId]) => socketId);

            onlineMemberSocketIds.forEach(socketId => {
                io.to(socketId).emit("receive-server-message", {
                    _id: newServerMessage._id,
                    senderId: userId,
                    senderName:message.senderName,
                    message:message.message,
                    timestamp: newServerMessage.timestamp,
                });
            });
        });

        socket.on("send-friend-request",async({toUserId})=>{
            const userId=socket.user.id

            if(!userId || !toUserId) return 

            if(userId==toUserId) return 

            const reciever=await User.findById(toUserId)

            if(!reciever) return 

            const receiverSocketId = Array.from(connectedUsers.entries()).find(
                ([, user]) => user._id === toUserId
            )?.[0];

            if(receiverSocketId){
                io.to(receiverSocketId).emit("receive-friend-request",{getUserInfo:true})
            }
        })

        socket.on("add-people-to-server",async({toUserId})=>{
            const userId=socket.user.id

            if(!userId || !toUserId) return 

            if(userId==toUserId) return 

            const reciever=await User.findById(toUserId)

            if(!reciever) return 

            const receiverSocketId = Array.from(connectedUsers.entries()).find(
                ([, user]) => user._id === toUserId
            )?.[0];

            if(receiverSocketId){
                io.to(receiverSocketId).emit("receive-add-to-server",{getUserInfo:true})
            }
        })

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
            const disconnectingUser = connectedUsers.get(socket.id);
            connectedUsers.delete(socket.id);

            if (disconnectingUser) {
                const usersWithThisUserAsFriend = Array.from(connectedUsers.values()).filter(
                    connectedUser =>
                        connectedUser.friends &&
                        connectedUser.friends.some(friend => friend.email === disconnectingUser.email)
                );

                usersWithThisUserAsFriend.forEach(friendUser => {
                    const socketId = Array.from(connectedUsers.entries())
                        .find(([id, u]) => u.email === friendUser.email)?.[0];
                    if (socketId) {
                        io.to(socketId).emit("friend-offline", disconnectingUser);
                    }
                });
            }
        });
    });
}

module.exports = { initializeSockets };
