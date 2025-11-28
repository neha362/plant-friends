import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Button, Icon } from 'semantic-ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { deleteField } from 'firebase/firestore';

interface Plant {
  id: string;
  name: string;
  type: string;
  emoji: string;
  cost: number;
  description: string;
  purchasedAt: number;
}

function ShelfPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [coins, setCoins] = useState(0);
  // const [giftReceived, setGiftReceived]=useState(false);
  const [giftInfo, setGiftInfo] = useState<null | {
    plantName: string;
    sender: string;
    giftMessage: string;
  }>(null);

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
      setCoins(docSnap.data().coins || 0);
      setPlants(docSnap.data().plants || []);
      if (data.giftAlert) {
        setGiftInfo(data.giftAlert);
        try {
          await updateDoc(userDoc,{
            giftAlert: deleteField()
          });
        }
        catch (error){
          console.error("Error displaying message:", error)
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

  return (
    <Container style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Header as="h1" style={{ margin: 0 }}>
          🌿 My Plant Shelf
        </Header>
        <Button primary onClick={() => navigate('/shop')} icon labelPosition="left">
          <Icon name="shop" />
          Plant Shop ({coins} coins)
        </Button>
      </div>
      {giftInfo &&(
        <div>
          <Button onClick={()=>setGiftInfo(null)}>
            Close
          </Button>
          You received a new <strong>{giftInfo.plantName}</strong> from <strong>{giftInfo.sender}</strong>!
          <p>They said: <strong>{giftInfo.giftMessage}</strong></p>
        </div>
      )}
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Your collection of plants (connected to backend!)
      </p>

      {/* Plants Display */}
      {plants.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          border: '2px dashed #ddd',
          borderRadius: '8px',
          background: '#fafafa'
        }}>
          <Icon name="leaf" size="huge" style={{ color: '#ccc', marginBottom: '1rem' }} />
          <Header as="h3" style={{ color: '#999' }}>Your shelf is empty!</Header>
          <p style={{ color: '#999', marginBottom: '1rem' }}>
            Study to earn coins, then buy your first plant friend! 🌱
          </p>
          <Button primary onClick={() => navigate('/shop')}>
            Visit Plant Shop
          </Button>
        </div>
      ) : (
        <Card.Group itemsPerRow={3} stackable>
          {plants.map((plant) => (
            <Card key={plant.id}>
              <Card.Content>
                <div style={{
                  textAlign: 'center',
                  fontSize: '4rem',
                  marginBottom: '1rem',
                  padding: '1rem'
                }}>
                  {plant.emoji}
                </div>
                <Card.Header style={{ textAlign: 'center' }}>
                  {plant.name}
                </Card.Header>
                <Card.Meta style={{ textAlign: 'center', color: '#999' }}>
                  <Icon name="bitcoin" /> {plant.cost} coins
                </Card.Meta>
                <Card.Description style={{ marginTop: '1rem', textAlign: 'center' }}>
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