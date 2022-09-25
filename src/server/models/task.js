import mongoose from "mongoose"
const { model } = mongoose

import taskSchema from "../schemas/task.js"

const taskModel = model("tasks", taskSchema)

export default taskModel