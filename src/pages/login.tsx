import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Message, Header, Segment } from 'semantic-ui-react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/shelf');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/shelf');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <Container style={{ maxWidth: 500 }}>
        <Segment style={{
          background: '#f2e8cf',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          borderRadius: '15px',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <Header as="h1" style={{ color: '#386641', marginBottom: '2rem' }}>
            🌱 Plant Friends
          </Header>
          
          <Header as="h2" style={{ color: '#386641', marginBottom: '1.5rem' }}>
            {isSignUp ? 'Create Account' : 'Login'}
          </Header>
          
          <Form onSubmit={handleSubmit} error={!!error}>
            <Form.Field>
              <label style={{ color: '#386641', fontWeight: 'bold', textAlign: 'left' }}>Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #6a994e',
                  borderRadius: '8px'
                }}
              />
            </Form.Field>
            
            <Form.Field>
              <label style={{ color: '#386641', fontWeight: 'bold', textAlign: 'left' }}>Password</label>
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #6a994e',
                  borderRadius: '8px'
                }}
              />
            </Form.Field>

            {error && (
              <Message error style={{
                background: '#bc4749',
                color: 'white',
                borderRadius: '8px'
              }}>
                <Message.Header style={{ color: 'white' }}>Authentication Error</Message.Header>
                <p>{error}</p>
              </Message>
            )}

            <Button 
              type="submit" 
              fluid 
              loading={loading}
              disabled={loading}
              style={{
                background: '#386641',
                color: 'white',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
          </Form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              style={{
                background: 'transparent',
                color: '#6a994e',
                border: '2px solid #6a994e',
                fontWeight: 'bold'
              }}
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </Button>
          </div>
        </Segment>
      </Container>
    </div>
  );
}

export default LoginPage;