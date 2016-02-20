var express = require('express');
var http = require('http'); 
var path = require('path');
var serverSocket = require('socket.io');
var logger = require('morgan');

var app = express();

//configure app for production
var port = process.env.PORT || 3000;
app.set('port', port);

//use static plain HTML file
app.use(express.static(path.join(__dirname, 'public')));

//configure logger for development
app.use(logger('dev'));

//setup express server
var server = http.createServer(app).listen(app.get('port'), function(){
    console.log("Server listening on port " + app.get('port'));
});

//start socket.io
var io = serverSocket.listen(server);

//handle traffic
io.sockets.on('connection', function (socket) {
    
    //handle setNickName event from the client
    socket.on('setNickName', function(nick) {
        //store nickname on the socket object
        socket.nickname = nick;
    });
    
    //handle sendMessage event from the client
    socket.on('sendMessage', function(data) {
        
        //fetch nickname from socket
        var nick = socket.nickname ? socket.nickname : 'Anonymous';
        
        //make payload object to send to the client
        var payload = {
            message: data.message,
            nick: nick
        };
        
        //emit sendMessage on the socket
        socket.emit('sendMessage', payload);
        
        //send sendMessage event to other sockets
        socket.broadcast.emit('sendMessage', payload);
    });

});