# Module Development Guide
## How to Build and Integrate AIdioma Modules

---

## 🎯 **Module Development Overview**

AIdioma's modular architecture allows developers to create reusable services that work across multiple pages. This guide provides step-by-step instructions for building compliant modules.

### **Module Requirements**
- **IStorage Integration**: All database operations through storage interface
- **TypeScript Compliance**: Strict typing with no `any` types
- **Framework Standards**: Follows established patterns and conventions
- **Cross-Page Reusability**: Can be used by multiple pages
- **Error Handling**: Graceful fallbacks and proper error management

---

## 📋 **Step-by-Step Module Creation**

### **Step 1: Define Module Specification**

Create specification document in `03-architecture/modules/[module-name].md`:

```markdown
# [Module Name]
## Purpose and Integration Points

### Core Purpose
[What problem this module solves]

### API Interface
```typescript
interface [ModuleName]Service {
  [methodName](param: Type): Promise<ReturnType>
}
```

### Integration Points
- **Pages**: Which pages use this module
- **Dependencies**: Other modules this depends on
- **Data Flow**: How data moves through the module
```

### **Step 2: Update Shared Schema**

Add types to `shared/schema.ts`:

```typescript
// shared/schema.ts

// Database tables (if needed)
export const newModuleTable = pgTable('new_module_data', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// TypeScript interfaces
export interface NewModuleData {
  id: number
  userId: string
  data: any // Replace with specific type
  createdAt: Date
  updatedAt: Date
}

export type NewNewModuleData = typeof newModuleTable.$inferInsert
export type NewModuleDataSelect = typeof newModuleTable.$inferSelect

// API types
export interface NewModuleRequest {
  userId: string
  input: string
  options?: NewModuleOptions
}

export interface NewModuleResponse {
  success: boolean
  data?: ProcessedData
  error?: string
}

export interface NewModuleOptions {
  includeDetails: boolean
  processingLevel: 'basic' | 'advanced'
}
```

### **Step 3: Extend IStorage Interface**

Add methods to `server/storage.ts`:

```typescript
// server/storage.ts

export interface IStorage {
  // Existing methods...
  
  // New module methods
  storeNewModuleData(data: NewNewModuleData): Promise<NewModuleData>
  getNewModuleData(userId: string): Promise<NewModuleData[]>
  updateNewModuleData(id: number, updates: Partial<NewModuleData>): Promise<void>
  deleteNewModuleData(id: number): Promise<void>
}

// Implementation in storage class
export class DrizzleStorage implements IStorage {
  // Existing implementations...
  
  async storeNewModuleData(data: NewNewModuleData): Promise<NewModuleData> {
    const [result] = await this.db
      .insert(newModuleTable)
      .values(data)
      .returning()
    return result
  }
  
  async getNewModuleData(userId: string): Promise<NewModuleData[]> {
    return await this.db
      .select()
      .from(newModuleTable)
      .where(eq(newModuleTable.userId, userId))
      .orderBy(desc(newModuleTable.createdAt))
  }
  
  async updateNewModuleData(id: number, updates: Partial<NewModuleData>): Promise<void> {
    await this.db
      .update(newModuleTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(newModuleTable.id, id))
  }
  
  async deleteNewModuleData(id: number): Promise<void> {
    await this.db
      .delete(newModuleTable)
      .where(eq(newModuleTable.id, id))
  }
}
```

### **Step 4: Create Service Implementation**

Create service in `server/services/newModuleService.ts`:

