import React, {useState, useEffect} from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {doc, getDoc, setDoc} from "firebase/firestore"

interface Task {
    id: number;
    text: string;
    completed: boolean;
}

export default function Tasks() {
    const {currentUser}=useAuth();
    const [text, setText] = useState("")
    const [taskList, setList] = useState<Task[]>([]);

    useEffect(()=>{
        const loadTasks = async () => {
            if (!currentUser) return;

            const ref = doc(db,"users",currentUser.uid,"tasks","taskList");
            const temp = await getDoc(ref);

            if (temp.exists()) {
                const data = temp.data();
                setList(data.items || []);
            }
            else {
                await setDoc(ref,{items:[]});
            }
        };
        loadTasks();
    }, [currentUser]);

    const saveTasks = async (updatedList: Task[])=>{
        if (!currentUser) return;

        const ref = doc(db,"users",currentUser.uid,"tasks","taskList");
        await setDoc(ref, {items: updatedList});
    }

    const addTask = async () => {
        if (!text.trim()) return;

        const newTask: Task = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
        };

        const updatedList = [...taskList, newTask]
        setList(updatedList);
        setText("");
        await saveTasks(updatedList)
    };

    const checkTask = async (id: number) => {
         const updatedList = taskList.map((task)=>
            task.id === id? {...task, completed: !task.completed}:task
        );
        setList(updatedList);
        await saveTasks(updatedList);
    };

    const clearCompleted = async () => {
        const updatedList = taskList.filter((task)=>!task.completed);
        setList(updatedList);
        await saveTasks(updatedList);
    }

    return (
        <div>
            <h1>Tasks</h1>
            <p>Complete a task to get 5 coins!</p>
            <div>
                <input
                type="text"
                placeholder="Enter task:"
                value={text}
                onChange={(e)=>setText(e.target.value)}
                />
                <button onClick={addTask}>
                    Add
                </button>
            </div>

            <ul>
                {taskList.map((task)=>(
                    <li key = {task.id}>
                        <input
                            type="checkbox"
                            checked= {task.completed}
                            onChange={()=>checkTask(task.id)}
                        />
                        <span
                            style={{textDecoration:task.completed?"line-through":"none"
                        }}
                        >
                            {task.text}
                        </span>
                    </li>
                ))}
            </ul>
            <button onClick={clearCompleted} disabled={taskList.every(t=>!t.completed)}>
                Clear Completed Tasks
            </button>
        </div>
    );
}