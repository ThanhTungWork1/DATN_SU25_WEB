import { useState } from 'react';
import axios from 'axios';

const CartTest = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('user@gmail.com');

  const loginUser = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/login-user', {
        email: email
      });
      const newToken = (response.data as any).token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setResult(response.data);
      console.log('✅ User logged in:', response.data);
    } catch (error) {
      console.error('❌ Error logging in:', error);
      setResult({ error: 'Failed to login user' });
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/create-test-user');
      const newToken = (response.data as any).token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setResult(response.data);
      console.log('✅ Test user created:', response.data);
    } catch (error) {
      console.error('❌ Error creating test user:', error);
      setResult({ error: 'Failed to create test user' });
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/debug-auth', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
      console.log('✅ Auth test:', response.data);
    } catch (error: any) {
      console.error('❌ Auth test failed:', error);
      setResult({ error: error.response?.data || 'Auth failed' });
    } finally {
      setLoading(false);
    }
  };

  const testCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
      console.log('✅ Cart test:', response.data);
    } catch (error: any) {
      console.error('❌ Cart test failed:', error);
      setResult({ error: error.response?.data || 'Cart test failed' });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      setLoading(true);
      // Thêm variant_id = 1 (giả sử có variant này)
      const response = await axios.post('http://localhost:8000/api/cart/add', {
        variant_id: 1,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
      console.log('✅ Add to cart:', response.data);
    } catch (error: any) {
      console.error('❌ Add to cart failed:', error);
      setResult({ error: error.response?.data || 'Add to cart failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Cart Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Email: 
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            placeholder="Enter user email"
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Token: 
          <input 
            type="text" 
            value={token} 
            onChange={(e) => setToken(e.target.value)}
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={loginUser} disabled={loading}>
          Login Existing User
        </button>
        <button onClick={createTestUser} disabled={loading}>
          Create Test User & Token
        </button>
        <button onClick={testAuth} disabled={loading || !token}>
          Test Auth
        </button>
        <button onClick={testCart} disabled={loading || !token}>
          Test Cart
        </button>
        <button onClick={addToCart} disabled={loading || !token}>
          Add to Cart
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {result && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h3>Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CartTest;
