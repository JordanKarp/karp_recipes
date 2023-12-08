const passport = require('passport')
const LocalStrategy = require('passport-local')
const asyncHandler = require("express-async-handler");
const {validPassword} = require('./passwordUtils')

const User = require("../models/user");


const strategy = new LocalStrategy(asyncHandler(async (username, password, done) => {
    const user = await User.findOne({ username:username }).exec()
    if (!user) {
        return done(null, false)
    }
    const isValid = validPassword(password, user.hash, user.salt);

    if (isValid) {
        return done(null, user);
    } else {
        return done(null, false)
    }
}))

passport.use(strategy)


passport.serializeUser((user, done) => {
    done(null, user.id);
});


passport.deserializeUser(asyncHandler( async(userId, done) => {
    const user = await User.findById(userId).exec();
    done(null, user)
}));