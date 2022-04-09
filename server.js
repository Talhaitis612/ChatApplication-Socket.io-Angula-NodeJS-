// Requires the Express module just as you require other modules and and puts it in a variable

const express = require('express');

//  Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows
//  a server to indicate any origins (domain, scheme, or port) other than its own from
//  which a browser should permit loading resources.

const cors = require('cors');

// Calls the express function "express()" and puts new Express application inside the
//  app variable (to start a new Express application).

const app = express();

// The http. createServer() method creates an HTTP Server object. 
// The HTTP Server object can listen to ports on your computer and execute a function,
//  a requestListener, each time a request is made.


const http = require('http').createServer(app);

// 

const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});


app.get('/', (req, res) => {
    res.send('Heello world');
})


// creating a map of user list

let userList = new Map();
// passing an event
// connection event

io.on('connection', (socket) => {
    // the socket variable that we get has the information about your the client 
    // to get the username when connected 
    // console.log("a user is connected");
    let userName = socket.handshake.query.userName;
    console.log("a user is connected" + userName);

    addUser(userName, socket.id);

    // now let's emit an event and broadcast all the users that are connected
    // emitting the array of user-list keys with the spread operator

    socket.broadcast.emit('user-list', [...userList.keys()]);

    // to emit the user for only an indiviual  we gonna emit the same but without broadcasting
    socket.emit('user-list', [...userList.keys()]);

    // now to get the message event and broadcast it as the message 
    socket.on('message', (msg) => {
        socket.broadcast.emit('message-broadcast', { message: msg, userName: userName });
    })



    socket.on('disconnect', (reason) => {
        removeUser(userName, socket.id);
    })
});


// function to add user 
function addUser(userName, id) {
    // if the userList don't have a username then add the user to userList
    if (!userList.has(userName)) {
        userList.set(userName, new Set(id));
    }
    //    if he already exist in the list we add a new id to the map
    else {
        userList.get(userName).add(id);
    }
}

// function to remove users 
// delete the user once disconnected
function removeUser(userName, id) {
    if (userList.has(userName)) {
        let userIds = userList.get(userName);
        if (userIds.size == 0) {
            userList.delete(userName);
        }
    }
}

// http server is listening on the port 3000
http.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running ${process.env.PORT || 3000}`);
});

