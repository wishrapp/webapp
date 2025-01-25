import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { ThemeProvider } from './components/shared/ThemeProvider'
import { supabase } from './lib/supabase'
import App from './App'
import SignUp from './components/auth/SignUp'
import SignIn from './components/auth/SignIn'
import VerifyEmail from './components/auth/VerifyEmail'
import CompleteProfile from './components/auth/CompleteProfile'
import WishlistManager from './components/features/WishlistManager'
import WishlistViewer from './components/features/WishlistViewer'
import OccasionManager from './components/features/OccasionManager/OccasionManager'
import ProfileEditor from './components/features/ProfileEditor'
import Messages from './components/features/Messages'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/Dashboard'
import AdminUsers from './components/admin/Users'
import AdminEmails from './components/admin/Emails'
import AdminAffiliates from './components/admin/Affiliates'
import './index.css'

// Initialize Supabase session from localStorage
const initialSession = localStorage.getItem('sb-eawuqfqcrhwqdujwiorf-auth-token');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionContextProvider 
      supabaseClient={supabase} 
      initialSession={initialSession ? JSON.parse(initialSession) : null}
    >
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<App />} />
            <Route path="/wishlists" element={<WishlistManager />} />
            <Route path="/wishlists/:userId" element={<WishlistViewer />} />
            <Route path="/occasions" element={<OccasionManager />} />
            <Route path="/profile/edit" element={<ProfileEditor />} />
            <Route path="/messages" element={<Messages />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="emails" element={<AdminEmails />} />
              <Route path="affiliates" element={<AdminAffiliates />} />
            </Route>
            
            {/* Default redirect to dashboard if authenticated, otherwise to sign in */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </SessionContextProvider>
  </React.StrictMode>
)