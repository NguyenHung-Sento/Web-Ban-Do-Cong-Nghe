const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const FacebookStrategy = require("passport-facebook").Strategy
const User = require("../models/user.model")
const crypto = require("crypto")

// Generate a random password for social logins
const generateRandomPassword = () => {
  return crypto.randomBytes(16).toString("hex")
}

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `http://localhost:${process.env.PORT}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const user = await User.findByEmail(profile.emails[0].value)

        if (user) {
          // If user exists but doesn't have google_id, update it
          if (!user.google_id) {
            await User.update(user.id, {
              google_id: profile.id,
              profile_picture: user.profile_picture || profile.photos[0].value,
            })
            // Get the updated user
            const updatedUser = await User.findById(user.id)
            return done(null, updatedUser)
          }
          // User exists, return the user
          return done(null, user)
        } else {
          // Create a new user
          const newUser = {
            name: profile.displayName,
            email: profile.emails[0].value,
            password: generateRandomPassword(), // Generate a random password
            phone: "",
            address: "",
            role: "user",
            google_id: profile.id,
            profile_picture: profile.photos[0].value,
          }

          const userId = await User.create(newUser)
          const createdUser = await User.findById(userId)

          return done(null, createdUser)
        }
      } catch (error) {
        console.error("Google auth error:", error)
        return done(error, false)
      }
    },
  ),
)

// Configure Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL:  `http://localhost:${process.env.PORT}/api/auth/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Facebook may not always provide an email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`

        // Check if user already exists
        const user = await User.findByEmail(email)

        if (user) {
          // If user exists but doesn't have facebook_id, update it
          if (!user.facebook_id) {
            await User.update(user.id, {
              facebook_id: profile.id,
              profile_picture: user.profile_picture || profile.photos[0].value,
            })
            // Get the updated user
            const updatedUser = await User.findById(user.id)
            return done(null, updatedUser)
          }
          // User exists, return the user
          return done(null, user)
        } else {
          // Create a new user
          const newUser = {
            name: profile.displayName,
            email: email,
            password: generateRandomPassword(), // Generate a random password
            phone: "",
            address: "",
            role: "user",
            facebook_id: profile.id,
            profile_picture: profile.photos[0].value,
          }

          const userId = await User.create(newUser)
          const createdUser = await User.findById(userId)

          return done(null, createdUser)
        }
      } catch (error) {
        console.error("Facebook auth error:", error)
        return done(error, false)
      }
    },
  ),
)

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

module.exports = passport
