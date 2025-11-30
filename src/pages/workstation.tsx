import React, { useState, useEffect, useRef } from 'react';
import { Container, Header, Button, Progress, Segment, Icon, Message, Statistic, Modal } from 'semantic-ui-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import "../styles.css"
const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds
const COIN_INTERVAL =  10; // 1 coin every 5 minutes

function WorkstationPage() {
  const { currentUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [coins, setCoins] = useState(0);
  const [coinsEarnedThisSession, setCoinsEarnedThisSession] = useState(0);
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);
  const [totalWorkSessions, setTotalWorkSessions] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const workTimeElapsedRef = useRef(0);

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

      const userDoc = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        setCoins(docSnap.data().coins || 0);
        setTotalWorkSessions(docSnap.data().workSessions || 0);
      } else {
        // Create user document if it doesn't exist
        await setDoc(userDoc, {
          coins: 0,
          email: currentUser.email,
          workSessions: 0
        });
      }
    };

    loadUserData();
  }, [currentUser]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);

        // Track work time for coin rewards
        if (!isBreak) {
          workTimeElapsedRef.current += 1;

          // Award coin every 5 minutes
          if (workTimeElapsedRef.current % COIN_INTERVAL === 0) {
            awardCoin();
          }
        }
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, isBreak]);

  const awardCoin = async () => {
    if (!currentUser) return;

    try {
      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, {
        coins: increment(1)
      });

      setCoins(prev => prev + 1);
      setCoinsEarnedThisSession(prev => prev + 1);
    } catch (error) {
      console.error('Error awarding coin:', error);
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);

    if (!isBreak) {
      //update work sessions count
      if (currentUser) {
        const userDoc = doc(db, 'users', currentUser.uid);
        await updateDoc(userDoc, {
          workSessions: increment(1)
        });
        setTotalWorkSessions(prev => prev + 1);
      }

      setShowBreakPrompt(true);
      playNotificationSound();
    } else {
      // Break complete
      setIsBreak(false);
      setTimeLeft(WORK_TIME);
      alert('Break complete! Ready for another work session? 💪');
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
    if (!isBreak) {
      workTimeElapsedRef.current = 0;
      setCoinsEarnedThisSession(0);
    }
  };

  const startBreak = () => {
    setShowBreakPrompt(false);
    setIsBreak(true);
    setTimeLeft(BREAK_TIME);
    setIsRunning(true);
  };

  const skipBreak = () => {
    setShowBreakPrompt(false);
    setIsBreak(false);
    setTimeLeft(WORK_TIME);
    workTimeElapsedRef.current = 0;
    setCoinsEarnedThisSession(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = isBreak ? BREAK_TIME : WORK_TIME;
    return ((total - timeLeft) / total) * 100;
  };

  const getNextCoinTime = () => {
    if (isBreak) return null;
    const nextCoin = COIN_INTERVAL - (workTimeElapsedRef.current % COIN_INTERVAL);
    return formatTime(nextCoin);
  };

  return (
    <Container className='item-container'>
      <Header as="h1" textAlign="center">
        {isBreak ? '☕ Break Time' : 'Study Timer'}
      </Header>

      {/* Stats */}
      <Segment textAlign="center">
        <Statistic.Group widths="3" size="small">
          <Statistic>
            <Statistic.Value>

              {coins}
            </Statistic.Value>
            <Statistic.Label>Total Coins</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value>{coinsEarnedThisSession}</Statistic.Value>
            <Statistic.Label>This Session</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value>{totalWorkSessions}</Statistic.Value>
            <Statistic.Label>Sessions</Statistic.Label>
          </Statistic>
        </Statistic.Group>
      </Segment>

      {/* Timer Display */}
      <Segment textAlign="center" style={{ padding: '3rem' }}>
        <Header as="h1" style={{ fontSize: '4rem', margin: 0 }}>
          {formatTime(timeLeft)}
        </Header>

        <Progress
          percent={getProgress()}
          color={isBreak ? 'green' : 'blue'}
          size="large"
          style={{ marginTop: '2rem' }}
        />

        {!isBreak && !isRunning && workTimeElapsedRef.current === 0 && (
          <Message info>
            <Icon name="lightbulb" />
            Earn 1 coin every 5 minutes! Complete the full 25 minutes to earn 5 coins.
          </Message>
        )}

        {!isBreak && isRunning && (
          <Message positive>
            <Icon name="clock" />
            Next coin in: <strong>{getNextCoinTime()}</strong>
          </Message>
        )}
      </Segment>

      {/* Controls */}
      <Segment textAlign="center">
        <Button.Group size="large">
          {!isRunning ? (
            <Button primary onClick={startTimer} icon labelPosition="left">
              <Icon name="play" />
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} icon labelPosition="left">
              <Icon name="pause" />
              Pause
            </Button>
          )}

          <Button onClick={resetTimer} icon labelPosition="left">
            <Icon name="redo" />
            Reset
          </Button>
        </Button.Group>
      </Segment>

      {/* Info */}
      <Message >
        <Message.Header>Pomodoro Technique</Message.Header>
        <Message.List className="message-list">
          <Message.Item className='message-item'>Work for 25 minutes with full focus</Message.Item>
          <Message.Item className='message-item'>Earn 1 coin every 5 minutes (5 coins total!)</Message.Item>
          <Message.Item className='message-item'>Take a 5-minute break after each session</Message.Item>
          <Message.Item className='message-item'>Use coins to buy more plants for you and your friends! 🌱</Message.Item>
        </Message.List>
      </Message>

      {/* Break Prompt Modal */}
      <Modal open={showBreakPrompt} size="small">
        <Modal.Header>🎉 Work Session Complete!</Modal.Header>
        <Modal.Content>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Header as="h2">
              Great job! You earned {coinsEarnedThisSession} coins! 🪙
            </Header>
            <p>Time for a 5-minute break to recharge.</p>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={skipBreak}>
            Skip Break
          </Button>
          <Button primary onClick={startBreak} icon labelPosition="right">
            Start Break
            <Icon name="coffee" />
          </Button>
        </Modal.Actions>
      </Modal>
    </Container>
  );
}

export default WorkstationPage;
