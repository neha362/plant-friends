import { Button, Table } from "semantic-ui-react"
import { TaskData } from "../types"

type TaskProps = {
  tasks: TaskData[] | null
}

const TaskPage = ({tasks}:TaskProps) => {
  return (
    tasks.map((task) => (
      <div className="item" key={task.name} data-testid="item">
        {task.name}
      </div>
    ))
  )
}

export default TaskPage
