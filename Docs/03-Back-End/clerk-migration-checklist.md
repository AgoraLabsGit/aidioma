# Clerk Migration Checklist
## Complete Migration from Stack Auth to Clerk

**Estimated Time:** 2-3 hours  
**Complexity:** Moderate  
**Risk Level:** Low (easily reversible)

---

## 🔍 **Pre-Migration Checklist**

### Prerequisites
- [ ] **Create Clerk account** at [clerk.com](https://clerk.com)
- [ ] **Create new Clerk application** in dashboard
- [ ] **Copy publishable key** from Clerk dashboard
- [ ] **Backup current `.env` files** (client and server)
- [ ] **Commit current working state** to git
- [ ] **Verify app currently works** at http://localhost:5001/

### Environment Preparation
- [ ] **Test environment without Stack Auth imports** (should work)
- [ ] **Document current Stack Auth URLs** for migration reference
- [ ] **Create migration branch**: `git checkout -b migration/clerk-auth`

---

## 📦 **Package Management Changes**

### Remove Stack Auth Dependencies
```bash
cd /Users/mike/Documents/Coding/Projects/AIdioma/AIdioma.V1/client
```
- [ ] **Remove Stack Auth packages**: `pnpm remove @stackframe/stack @stackframe/js`
- [ ] **Verify removal**: `pnpm list | grep stackframe` (should be empty)
- [ ] **Clean node_modules**: `rm -rf node_modules pnpm-lock.yaml`

### Install Clerk Dependencies
- [ ] **Install Clerk**: `pnpm add @clerk/clerk-react`
- [ ] **Reinstall all packages**: `pnpm install`
- [ ] **Verify Clerk installation**: `pnpm list | grep clerk`

---

## 🔧 **Environment Variable Updates**

### Client Environment (`.env`)
**File:** `/Users/mike/Documents/Coding/Projects/AIdioma/AIdioma.V1/client/.env`

#### Remove Stack Auth Variables
- [ ] **Remove**: `VITE_STACK_PROJECT_ID=beceff51-94d4-45b7-869d-13f52421804c`
- [ ] **Remove**: `VITE_STACK_PUBLISHABLE_CLIENT_KEY=pck_w0r7x90pj21cm2v5g38pe6ejg5j7xmjg0djq15y95egxg`
- [ ] **Remove**: `STACK_SECRET_SERVER_KEY=ssk_cr3n5d657vnjs6dvj448en3t8pp8trvepwfk9g9mqvq6g`

#### Add Clerk Variables
- [ ] **Add**: `VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here`
- [ ] **Replace placeholder** with actual Clerk publishable key
- [ ] **Verify format**: Key should start with `pk_test_` or `pk_live_`

### Server Environment (`.env`)
**File:** `/Users/mike/Documents/Coding/Projects/AIdioma/AIdioma.V1/server/.env`

#### Clean Up Stack Auth Variables
- [ ] **Remove quotes** from Stack Auth variables (if migrating later)
- [ ] **Or remove entirely** if server won't use auth initially
- [ ] **Keep database and AI variables** unchanged

---

## 💻 **Code Changes**

### 1. Main App Provider Setup
**File:** `/Users/mike/Documents/Coding/Projects/AIdioma/AIdioma.V1/client/src/main.tsx`

- [ ] **Import ClerkProvider**: Add `import { ClerkProvider } from '@clerk/clerk-react'`
- [ ] **Get environment variable**: Add `const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`
- [ ] **Add error check**: Add publishable key validation
- [ ] **Wrap App with ClerkProvider**: Replace/add provider wrapper
- [ ] **Set afterSignOutUrl**: Configure to `"/"`

### 2. Remove Stack Auth Client
**File:** `/Users/mike/Documents/Coding/Projects/AIdioma/AIdioma.V1/client/src/stack/client.ts`

- [ ] **Delete entire file**: `rm client/src/stack/client.ts`
- [ ] **Remove server file**: `rm client/src/stack/server.ts` (if exists)
- [ ] **Remove stack directory**: `rmdir client/src/stack` (if empty)

### 3. Update Authentication Pages

#### SignInPage Component
**File:** `/Users/mike/Documents/Coding/Projects/AIdioma/AIdioma.V1/client/src/pages/SignInPage.tsx`

- [ ] **Replace import**: Change `import { SignIn } from '@stackframe/stack'` to `import { SignIn } from '@clerk/clerk-react'`
- [ ] **Update component usage**: Change `<SignIn />` to `<SignIn routing="hash" />`
- [ ] **Update navigation links**: Change Stack Auth URLs to Clerk patterns
- [ ] **Test component renders**: Check for import errors

#### SignUpPage Component  
**File:** `/Users/mike/Documents/Coding/Projects/AIdioma/AIdioma.V1/client/src/pages/SignUpPage.tsx`

- [ ] **Replace import**: Change `import { SignUp } from '@stackframe/stack'` to `import { SignUp } from '@clerk/clerk-react'`
- [ ] **Update component usage**: Change `<SignUp />` to `<SignUp routing="hash" />`
- [ ] **Update navigation links**: Update footer links to Clerk patterns
- [ ] **Test component renders**: Check for import errors

### 4. Update Test Component
**File:** `/Users/mike/Documents/Coding/Projects/AIdioma/AIdioma.V1/client/src/pages/TestStackAuth.tsx`

- [ ] **Rename file**: `mv TestStackAuth.tsx TestAuth.tsx`
- [ ] **Update imports**: Replace Stack Auth imports with Clerk
- [ ] **Add Clerk status check**: Use `import { useAuth } from '@clerk/clerk-react'`
- [ ] **Update environment display**: Show Clerk environment variables
- [ ] **Test auth state detection**: Verify signed in/out states

### 5. Update App Router
**File:** `/Users/mike/Documents/Coding/Projects/AIdioma/AIdioma.V1/client/src/App.tsx`

- [ ] **Remove TestStackAuth import**: Remove Stack Auth test imports
- [ ] **Update test route**: Change `/test-auth` to use new component
- [ ] **Re-enable auth routes**: Uncomment SignInPage and SignUpPage imports
- [ ] **Update route components**: Change placeholder routes to actual auth components
- [ ] **Update landing page links**: Ensure Sign In/Up buttons work

---

## 🔐 **Authentication Integration**

### User State Management
**Files:** Any component using authentication

- [ ] **Replace useUser hook**: Change from `@stackframe/stack` to `@clerk/clerk-react`
- [ ] **Update user object access**: Clerk user object has different structure
- [ ] **Handle loading states**: Change from `loading` to `isLoaded`
- [ ] **Update authentication checks**: Use Clerk's `isSignedIn` pattern

### Protected Routes
**File:** `/Users/mike/Documents/Coding/Projects/AIdioma/AIdioma.V1/client/src/App.tsx`

- [ ] **Import Clerk components**: Add `import { SignedIn, SignedOut } from '@clerk/clerk-react'`
- [ ] **Wrap protected routes**: Use `<SignedIn>` for authenticated pages
- [ ] **Add unauthenticated fallbacks**: Use `<SignedOut>` for public pages
- [ ] **Test route protection**: Verify auth flow works

### User Profile Integration
**Files:** Components showing user info

- [ ] **Update user data access**: Change user property names to Clerk format
- [ ] **Add user profile components**: Import `UserButton` from Clerk
- [ ] **Update user display**: Show Clerk user information correctly
- [ ] **Test user profile**: Verify user data displays correctly

---

## 🧪 **Testing & Verification**

### Functionality Testing
- [ ] **Start development server**: `pnpm dev`
- [ ] **Test landing page**: Visit http://localhost:5001/
- [ ] **Test sign up flow**: Click Sign Up, verify form works
- [ ] **Test sign in flow**: Click Sign In, verify form works  
- [ ] **Test authenticated state**: Verify user shows as signed in
- [ ] **Test sign out**: Verify sign out works and redirects correctly
- [ ] **Test route protection**: Verify protected pages require auth

### Integration Testing
- [ ] **Test with backend**: Verify API calls still work
- [ ] **Test database integration**: Verify user data persists
- [ ] **Test cross-page navigation**: Verify auth state across pages
- [ ] **Test mobile responsiveness**: Check auth components on mobile
- [ ] **Test error handling**: Verify graceful error states

### Environment Testing
- [ ] **Test environment variables**: Verify Clerk key is loaded correctly
- [ ] **Test without auth**: Verify app works for unauthenticated users
- [ ] **Test different browsers**: Check compatibility
- [ ] **Test incognito mode**: Verify clean auth flow

---

## 🔍 **Code Quality Checks**

### TypeScript & Linting
- [ ] **Run TypeScript check**: `npx tsc --noEmit --skipLibCheck`
- [ ] **Run linting**: `pnpm run lint`
- [ ] **Fix any TypeScript errors**: Address type issues
- [ ] **Fix any linting warnings**: Clean up code style
- [ ] **Test build process**: `pnpm run build`

### Performance Verification
- [ ] **Check bundle size**: Verify Clerk doesn't significantly increase bundle
- [ ] **Test page load speed**: Ensure auth doesn't slow down app
- [ ] **Check console errors**: Verify no console warnings/errors
- [ ] **Test authentication speed**: Verify quick sign in/out

---

## 📋 **Final Verification Checklist**

### Functional Requirements
- [ ] ✅ **Landing page loads** with Sign In/Up buttons
- [ ] ✅ **Sign Up flow works** completely  
- [ ] ✅ **Sign In flow works** completely
- [ ] ✅ **User authentication state** persists across pages
- [ ] ✅ **Sign Out functionality** works correctly
- [ ] ✅ **Protected routes** require authentication
- [ ] ✅ **Public routes** work without authentication

### Technical Requirements
- [ ] ✅ **No TypeScript errors** in codebase
- [ ] ✅ **No linting warnings** in auth components
- [ ] ✅ **Build process succeeds** without errors
- [ ] ✅ **No console errors** during auth flow
- [ ] ✅ **Environment variables** properly configured
- [ ] ✅ **All Stack Auth references** removed

### Documentation Updates
- [ ] **Update getting-started.md**: Change port references and auth setup
- [ ] **Update environment documentation**: Remove Stack Auth, add Clerk
- [ ] **Update component documentation**: Document Clerk components
- [ ] **Create Clerk setup guide**: Document how to configure Clerk account

---

## 🔄 **Rollback Plan (If Needed)**

### Emergency Rollback Steps
1. [ ] **Switch to backup branch**: `git checkout main`
2. [ ] **Restore environment files**: Copy from backup
3. [ ] **Reinstall Stack Auth**: `pnpm add @stackframe/stack @stackframe/js`
4. [ ] **Remove Clerk**: `pnpm remove @clerk/clerk-react`
5. [ ] **Restore code changes**: `git checkout -- .`
6. [ ] **Test original functionality**: Verify Stack Auth works (will still have original issues)

### Rollback Verification
- [ ] **App loads without errors**
- [ ] **Original environment restored**
- [ ] **No Clerk references remain**
- [ ] **Stack Auth imports restored**

---

## 📊 **Post-Migration Tasks**

### Cleanup
- [ ] **Remove Stack Auth environment variables** from all env files
- [ ] **Delete migration branch** after successful merge
- [ ] **Update documentation** to reflect Clerk integration
- [ ] **Clean up any unused imports** or files

### Optimization
- [ ] **Configure Clerk appearance** to match AIdioma design
- [ ] **Set up Clerk webhooks** for user sync (if needed)
- [ ] **Configure social sign-in providers** (optional)
- [ ] **Set up user management** in Clerk dashboard

### Monitoring
- [ ] **Monitor authentication success rates**
- [ ] **Check for any authentication errors**
- [ ] **Verify user experience** in production
- [ ] **Document any issues** for future reference

---

## 🎯 **Success Criteria**

**Migration is successful when:**
1. ✅ Users can sign up and sign in without errors
2. ✅ Authentication state persists across page navigation  
3. ✅ Protected routes properly require authentication
4. ✅ No TypeScript or build errors exist
5. ✅ App performance is maintained or improved
6. ✅ All existing functionality still works

**Migration is complete when:**
- All Stack Auth references are removed
- Clerk integration is fully functional
- Documentation is updated
- Testing is successful
- Code quality checks pass

---

**Created:** [Date]  
**Last Updated:** [Date]  
**Migration Status:** Pending  
**Estimated Duration:** 2-3 hours  
**Assigned To:** [Developer Name]
