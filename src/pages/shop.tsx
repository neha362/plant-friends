import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Button, Icon, Message, Statistic, Grid, Modal, Input } from 'semantic-ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, query, where, getDoc, getDocs, updateDoc, arrayUnion, collection } from 'firebase/firestore';
// import { query } from 'express';
import './shop.css'
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
  { type: 'succulent', name: 'Succulent', emoji: '🪴', cost: 20, description: 'imma succulent' },
  { type: 'cactus', name: 'Cactus', emoji: '🌵', cost: 15, description: 'imma cactus bleh' },
  { type: 'flower', name: 'Flower', emoji: '🌸', cost: 18, description: 'im generic' },
  { type: 'tree', name: 'Tree', emoji: '🌳', cost: 25, description: 'lowk big for a study plant' },
  { type: 'sunflower', name: 'Sunflower', emoji: '🌻', cost: 22, description: 'flower2' },
  { type: 'herb', name: 'Herb', emoji: '🌿', cost: 12, description: 'description...' },
];

function ShopPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modal,setModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [selectedPlant, setPlant] = useState(null);
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
      const q = query(usersRef, where('email','==',targetEmail))
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMessage("No user found with that email");
        setTimeout(()=>setMessage(''),3000);
        setLoading(false);
        return;
      }
      const receiverDoc = snapshot.docs[0].ref;
      await updateDoc(receiverDoc, {
        plants: arrayUnion(newPlant),
        giftAlert: {
          plantName: plantType.name,
          sender: currentUser.email,
          giftMessage: giftMessage
        }
      });
      const senderDoc = doc(db, 'users', currentUser.uid);
      await updateDoc (senderDoc,{
        coins: coins-plantType.cost
      });

      setCoins(coins - plantType.cost);
      setMessage(`🎉 You sent a ${plantType.name} to ${targetEmail}!`);
      
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

  return (
    <Container className='shop-container'>
      {/* Header */}
      
      <div className='shop-header'>
        <Button onClick={() => navigate('/shelf')} className='button'>
            <Icon name="arrow left" />
            Back to Shelf
          </Button>
        <Header as="h1" className='shop-container'>
          <Icon name="shop" />    Plant Shop    
        </Header>
          <div className='statistic'>{coins} Coins</div>
      </div>

      {message && (
        <Message
        className='shop-message'
          positive={message.includes('🎉')}
          negative={message.includes('❌')}
          style={{ marginBottom: '2rem' }}
        >
          {message}
        </Message>
      )}

      {/* Plants Grid */}
      <Card.Group itemsPerRow={3} stackable>
        {PLANT_TYPES.map((plantType) => (
            <Card key={plantType.type} className='shop-card' fluid>
              <Card.Content className='content'>
                <div className='emoji'>
                  {plantType.emoji}
                </div>
                <Card.Header className='header'>{plantType.name}</Card.Header>
                <Card.Meta className='meta'>
                  {plantType.cost} coins
                </Card.Meta>
                <Card.Description className='description'>
                  {plantType.description}
                </Card.Description>
                <Button
                className='button'
                  primary
                  fluid
                  onClick={() => buyPlant(plantType)}
                  disabled={coins < plantType.cost || loading}
                  loading={loading}
                >
                  {coins < plantType.cost ? 'Not enough coins' : `Buy for ${plantType.cost} coins`}
                </Button>
                <Button
                className='button'
                  primary
                  fluid
                  onClick={() => {
                    setModal(true);
                    setPlant(plantType);
                  }}
                  disabled={coins < plantType.cost || loading}
                  loading={loading}
                >
                  {coins < plantType.cost ? 'Not enough coins' : `Send to friend for ${plantType.cost} coins`}
                </Button>
              </Card.Content>
            </Card>
        ))}
      </Card.Group>
      <Modal
          size='fullscreen'
          dimmer="dimmed"
          open = {modal}
          onClose = {() => setModal(false)}
          className='modal'
        >
          <Modal.Header>
            Send plant to a Friend!
          </Modal.Header>
          <Modal.Content>
            <p>Enter friends's user Email: </p>
            <Input
            fluid
            placeholder = "Friends User Email"
            value = {targetEmail}
            onChange={(e)=>setTargetEmail(e.target.value)}
            />
            <p>Add a message: </p>
            <Input
            fluid
            placeholder = "message"
            value = {giftMessage}
            onChange={(e)=>setGiftMessage(e.target.value)}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={()=>setModal(false)}>
              Cancel
            </Button>
            <Button
            primary
            onClick={async ()=>{
              if (!targetEmail) {
                alert("Please enter a valid ID")
                return;
              }
              if (!selectedPlant){
                alert("No plant seleted");
                return;
              }
              await sendPlant(selectedPlant, targetEmail, giftMessage);
              setModal(false);
            }}
            disabled={!selectedPlant||!targetEmail||loading}
            >
              Send plant
              </Button>
          </Modal.Actions>
        </Modal>
    </Container>
  );
}

export default ShopPage;