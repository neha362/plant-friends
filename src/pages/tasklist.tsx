import React, {useState, useEffect} from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {doc, getDoc, setDoc} from "firebase/firestore"
import { Container, Header, Button, Input, List, Icon, Segment, Statistic } from 'semantic-ui-react';
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
        <Container className="item-container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
            <Header as="h1" textAlign="center" style={{ color: '#386641', marginBottom: '2rem' }}>
                ✅ Task List
            </Header>

            {/* Stats */}
<div style={{
    background: '#f2e8cf',
    borderRadius: '10px',
    padding: '0.75rem 1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
}}>
    <div style={{ 
        color: '#386641', 
        fontSize: '1.2rem',
        fontWeight: 'bold'
    }}>
        🪙 {coins} Coins
    </div>
    <div style={{ color: '#6a994e', fontSize: '0.9rem' }}>
        Complete tasks to earn 5 coins each! 🎯
    </div>
</div>

            {/* Add Task Section */}
            <div style={{
                background: '#f2e8cf',
                borderRadius: '15px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Enter a new task..."
                        value={text}
                        onChange={(e)=>setText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTask()}
                        style={{
                            flex: 1,
                            padding: '12px',
                            fontSize: '16px',
                            border: '2px solid #6a994e',
                            borderRadius: '8px'
                        }}
                    />
                    <Button 
                        onClick={addTask}
                        disabled={!text.trim()}
                        style={{
                            background: '#386641',
                            color: 'white',
                            padding: '12px 24px'
                        }}
                    >
                        <Icon name='plus' /> Add
                    </Button>
                </div>
            </div>

            {/* Task List */}
            <div style={{
                background: '#f2e8cf',
                borderRadius: '15px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                minHeight: '200px'
            }}>
                {taskList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6a994e' }}>
                        <Icon name='tasks' size='huge' style={{ color: '#6a994e', opacity: 0.5 }} />
                        <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>No tasks yet! Add one to get started.</p>
                    </div>
                ) : (
                    <List divided relaxed size='large'>
                        {taskList.map((task)=>(
                            <List.Item 
                                key={task.id}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    background: task.completed ? 'rgba(167, 201, 87, 0.2)' : 'white',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={()=>checkTask(task.id)}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            accentColor: '#6a994e'
                                        }}
                                    />
                                    <span
                                        style={{
                                            textDecoration: task.completed ? "line-through" : "none",
                                            color: task.completed ? "#6a994e" : "#386641",
                                            fontSize: '1.1rem',
                                            flex: 1
                                        }}
                                    >
                                        {task.text}
                                    </span>
                                    {task.completed && (
                                        <Icon name='check circle' style={{ color: '#6a994e' }} size='large' />
                                    )}
                                </div>
                            </List.Item>
                        ))}
                    </List>
                )}
            </div>

            {/* Clear Button */}
            {taskList.some(t => t.completed) && (
                <div style={{ textAlign: 'center' }}>
                    <Button 
                        onClick={clearCompleted}
                        size='large'
                        style={{
                            background: '#bc4749',
                            color: 'white'
                        }}
                    >
                        <Icon name='trash' /> Clear Completed Tasks
                    </Button>
                </div>
            )}
        </Container>
    );
}