const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require ('jsonwebtoken')
// const Room = require('./room')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        },
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0){
                throw new Error('Age must be greater then 0')
            }
        },
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes("password")){
                throw new Error('Password cannot include the phrase "password"')
            }
        },
    },
    avatar: {
        type: Buffer
    },
    // rooms: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Room'
    //     }
    // ],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

 userSchema.methods.toJSON = function () {
    const userObject = this.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
 }
 
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET)
    user.tokens.push({ token })
    await user.save()
    return token
}
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error ('Unable to login')
    }

    return user    
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user  = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

// userSchema.pre('remove', async function (next) {
//     const user = this
//     await Task.deleteMany({ owner: user._id })
//     next()
// })


const User = mongoose.model('User', userSchema)



module.exports = User