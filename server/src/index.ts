import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import sentencesRoutes from './routes/sentences'

// Load environment variables
config()

const app = express()
const PORT = process.env.PORT || 3001

// Standardized API response helpers
const createSuccessResponse = <T>(data: T, message?: string) => ({
  success: true as const,
  data,
  message
})

const createErrorResponse = (error: string, details?: unknown, code?: string) => ({
  success: false as const,
  error,
  details,
  code
})

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5000',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json(createSuccessResponse({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  }))
})

// API routes with standardized responses
app.use('/api/auth', (_req, res) => {
  res.json(createSuccessResponse(
    { message: 'Auth routes coming soon...' },
    'Authentication endpoints will be available soon'
  ))
})

// Use routes
app.use('/api/sentences', sentencesRoutes)

app.use('/api/practice', (_req, res) => {
  res.json(createSuccessResponse(
    { message: 'Practice routes coming soon...' },
    'Practice session endpoints will be available soon'
  ))
})

app.use('/api/evaluation', (_req, res) => {
  res.json(createSuccessResponse(
    { message: 'Evaluation routes coming soon...' },
    'AI evaluation endpoints will be available soon'
  ))
})

app.use('/api/analytics', (_req, res) => {
  res.json(createSuccessResponse(
    { message: 'Analytics routes coming soon...' },
    'Learning analytics endpoints will be available soon'
  ))
})

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json(createErrorResponse(
    'Internal server error',
    process.env.NODE_ENV === 'development' ? err.message : undefined,
    'INTERNAL_ERROR'
  ))
})

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json(createErrorResponse(
    'Route not found',
    undefined,
    'NOT_FOUND'
  ))
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})
