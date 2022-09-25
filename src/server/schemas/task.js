import mongoose from "mongoose"
const { Schema } = mongoose

const taskSchema = new Schema({
    creator: Object,
    title: String,
    timestamp: Date,
    board: String,
    category: String,
    color: String,
    order: Number
})

export default taskSchema