```typescript
// server/services/newModuleService.ts

import { IStorage } from '../storage.js'
import { NewModuleRequest, NewModuleResponse, NewModuleData } from '../../shared/schema.js'

export class NewModuleService {
  constructor(private storage: IStorage) {}
  
  async processRequest(request: NewModuleRequest): Promise<NewModuleResponse> {
    try {
      // Validate input
      const validated = this.validateInput(request)
      if (!validated.valid) {
        return { success: false, error: validated.error }
      }
      
      // Core business logic
      const processed = await this.processData(request)
      
      // Store results
      const stored = await this.storage.storeNewModuleData({
        userId: request.userId,
        data: processed,
      })
      
      return {
        success: true,
        data: processed
      }
    } catch (error) {
      console.error('NewModuleService error:', error)
      return {
        success: false,
        error: 'Processing failed. Please try again.'
      }
    }
  }
  
  private validateInput(request: NewModuleRequest): { valid: boolean, error?: string } {
    if (!request.userId) {
      return { valid: false, error: 'User ID is required' }
    }
    
    if (!request.input || request.input.trim().length === 0) {
      return { valid: false, error: 'Input is required' }
    }
    
    // Add specific validation logic
    
    return { valid: true }
  }
  
  private async processData(request: NewModuleRequest): Promise<any> {
    // Implement core module logic here
    // This is where the main functionality goes
    
    const result = {
      processedInput: request.input.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      options: request.options || {}
    }
    
    return result
  }
  
  async getUserData(userId: string): Promise<NewModuleData[]> {
    return await this.storage.getNewModuleData(userId)
  }
  
  async updateData(id: number, updates: Partial<NewModuleData>): Promise<void> {
    await this.storage.updateNewModuleData(id, updates)
  }
}
```

### **Step 5: Create API Routes**

Add routes to `server/routes.ts`:

```typescript
// server/routes.ts

import { NewModuleService } from './services/newModuleService.js'

// Initialize service
const newModuleService = new NewModuleService(storage)

// POST endpoint for processing
app.post('/api/new-module/process', isAuthenticated, async (req, res) => {
  try {
    const request: NewModuleRequest = {
      userId: req.user.id,
      input: req.body.input,
      options: req.body.options
    }
    
    const result = await newModuleService.processRequest(request)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// GET endpoint for user data
app.get('/api/new-module/data', isAuthenticated, async (req, res) => {
  try {
    const data = await newModuleService.getUserData(req.user.id)
    res.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data'
    })
  }
})
```

### **Step 6: Create React Hook**

Create custom hook in `client/src/hooks/useNewModule.ts`:

```typescript
// client/src/hooks/useNewModule.ts

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getQueryFn, postQueryFn } from '../lib/queryFns'
import type { NewModuleRequest, NewModuleResponse, NewModuleData } from '../../../shared/schema'

export function useNewModule(userId: string) {
  const queryClient = useQueryClient()
  
  // Fetch user data
  const { data: userData, isLoading: isLoadingData } = useQuery({
    queryKey: ['newModule', userId],
    queryFn: getQueryFn<{ data: NewModuleData[] }>({ on401: 'throw' }),
    enabled: !!userId
  })
  
  // Process mutation
  const processMutation = useMutation({
    mutationFn: (request: Omit<NewModuleRequest, 'userId'>) =>
      postQueryFn<NewModuleResponse>({ on401: 'throw' })('/api/new-module/process', {
        ...request,
        userId
      }),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['newModule', userId] })
    }
  })
  
  const processData = async (input: string, options?: any) => {
    return processMutation.mutateAsync({ input, options })
  }
  
  return {
    userData: userData?.data || [],
    isLoadingData,
    processData,
    isProcessing: processMutation.isPending,
    processError: processMutation.error
  }
}
```

### **Step 7: Create React Components**

Create components in `client/src/components/newModule/`:

```typescript
// client/src/components/newModule/NewModuleInterface.tsx

import { useState } from 'react'
import { useNewModule } from '../../hooks/useNewModule'

interface NewModuleInterfaceProps {
  userId: string
  onResult?: (result: any) => void
}

export function NewModuleInterface({ userId, onResult }: NewModuleInterfaceProps) {
  const [input, setInput] = useState('')
  const { processData, isProcessing, processError } = useNewModule(userId)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim()) return
    
    try {
      const result = await processData(input.trim())
      if (result.success) {
        onResult?.(result.data)
        setInput('') // Clear input on success
      }
    } catch (error) {
      console.error('Processing failed:', error)
    }
  }
  
  return (
    <div className="new-module-interface">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="input" className="block text-sm font-medium mb-2">
            Enter your input:
          </label>
          <input
            id="input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Type something..."
            disabled={isProcessing}
          />
        </div>
        
        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Process'}
        </button>
        
        {processError && (
          <div className="text-red-600 text-sm">
            Error: {processError.message}
          </div>
        )}
      </form>
    </div>
  )
}
```

