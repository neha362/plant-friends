import { useState, useEffect } from 'react';
import { Header, Card, Container, Loader, Message } from 'semantic-ui-react';

interface Plant {
  id: number;
  name: string;
  price: number;
  description: string;
}

const ShelfPage = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch plants from backend
    fetch('http://localhost:5001/api/plants')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setPlants(data.plants);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load plants. Make sure backend is running!');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Loader active>Loading your shelf...</Loader>;
  }

  if (error) {
    return (
      <Message negative>
        <Message.Header>Error</Message.Header>
        <p>{error}</p>
      </Message>
    );
  }

  return (
    <Container>
      <Header as="h1">🌿 My Plant Shelf</Header>
      <p>Your collection of plants (connected to backend!)</p>
      
      <Card.Group>
        {plants.map(plant => (
          <Card key={plant.id}>
            <Card.Content>
              <Card.Header>{plant.name}</Card.Header>
              <Card.Meta>🌱 {plant.price} coins</Card.Meta>
              <Card.Description>{plant.description}</Card.Description>
            </Card.Content>
          </Card>
        ))}
      </Card.Group>

      {plants.length === 0 && (
        <Message info>
          <p>No plants yet! Start studying to earn coins and buy plants.</p>
        </Message>
      )}
    </Container>
  );
};

export default ShelfPage;