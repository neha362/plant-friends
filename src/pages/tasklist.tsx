import React, {useState, useEffect} from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {doc, getDoc, setDoc} from "firebase/firestore"
import "../styles.css"

interface Task {
    id: number;
    text: string;
    completed: boolean;
}

export default function Tasks() {
    const {currentUser}=useAuth();
    const [text, setText] = useState("")
    const [coins, setCoins] = useState(0);
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

    useEffect(() => {
        loadUserCoins();
      }, [currentUser]);
    
    const loadUserCoins = async () => {
        if (!currentUser) return;
    
        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);
    
        if (docSnap.exists()) {
          setCoins(docSnap.data().coins || 0);
        }
      };

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
        let temp = 0;
         const updatedList = taskList.map((task)=> {
            if (task.id === id) {
                const prevStatus = task.completed;
                const currentStatus = !task.completed;

                if (!prevStatus && currentStatus) {
                    temp += 5;
                }
                else if (prevStatus&&!currentStatus) {
                    temp -= 5;
                }
                return {...task, completed:currentStatus};
            }
            return task;
    });
        setList(updatedList);
        await saveTasks(updatedList);

        if (temp !== 0) {
            const newCoins = coins+temp;
            setCoins(newCoins);
            await saveCoins(newCoins);
        }
    };

    const saveCoins = async (newCoins:number)=> {
        if (!currentUser) return;

        const users = doc(db, "users",currentUser.uid);
        await setDoc (
            users,
            {coins:newCoins},
            {merge:true}
        );
    };

    const clearCompleted = async () => {
        const updatedList = taskList.filter((task)=>!task.completed);
        setList(updatedList);
        await saveTasks(updatedList);
    }

    return (
        <div className="item-container">
            <h1>Tasks</h1>
            <p>You currently have {coins} Coins</p>
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
                            style={{textDecoration:task.completed?"line-through":"none",
                            color:task.completed?"green":"black"
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