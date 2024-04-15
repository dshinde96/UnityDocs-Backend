const express = require('express');
const router = express.Router();
const { AuthenticateUserforHTTPReq } = require('../Middlewares/Authentication');
const Docs = require('../Models/Docs');
const User = require('../Models/User');


//Router:Login required: returns AllowedUser of the document
router.get('/getAllowedUsers/:id', AuthenticateUserforHTTPReq, async (req, res) => {
    try {
        const documentID = req.params.id;
        const document = await Docs.findOne({ _id: documentID });
        
        if (req.user._id !== String(document.owner))
            return res.status(401).json({ msg: "Access Denied" });

        if (!document)
            return res.status(404).json({ msg: "Document Not Found" });

        return res.json({ userAllowed: document.userAllowed, msg: "userAllowed Successfully fetched" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }

});

//Router:Login required: Add an user to allowed users of the document
router.post('/addAllowedUser/:id', AuthenticateUserforHTTPReq, async (req, res) => {
    const documentID = req.params.id;
    const document = await Docs.findOne({ _id: documentID });

    const { email } = req.body;

    if (email === req.user.email) {
        return res.status(401).json({ msg: "Owner already have the access of the document" })
    }

    if (req.user._id !== String(document.owner))
        return res.status(401).json({ msg: "Access Denied" });

    if (!document)
        return res.status(404).json({ msg: "Document Not Found" });

    const user = await User.findOne({ email });
    if (!user)
        return res.status(404).json({ msg: "User you are trying to add is not found" });

    const index = document.userAllowed.findIndex((user) => user.email === email);
    if (index !== -1) {
        return res.status(404).json({ msg: "User already added to allowedusers" })
    }

    document.userAllowed.push({ name: user.name, email });
    await Docs.findByIdAndUpdate(documentID, { $set: document });

    return res.json({userAllowed:document.userAllowed, msg: "User added to allowedusers" });

});

//Router:Login required: dlete an user from allowedUsers of the document
router.post('/deleteAllowedUser/:id', AuthenticateUserforHTTPReq, async (req, res) => {
    const documentID = req.params.id;
    const document = await Docs.findOne({ _id: documentID });

    const { email } = req.body;

    if (!document)
        return res.status(404).json({ msg: "Document Not Found" });

    if (req.user._id !== String(document.owner))
        return res.status(401).json({ msg: "Access Denied" });

    if (email === req.user.email) {
        return res.status(401).json({ msg: "Owner cannot be deleted" })
    }

    const index = document.userAllowed.findIndex((user) => user.email === email);
    if (index === -1) {
        return res.status(404).json({ msg: "User not found in allwedusers" })
    }

    document.userAllowed.splice(index, 1);
    await Docs.findByIdAndUpdate(documentID, { $set: document });

    return res.json({userAllowed:document.userAllowed, msg: "User deleted from allowedusers" });

});

module.exports = router;