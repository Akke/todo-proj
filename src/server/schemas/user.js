import mongoose from "mongoose"
const { Schema } = mongoose

const userSchema = new Schema({
    name: String,
    token: String
})

export default userSchema