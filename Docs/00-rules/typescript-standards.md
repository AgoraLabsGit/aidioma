# TypeScript Standards

**ZERO TOLERANCE**: No `any` types allowed. All code must be strictly typed.

## Interface Requirements
```typescript
// ✅ CORRECT: Strict typing with proper interfaces
interface EvaluationInput {
  sentenceId: number
  userTranslation: string
  correctAnswers: string[]
  context: EvaluationContext
}

interface EvaluationResult {
  score: number
  grade: 'F' | 'D' | 'C' | 'B' | 'A' | 'A+'
  feedback: string
  grammarErrors: GrammarError[]
  culturalNotes?: string[]
  evaluationTime: number
  cached: boolean
}

// ❌ FORBIDDEN: any usage
function evaluate(input: any): any {
  return { score: input.something }
}
```

## Generic Type Patterns
```typescript
// ✅ CORRECT: Use generics for reusable types
interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  timestamp: Date
}

interface ModuleInterface<TConfig, TState> {
  initialize(config: TConfig): Promise<void>
  getState(): TState
  cleanup(): Promise<void>
}

// ✅ CORRECT: Proper error typing
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
```

## Type Guards and Narrowing
```typescript
// ✅ CORRECT: Use type guards for runtime validation
function isEvaluationInput(obj: unknown): obj is EvaluationInput {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as EvaluationInput).sentenceId === 'number' &&
    typeof (obj as EvaluationInput).userTranslation === 'string'
  )
}

// ✅ CORRECT: Discriminated unions for state management
type ModuleState = 
  | { status: 'initializing' }
  | { status: 'ready'; data: ModuleData }
  | { status: 'error'; error: string }
  | { status: 'loading'; progress: number }
```

## Function Signatures
```typescript
// ✅ CORRECT: Explicit return types for public APIs
export async function evaluateTranslation(
  input: EvaluationInput
): Promise<EvaluationResult> {
  // Implementation
}

// ✅ CORRECT: Proper async/await typing
async function fetchUserData(
  userId: string
): Promise<UserData | null> {
  try {
    const response = await api.get<UserData>(`/users/${userId}`)
    return response.data
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null
    }
    throw error
  }
}
```

## Event and Callback Typing
```typescript
// ✅ CORRECT: Strongly typed event handlers
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  onSubmit?: (data: FormData) => Promise<void>
  children: React.ReactNode
}

// ✅ CORRECT: Typed callback patterns
type StateChangeCallback<T> = (newState: T, prevState: T) => void

interface EventBus {
  subscribe<T>(event: string, callback: (data: T) => void): () => void
  emit<T>(event: string, data: T): void
}
```

## Common Type Utilities
```typescript
// ✅ CORRECT: Use built-in utility types
type PartialConfig = Partial<ModuleConfig>
type RequiredFields = Required<Pick<User, 'id' | 'email'>>
type UserWithoutPassword = Omit<User, 'password'>

// ✅ CORRECT: Custom utility types for domain
type NonEmptyArray<T> = [T, ...T[]]
type TimestampedData<T> = T & { createdAt: Date; updatedAt: Date }
```

## TSConfig Requirements
Ensure these compiler options are enabled:
- `strict: true`
- `noImplicitAny: true`
- `noImplicitReturns: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true` 