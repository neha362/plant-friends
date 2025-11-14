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
    <Container style={{ maxWidth: 450, marginTop: '4rem' }}>
      <Header as="h1" textAlign="center">
        🌱 Plant Friends
      </Header>
      <Segment>
        <Header as="h2">{isSignUp ? 'Create Account' : 'Login'}</Header>
        
        <Form onSubmit={handleSubmit} error={!!error}>
          <Form.Field>
            <label>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Field>
          
          <Form.Field>
            <label>Password</label>
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </Form.Field>

          {error && (
            <Message error>
              <Message.Header>Authentication Error</Message.Header>
              <p>{error}</p>
            </Message>
          )}

          <Button 
            type="submit" 
            primary 
            fluid 
            loading={loading}
            disabled={loading}
          >
            {isSignUp ? 'Sign Up' : 'Login'}
          </Button>
        </Form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Button
            basic
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </Segment>
    </Container>
  );
}

export default LoginPage;