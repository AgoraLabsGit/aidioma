import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'

// Load environment variables
config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', (_req, res) => {
  res.json({ message: 'Auth routes coming soon...' })
})

app.use('/api/sentences', (_req, res) => {
  res.json({ message: 'Sentences routes coming soon...' })
})

app.use('/api/practice', (_req, res) => {
  res.json({ message: 'Practice routes coming soon...' })
})

app.use('/api/evaluation', (_req, res) => {
  res.json({ message: 'Evaluation routes coming soon...' })
})

app.use('/api/analytics', (_req, res) => {
  res.json({ message: 'Analytics routes coming soon...' })
})

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})
