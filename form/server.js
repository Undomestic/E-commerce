const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage (replace with database in production)
let users = [];
let sessions = [];

// Load users from file if it exists
const usersFile = path.join(__dirname, 'users.json');
if (fs.existsSync(usersFile)) {
    try {
        const data = fs.readFileSync(usersFile, 'utf8');
        users = JSON.parse(data);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Save users to file
function saveUsers() {
    try {
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error saving users:', error);
    }
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = users.find(u => u.username === username || u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this username or email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            id: Date.now().toString(),
            username,
            fullName: fullName || '',
            email: email || '',
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            lastLoginAt: null
        };

        users.push(newUser);
        saveUsers();

        res.status(201).json({ 
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                fullName: newUser.fullName,
                email: newUser.email,
                createdAt: newUser.createdAt
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Find user by username or email
        const user = users.find(u => 
            u.username === username || 
            (email && u.email === email)
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        user.lastLoginAt = new Date().toISOString();
        saveUsers();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                email: user.email 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Store session
        sessions.push({
            userId: user.id,
            token,
            createdAt: new Date().toISOString()
        });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// OAuth/Provider authentication endpoint
app.post('/api/auth', async (req, res) => {
    try {
        const { provider, phone } = req.body;

        if (!provider) {
            return res.status(400).json({ error: 'Provider is required' });
        }

        let user;
        let identifier;

        if (provider === 'phone' && phone) {
            identifier = phone;
            user = users.find(u => u.phone === phone);
            
            if (!user) {
                // Create user for phone authentication
                const newUser = {
                    id: Date.now().toString(),
                    username: `user_${Date.now()}`,
                    fullName: '',
                    email: '',
                    phone: phone,
                    provider: 'phone',
                    createdAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString()
                };
                users.push(newUser);
                saveUsers();
                user = newUser;
            }
        } else if (provider === 'google' || provider === 'apple') {
            // For demo purposes, create a mock user
            // In production, you would verify the OAuth token with the provider
            identifier = `${provider}_${Date.now()}`;
            user = users.find(u => u.provider === provider && u.providerId === identifier);
            
            if (!user) {
                const newUser = {
                    id: Date.now().toString(),
                    username: `${provider}_user_${Date.now()}`,
                    fullName: `${provider} User`,
                    email: `${provider}@example.com`,
                    provider: provider,
                    providerId: identifier,
                    createdAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString()
                };
                users.push(newUser);
                saveUsers();
                user = newUser;
            }
        } else {
            return res.status(400).json({ error: 'Unsupported provider' });
        }

        // Update last login
        user.lastLoginAt = new Date().toISOString();
        saveUsers();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                email: user.email 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Store session
        sessions.push({
            userId: user.id,
            token,
            createdAt: new Date().toISOString()
        });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                provider: user.provider,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            }
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user endpoint
app.get('/api/me', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            provider: user.provider,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
app.post('/api/logout', authenticateToken, (req, res) => {
    try {
        // Remove session
        const token = req.headers['authorization']?.split(' ')[1];
        sessions = sessions.filter(s => s.token !== token);
        
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Home page: http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/form/login.html`);
    console.log(`Signup page: http://localhost:${PORT}/form/signup.html`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    saveUsers();
    process.exit(0);
});