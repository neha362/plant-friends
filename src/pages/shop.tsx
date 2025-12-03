import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Button, Icon, Message, Statistic, Grid, Modal, Input } from 'semantic-ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, query, where, getDoc, getDocs, updateDoc, arrayUnion, collection } from 'firebase/firestore';
import 'semantic-ui-css/semantic.min.css';

// import { query } from 'express';
import '../styles.css'
interface Plant {
  id: string;
  name: string;
  type: string;
  emoji: string;
  cost: number;
  description: string;
  purchasedAt: number;
  buyerId: string;
}

const PLANT_TYPES = [
  { type: 'succulent', name: 'Succulent', emoji: '🪴', cost: 20, description: 'a cute succulent, independent!' },
  { type: 'cactus', name: 'Cactus', emoji: '🌵', cost: 15, description: 'a prickly cactus, be careful' },
  { type: 'flower', name: 'Flower', emoji: '🌸', cost: 18, description: 'a classic and pretty flower' },
  { type: 'tree', name: 'Tree', emoji: '🌳', cost: 25, description: 'a small tree' },
  { type: 'sunflower', name: 'Sunflower', emoji: '🌻', cost: 22, description: 'a lively sunflower' },
  { type: 'herb', name: 'Herb', emoji: '🌿', cost: 12, description: 'a tasty (?) herb' },
];

function ShopPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [selectedPlant, setPlant] = useState<typeof PLANT_TYPES[0] | null>(null);
  const [giftMessage, setGiftMessage] = useState("");

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

  const buyPlant = async (plantType: typeof PLANT_TYPES[0]) => {
    if (!currentUser) return;

    if (coins < plantType.cost) {
      setMessage('❌ Not enough coins! Study more to earn coins. 📚');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);

    try {
      const newPlant: Plant = {
        id: Date.now().toString(),
        name: plantType.name,
        type: plantType.type,
        emoji: plantType.emoji,
        cost: plantType.cost,
        description: plantType.description,
        purchasedAt: Date.now(),
        buyerId: currentUser.uid
      };

      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, {
        coins: coins - plantType.cost,
        plants: arrayUnion(newPlant),
      });

      setCoins(coins - plantType.cost);
      setMessage(`🎉 ${plantType.name} added to your shelf!`);
      
      setTimeout(() => {
        navigate('/shelf');
      }, 1500);
    } catch (error) {
      console.error('Error buying plant:', error);
      setMessage('❌ Error buying plant. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const sendPlant = async (plantType: typeof PLANT_TYPES[0], targetEmail: string, giftMessage: string) => {
    if (!currentUser) return;

    if (coins < plantType.cost) {
      setMessage('❌ Not enough coins! Study more to earn coins. 📚');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate recipient email
    if (!targetEmail.trim()) {
      setMessage('❌ Please enter a recipient email');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (targetEmail.toLowerCase() === currentUser.email?.toLowerCase()) {
      setMessage("❌ You can't send a plant to yourself!");
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);

    try {
      const newPlant: Plant = {
        id: Date.now().toString(),
        name: plantType.name,
        type: plantType.type,
        emoji: plantType.emoji,
        cost: plantType.cost,
        description: plantType.description,
        purchasedAt: Date.now(),
        buyerId: currentUser.uid
      };

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', targetEmail.toLowerCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMessage("❌ No user found with that email");
        setTimeout(() => setMessage(''), 3000);
        setLoading(false);
        return;
      }

      const recipientDocRef = snapshot.docs[0].ref;
      const recipientData = snapshot.docs[0].data();
      
      // Get existing gift alerts or create empty array
      const existingGiftAlerts = recipientData.giftAlerts || [];
      
      // Add new gift to the array
      const newGiftAlert = {
        plantName: plantType.name,
        sender: currentUser.email || 'A friend',
        giftMessage: giftMessage || 'Enjoy your new plant!',
        timestamp: Date.now()
      };

      await updateDoc(recipientDocRef, {
        plants: arrayUnion(newPlant),
        giftAlerts: arrayUnion(newGiftAlert)
      });

      const senderDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(senderDoc, {
        coins: coins - plantType.cost
      });

      setCoins(coins - plantType.cost);
      setMessage(`🎉 You sent a ${plantType.name} to ${targetEmail}!`);
      
      setTimeout(() => {
        setModal(false);
        setTargetEmail('');
        setGiftMessage('');
        setPlant(null);
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error sending plant:', error);
      setMessage('❌ Error sending plant. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className='item-container'>
            {/* Header */}
            <div className='header'>
              <h1 className='item-container' style={{ color: '#386641' }}>Plant Shop</h1>
              <Button 
                className="button" 
                onClick={() => navigate('/shelf')}
                style={{
                  background: '#6a994e',
                  color: 'white'
                }}
        >
          Back to Shelf
        </Button>
      
        <div className='statistic' style={{ 
          background: '#f2e8cf',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          color: '#386641',
          fontWeight: 'bold'
        
        }}>
          🪙 {coins} Coins
        </div>
      </div>

      {message && (
        <Message
          className='shop-message'
          positive={message.includes('🎉')}
          negative={message.includes('❌')}
          style={{ 
            marginBottom: '2rem',
            background: message.includes('🎉') ? '#a7c957' : '#bc4749',
            color: 'white'
          }}
        >
          {message}
        </Message>
      )}

      {/* Plants Grid */}
      <Card.Group itemsPerRow={3} stackable>
        {PLANT_TYPES.map((plantType) => (
          <Card key={plantType.type} className='card' fluid style={{
            background: '#f2e8cf',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <Card.Content className='content' style={{ paddingBottom: '1.5rem' }}>
              <div className='emoji'>
                {plantType.emoji}
              </div>
              <Card.Header className='header' style={{ color: '#386641' }}>
                {plantType.name}
              </Card.Header>
              <Card.Meta className='meta' style={{ color: '#6a994e' }}>
                🪙 {plantType.cost} coins
              </Card.Meta>
              <Card.Description className='description' style={{ color: '#6a994e', marginBottom: '1rem' }}>
                {plantType.description}
              </Card.Description>
              <Button
                className='button'
                onClick={() => buyPlant(plantType)}
                disabled={coins < plantType.cost || loading}
                loading={loading}
                style={{ 
                  marginBottom: '0.5rem',
                  background: coins < plantType.cost ? '#ccc' : '#386641',
                  color: 'white',
                  width: '100%',
                  padding: '0.8rem 1rem',
                  whiteSpace: 'normal',
                  height: 'auto',
                  minHeight: '40px'
                }}
              >
                {coins < plantType.cost ? 'Not enough coins' : `Buy for ${plantType.cost} coins`}
              </Button>
              <Button
                className='button'
                onClick={() => {
                  setModal(true);
                  setPlant(plantType);
                }}
                disabled={coins < plantType.cost || loading}
                style={{
                  background: coins < plantType.cost ? '#ccc' : '#6a994e',
                  color: 'white',
                  width: '100%',
                  padding: '0.8rem 1rem',
                  whiteSpace: 'normal',
                  height: 'auto',
                  minHeight: '40px'
                }}
              >
                <Icon name='gift' /> {coins < plantType.cost ? 'Not enough coins' : `Send to friend (${plantType.cost} coins)`}
              </Button>
            </Card.Content>
          </Card>
        ))}
      </Card.Group>

      <Modal
        size='small'
        dimmer="dimmed"
        open={modal}
        onClose={() => {
          setModal(false);
          setTargetEmail('');
          setGiftMessage('');
          setPlant(null);
        }}
        className='modal'
      >
        <Modal.Header style={{ background: '#386641', color: 'white' }}>
          <Icon name='gift' /> Send {selectedPlant?.emoji} {selectedPlant?.name} to a Friend!
        </Modal.Header>
        <Modal.Content style={{ background: '#f2e8cf' }}>
          <p style={{ color: '#386641', fontWeight: 'bold' }}>Enter friend's email address:</p>
          <input
            type='email'
            placeholder="friend@example.com"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #6a994e',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}
          />
          <p style={{ color: '#386641', fontWeight: 'bold' }}>Add a message (optional):</p>
          <textarea
            placeholder="Enjoy your new plant!"
            value={giftMessage}
            onChange={(e) => setGiftMessage(e.target.value)}
            disabled={loading}
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '2px solid #6a994e',
              borderRadius: '8px',
              resize: 'vertical'
            }}
          />
        </Modal.Content>
        <Modal.Actions style={{ background: '#f2e8cf' }}>
          <Button 
            onClick={() => {
              setModal(false);
              setTargetEmail('');
              setGiftMessage('');
              setPlant(null);
            }}
            disabled={loading}
            style={{
              background: 'white',
              color: '#386641'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!targetEmail) {
                setMessage("❌ Please enter a valid email");
                setTimeout(() => setMessage(''), 3000);
                return;
              }
              if (!selectedPlant) {
                setMessage("❌ No plant selected");
                setTimeout(() => setMessage(''), 3000);
                return;
              }
              await sendPlant(selectedPlant, targetEmail, giftMessage);
            }}
            disabled={!selectedPlant || !targetEmail || loading}
            loading={loading}
            style={{
              background: '#6a994e',
              color: 'white'
            }}
          >
            <Icon name='gift' /> Send Plant ({selectedPlant?.cost} coins)
          </Button>
        </Modal.Actions>
      </Modal>
    </Container>
  );
}

export default ShopPage;