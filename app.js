require('dotenv').config()
const express = require('express');
const connecToMongo = require('./db');
const userRoutes = require('./Routes/UserRoute');
const docsRoutes = require('./Routes/DocsRoute');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const { AuthenticateUser } = require('./Middlewares/Authentication');
const Docs = require('./Models/Docs');


const app = express();
const PORT = process.env.PORT || 8000;
const mongoURL = process.env.DATABASE_URI
connecToMongo(mongoURL);

app.use(express.json());
app.use(cors())

app.use('/docs', docsRoutes);
app.use('/user', userRoutes);      //Login and Registration routes


const server = http.createServer(app);   //initialise app useing http server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


const TextEditor = io.of('/textEditor');
const Dashboard = io.of('/Home');

Dashboard.use(AuthenticateUser); //Authenticate Eack socket at dashboard
TextEditor.use(AuthenticateUser); //Authenticate Eack socket at texteditor

TextEditor.on('connection', (socket) => {
    try {
        const documentID = socket.handshake.query.documentID;

        //Bind socket to specific id called documentID
        socket.join(documentID);

        //Recieving changes from clientSide and sending back to other sockets connected
        socket.on('send-changes', (delta) => {
            socket.broadcast.to(documentID).emit('recive-change', delta)
        });

        //Sending whole document back to client by authenticating the client
        socket.on('getDocument', async () => {
            const docs = await Docs.findOne({ _id: documentID });
            const userAllowed = docs.userAllowed.find((user) => user.email === socket.user.email);
            if (!docs) {
                return socket.emit('loadDocument', "Not found")
            }
            if (String(docs.owner) !== socket.user._id && !userAllowed) {
                return socket.emit('loadDocument', "Unauthorized Access");
            }
            socket.emit('loadDocument', docs);
        });

        //Save changes in document
        socket.on('saveChanges', async (documentContent) => {
            await Docs.findByIdAndUpdate(documentID, { data: documentContent });
        })

        //Save document title
        socket.on('saveTitle', async (title) => {
            await Docs.findByIdAndUpdate(documentID, { title: title });
        })

        //Broadcast change in title to all other connected sockets
        socket.on('titleChange', (title) => {
            socket.broadcast.to(documentID).emit('titleChange', title);
        })
    } catch (error) {
        console.log(error.message);
        return;
    }
});


Dashboard.on('connection', async (socket) => {
    try {
        socket.join(socket.user._id);

        //Add new Docs of the connected user
        socket.on('AddNewDocs', async () => {
            const docs = await Docs.create({
                owner: socket.user._id
            });
            socket.emit('response', docs._id);
            let docsList = await Docs.find().select("-data").populate("owner");
            docsList = docsList.filter((docs) => String(docs.owner._id) === socket.user._id || docs.userAllowed.findIndex((user) => user.email === socket.user.email) != -1);
            socket.broadcast.to(socket.user._id).emit('getDocs', docsList);
        });

        //Send docList of the connected user
        socket.on('getDocs', async () => {
            let docsList = await Docs.find().select("-data").populate("owner");
            docsList = docsList.filter((docs) => String(docs.owner._id) === socket.user._id || docs.userAllowed.findIndex((user) => user.email === socket.user.email) != -1);
            socket.emit('getDocs', docsList);
        });
    } catch (error) {
        console.log(error.message);
        return;
    }

})

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));