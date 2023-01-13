const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true,
})

taskSchema.pre('save', function (next) {
    next()
})
const Room = mongoose.model('Room', roomSchema)

module.exports = Room