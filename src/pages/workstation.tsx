import React, { useState, useEffect, useRef } from 'react';
import { Container, Header, Button, Progress, Segment, Icon, Message, Statistic, Modal } from 'semantic-ui-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import "../styles.css"

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds
const COIN_INTERVAL = 300; // 1 coin every 5 minutes

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
    <Container className='item-container' style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <Header as="h1" textAlign="center" style={{ marginBottom: '2rem', color: '#386641' }}>
        {isBreak ? '☕ Break Time' : '🍅 Study Timer'}
      </Header>

      {/* Stats */}
      <div style={{
        background: '#f2e8cf',
        borderRadius: '15px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <Statistic.Group widths="3" size="small">
          <Statistic>
            <Statistic.Value style={{ color: '#386641' }}>🪙 {coins}</Statistic.Value>
            <Statistic.Label style={{ color: '#6a994e' }}>Total Coins</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value style={{ color: '#386641' }}>✨ {coinsEarnedThisSession}</Statistic.Value>
            <Statistic.Label style={{ color: '#6a994e' }}>This Session</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value style={{ color: '#386641' }}>📚 {totalWorkSessions}</Statistic.Value>
            <Statistic.Label style={{ color: '#6a994e' }}>Sessions</Statistic.Label>
          </Statistic>
        </Statistic.Group>
      </div>

      {/* Timer Display */}
      <div style={{
        background: isBreak ? 'linear-gradient(135deg, #6a994e 0%, #a7c957 100%)' : 'linear-gradient(135deg, #386641 0%, #6a994e 100%)',
        borderRadius: '20px',
        padding: '3rem 2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          {formatTime(timeLeft)}
        </div>

        <Progress
          percent={getProgress()}
          style={{
            margin: '1.5rem 0',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px'
          }}
          color={isBreak ? 'olive' : 'green'}
          size="large"
        />

        {!isBreak && !isRunning && workTimeElapsedRef.current === 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '10px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <Icon name="lightbulb" />
            Earn 1 coin every 5 minutes! Complete the full 25 minutes to earn 5 coins.
          </div>
        )}

        {!isBreak && isRunning && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '10px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <Icon name="clock" />
            Next coin in: <strong>{getNextCoinTime()}</strong>
          </div>
        )}

        {/* Controls */}
        <div style={{ marginTop: '2rem' }}>
          <Button.Group size="huge">
            {!isRunning ? (
              <Button 
                style={{
                  background: '#f2e8cf',
                  color: '#386641',
                  fontWeight: 'bold',
                  padding: '1rem 2rem'
                }}
                onClick={startTimer} 
                icon 
                labelPosition="left"
              >
                <Icon name="play" />
                Start
              </Button>
            ) : (
              <Button 
                style={{
                  background: '#f2e8cf',
                  color: '#386641',
                  fontWeight: 'bold',
                  padding: '1rem 2rem'
                }}
                onClick={pauseTimer} 
                icon 
                labelPosition="left"
              >
                <Icon name="pause" />
                Pause
              </Button>
            )}

            <Button 
              style={{
                background: '#f2e8cf',
                color: '#386641',
                fontWeight: 'bold',
                padding: '1rem 2rem'
              }}
              onClick={resetTimer} 
              icon 
              labelPosition="left"
            >
              <Icon name="redo" />
              Reset
            </Button>
          </Button.Group>
        </div>
      </div>

      {/* Info */}
      <div style={{
        background: '#f2e8cf',
        borderRadius: '15px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <Header as="h3" style={{ color: '#386641', marginBottom: '1rem' }}>
          🍅 Pomodoro Technique
        </Header>
        <div style={{ color: '#386641' }}>
          <div style={{ marginBottom: '0.5rem' }}>📖 Work for 25 minutes with full focus</div>
          <div style={{ marginBottom: '0.5rem' }}>🪙 Earn 1 coin every 5 minutes (5 coins total!)</div>
          <div style={{ marginBottom: '0.5rem' }}>☕ Take a 5-minute break after each session</div>
          <div>🌱 Use coins to buy more plants for you and your friends!</div>
        </div>
      </div>

      {/* Break Prompt Modal */}
      <Modal open={showBreakPrompt} size="small">
        <Modal.Content style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, #a7c957 0%, #6a994e 100%)',
          color: 'white'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '1rem' }}>🎉</div>
          <Header as="h1" style={{ color: 'white', marginBottom: '1rem' }}>
            Work Session Complete!
          </Header>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            fontSize: '1.3rem'
          }}>
            You earned <strong>{coinsEarnedThisSession} coins! 🪙</strong>
            <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Time for a 5-minute break to recharge ☕</p>
          </div>
        </Modal.Content>
        <Modal.Actions style={{ background: '#f2e8cf', padding: '1.5rem' }}>
          <Button 
            onClick={skipBreak} 
            size='large'
            style={{
              background: 'white',
              color: '#386641'
            }}
          >
            Skip Break
          </Button>
          <Button 
            size='large'
            onClick={startBreak} 
            icon 
            labelPosition="right"
            style={{
              background: '#6a994e',
              color: 'white'
            }}
          >
            Start Break
            <Icon name="coffee" />
          </Button>
        </Modal.Actions>
      </Modal>
    </Container>
  );
}

export default WorkstationPage;