import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Button, Icon } from 'semantic-ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { deleteField } from 'firebase/firestore';
import './shelf.css'
import './shop.css'
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
    <Container className='shelf-container'>
      {/* Header */}
      <div className='shelf-header'>
        <h1 className='shelf-container'>🌿 My Plant Shelf</h1>
        <Button className="shelf-button" primary onClick={() => navigate('/shop')} icon labelPosition="left">
          <Icon name="shop" />
          Plant Shop ({coins} coins)
        </Button>
      </div>
      {giftInfo &&(
        <div className="shelf-gift">
          <Button className="shelf-button" onClick={()=>setGiftInfo(null)}>
            Close
          </Button>
          You received a new <strong>{giftInfo.plantName}</strong> from <strong>{giftInfo.sender}</strong>!
          <p>They said: <strong>{giftInfo.giftMessage}</strong></p>
        </div>
      )}

      {/* Plants Display */}
      {plants.length === 0 ? (
        <div className="plants-display">
          <Icon name="leaf" size="huge" />
          <Header as="h3" >Your shelf is empty!</Header>
          <p className='text'>
            Study to earn coins, then buy your first plant friend! 🌱
          </p>
        </div>
      ) : (
        <Card.Group itemsPerRow={3} stackable>
          {plants.map((plant) => (
            <Card className='shop-card' key={plant.id}>
              <Card.Content className='content'>
                <div className='emoji'>
                  {plant.emoji}
                </div>
                <Card.Header className='header'>
                  {plant.name}
                </Card.Header>
                <Card.Meta className='meta'>
                  <Icon name="bitcoin" /> {plant.cost} coins
                </Card.Meta>
                <Card.Description className='description'>
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