---

## 🔧 **Module Integration Patterns**

### **Cross-Module Communication**
```typescript
// When one module needs to use another module's service

// In constructor, inject dependencies
class EnhancedModuleService {
  constructor(
    private storage: IStorage,
    private otherModuleService: OtherModuleService
  ) {}
  
  async processWithDependency(input: any): Promise<any> {
    // Use other module's functionality
    const preprocessed = await this.otherModuleService.preprocess(input)
    
    // Apply this module's logic
    const result = await this.processData(preprocessed)
    
    return result
  }
}
```

### **Event-Driven Updates**
```typescript
// For modules that need to react to events from other modules

interface ModuleEvent {
  type: string
  userId: string
  data: any
  timestamp: Date
}

class EventBus {
  private listeners: Map<string, Function[]> = new Map()
  
  emit(event: ModuleEvent): void {
    const handlers = this.listeners.get(event.type) || []
    handlers.forEach(handler => handler(event))
  }
  
  on(eventType: string, handler: Function): void {
    const handlers = this.listeners.get(eventType) || []
    handlers.push(handler)
    this.listeners.set(eventType, handlers)
  }
}

// Usage in modules
class ReactiveModuleService {
  constructor(
    private storage: IStorage,
    private eventBus: EventBus
  ) {
    // Listen for events from other modules
    this.eventBus.on('user_progress_updated', this.handleProgressUpdate.bind(this))
  }
  
  private async handleProgressUpdate(event: ModuleEvent): Promise<void> {
    // React to progress updates
    await this.updateModuleState(event.userId, event.data)
  }
}
```

---

## 📊 **Testing Module Implementation**

### **Unit Tests Template**
```typescript
// tests/services/newModuleService.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NewModuleService } from '../../server/services/newModuleService'
import { MockStorage } from '../mocks/MockStorage'

describe('NewModuleService', () => {
  let service: NewModuleService
  let mockStorage: MockStorage
  
  beforeEach(() => {
    mockStorage = new MockStorage()
    service = new NewModuleService(mockStorage)
  })
  
  describe('processRequest', () => {
    it('should process valid input successfully', async () => {
      const request = {
        userId: 'test-user',
        input: 'test input',
        options: { includeDetails: true }
      }
      
      const result = await service.processRequest(request)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(mockStorage.storeNewModuleData).toHaveBeenCalled()
    })
    
    it('should handle invalid input gracefully', async () => {
      const request = {
        userId: '',
        input: '',
        options: {}
      }
      
      const result = await service.processRequest(request)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
```

### **Integration Tests**
```typescript
// tests/integration/newModule.test.ts

import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../../server/index'

describe('New Module API', () => {
  it('should process data via API', async () => {
    const response = await request(app)
      .post('/api/new-module/process')
      .send({
        input: 'test input',
        options: { includeDetails: true }
      })
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(response.body.data).toBeDefined()
  })
})
```

---

## 📋 **Module Quality Checklist**

### **Pre-Implementation**
- [ ] Module specification document created
- [ ] Integration points identified
- [ ] Dependencies mapped
- [ ] API interface designed

### **Implementation**
- [ ] Types added to `shared/schema.ts`
- [ ] IStorage interface extended
- [ ] Service implements error handling
- [ ] API routes follow standard format
- [ ] React hook created for frontend integration
- [ ] Components are reusable and typed

### **Testing & Quality**
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests added
- [ ] TypeScript compilation clean
- [ ] No `any` types used
- [ ] Error cases handled gracefully

### **Documentation**
- [ ] Module specification updated
- [ ] API documentation added
- [ ] Integration examples provided
- [ ] README updated with new module

### **Integration**
- [ ] Works across multiple pages
- [ ] Follows established patterns
- [ ] Performance requirements met
- [ ] No breaking changes to existing modules

---

This guide ensures all AIdioma modules maintain consistency, quality, and reusability while integrating seamlessly with the existing architecture.