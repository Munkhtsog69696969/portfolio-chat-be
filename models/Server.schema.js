const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
    server_name: {
        type: String,
        required: [true, "Name is required!"],
        minlength: [3, "Server name must be at least 3 characters long!"],
        maxlength: [30, "Server name cannot be longer than 30 characters!"],
        unique:true,
        trim:true,
    },
    owners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    messages:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"ServerMessage"
    }],
    createdAt: { type: Date, default: Date.now },
});

// Compile schema into a model
const Server = mongoose.model("Server", serverSchema);

module.exports = Server;
