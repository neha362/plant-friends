import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Button, Icon, Modal } from 'semantic-ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { deleteField } from 'firebase/firestore';
import '../styles.css'

interface Plant {
  id: string;
  name: string;
  type: string;
  emoji: string;
  cost: number;
  description: string;
  purchasedAt: number;
}

interface GiftAlert {
  plantName: string;
  sender: string;
  giftMessage: string;
  timestamp: number;
}

function ShelfPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [coins, setCoins] = useState(0);
  const [giftAlerts, setGiftAlerts] = useState<GiftAlert[]>([]);
  const [currentGiftIndex, setCurrentGiftIndex] = useState(0);

  useEffect(() => {
    const fetch = async ()=> {
      await loadUserData();
    };
    fetch();
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;
    const userDoc = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setCoins(data.coins || 0);
      setPlants(data.plants || []);
      
      // Load all gift alerts
      if (data.giftAlerts && data.giftAlerts.length > 0) {
        setGiftAlerts(data.giftAlerts);
        setCurrentGiftIndex(0);
        
        // Clear all gift alerts from database
        try {
          await updateDoc(userDoc, {
            giftAlerts: deleteField()
          });
        } catch (error) {
          console.error("Error clearing gift alerts:", error);
        }
      }
    } else {
      await setDoc(userDoc, {
        coins: 0,
        plants: [],
        email: currentUser.email,
      });
    }
  };

  const handleNextGift = () => {
    if (currentGiftIndex < giftAlerts.length - 1) {
      setCurrentGiftIndex(currentGiftIndex + 1);
    } else {
      // No more gifts, close modal
      setGiftAlerts([]);
      setCurrentGiftIndex(0);
    }
  };

  const handleCloseGifts = () => {
    setGiftAlerts([]);
    setCurrentGiftIndex(0);
  };

  const currentGift = giftAlerts.length > 0 ? giftAlerts[currentGiftIndex] : null;

  return (
    <Container className='item-container'>
      {/* Header */}
      <div className='header'>
        <h1 className='item-container' style={{ color: '#386641' }}>🌿 My Plant Shelf</h1>
        <Button 
          className="button" 
          onClick={() => navigate('/shop')}
          style={{
            background: '#6a994e',
            color: 'white'
          }}
        >
          Plant Shop ({coins} coins)
        </Button>
      </div>

      {/* Gift Notification Modal */}
      <Modal
        open={!!currentGift}
        onClose={handleCloseGifts}
        size='small'
        style={{
          textAlign: 'center'
        }}
      >
        <Modal.Content style={{
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, #6a994e 0%, #a7c957 100%)',
          color: 'white'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '1rem' }}>
            🎁
          </div>
          <Header as='h1' style={{ 
            color: 'white', 
            marginBottom: '1rem',
            fontSize: '2rem'
          }}>
            You Got a Gift!
          </Header>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ 
              fontSize: '1.3rem', 
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              {currentGift?.plantName}
            </p>
            <p style={{ fontSize: '1.1rem', marginBottom: '0' }}>
              from <strong>{currentGift?.sender}</strong>
            </p>
          </div>
          {currentGift?.giftMessage && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '1rem',
              fontStyle: 'italic',
              fontSize: '1rem'
            }}>
              "{currentGift.giftMessage}"
            </div>
          )}
          {giftAlerts.length > 1 && (
            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
              Gift {currentGiftIndex + 1} of {giftAlerts.length}
            </p>
          )}
        </Modal.Content>
        <Modal.Actions style={{ 
          background: '#f2e8cf',
          padding: '1.5rem'
        }}>
          {currentGiftIndex < giftAlerts.length - 1 ? (
            <Button
              size='large'
              onClick={handleNextGift}
              style={{
                background: '#386641',
                color: 'white'
              }}
            >
              <Icon name='arrow right' /> Next Gift
            </Button>
          ) : (
            <Button
              size='large'
              onClick={handleCloseGifts}
              style={{
                background: '#386641',
                color: 'white'
              }}
            >
              <Icon name='heart' /> Awesome!
            </Button>
          )}
        </Modal.Actions>
      </Modal>

      {/* Plants Display */}
 {plants.length === 0 ? (
  <div className="plants-display" style={{ marginTop: '3rem', textAlign: 'center' }}>
    <Header as="h3" style={{ color: '#386641' }}>Your shelf is empty!</Header>
    <p className='text' style={{ color: '#386641' }}>
      Study to earn coins, then buy your first plant friend! 🌸
    </p>
  </div>
) : (
        <Card.Group itemsPerRow={3} stackable style={{ marginTop: '3rem' }}>
          {plants.map((plant) => (
            <Card className='card' key={plant.id} style={{ 
              background: '#f2e8cf',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <Card.Content className='content'>
                <div className='emoji'>
                  {plant.emoji}
                </div>
                <Card.Header className='header' style={{ color: '#386641' }}>
                  {plant.name}
                </Card.Header>
                <Card.Meta className='meta' style={{ color: '#6a994e' }}>
                  <Icon name="bitcoin" /> {plant.cost} coins
                </Card.Meta>
                <Card.Description className='description' style={{ color: '#6a994e' }}>
                  {plant.description}
                </Card.Description>
              </Card.Content>
            </Card>
          ))}
        </Card.Group>
      )}
    </Container>
  );
}

export default ShelfPage;