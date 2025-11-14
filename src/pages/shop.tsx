import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Button, Icon, Message, Statistic, Grid } from 'semantic-ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

interface Plant {
  id: string;
  name: string;
  type: string;
  emoji: string;
  cost: number;
  description: string;
  purchasedAt: number;
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

  return (
    <Container style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Header as="h1" style={{ margin: 0 }}>
          <Icon name="shop" /> Plant Shop
        </Header>
        <div>
          <Button onClick={() => navigate('/shelf')} style={{ marginRight: '1rem' }}>
            <Icon name="arrow left" />
            Back to Shelf
          </Button>
          <Statistic size="mini" horizontal>
            <Statistic.Value>{coins}</Statistic.Value>
            <Statistic.Label>Coins</Statistic.Label>
          </Statistic>
        </div>
      </div>

      {message && (
        <Message
          positive={message.includes('🎉')}
          negative={message.includes('❌')}
          style={{ marginBottom: '2rem' }}
        >
          {message}
        </Message>
      )}

      {/* Plants Grid */}
      <Grid columns={3} stackable>
        {PLANT_TYPES.map((plantType) => (
          <Grid.Column key={plantType.type}>
            <Card fluid>
              <Card.Content style={{ textAlign: 'center', minHeight: '200px' }}>
                <div style={{ fontSize: '5rem', margin: '1rem 0' }}>
                  {plantType.emoji}
                </div>
                <Card.Header>{plantType.name}</Card.Header>
                <Card.Meta style={{ margin: '0.5rem 0' }}>
                  {plantType.cost} coins
                </Card.Meta>
                <Card.Description>
                  {plantType.description}
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button
                  primary
                  fluid
                  onClick={() => buyPlant(plantType)}
                  disabled={coins < plantType.cost || loading}
                  loading={loading}
                >
                  {coins < plantType.cost ? 'Not enough coins' : `Buy for ${plantType.cost} coins`}
                </Button>
              </Card.Content>
            </Card>
          </Grid.Column>
        ))}
      </Grid>
    </Container>
  );
}

export default ShopPage;