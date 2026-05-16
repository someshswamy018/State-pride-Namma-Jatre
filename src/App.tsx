/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StrictMode, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import Splash from './components/Splash';
import Login from './components/Login';
import OTP from './components/OTP';
import Register from './components/Register';
import Home from './components/Home';
import Events from './components/Events';
import LostAndFound from './components/LostAndFound';
import MapScreen from './components/MapScreen';
import Stories from './components/Stories';
import Emergency from './components/Emergency';
import Announcements from './components/Announcements';
import Alerts from './components/Alerts';
import Profile from './components/Profile';
import EventDetails from './components/EventDetails';
import ReportItem from './components/ReportItem';
import LostFoundDetails from './components/LostFoundDetails';
import StoryDetails from './components/StoryDetails';
import SafetyGuidelines from './components/SafetyGuidelines';
import AnnouncementDetails from './components/AnnouncementDetails';
import About from './components/About';
import VolunteerHome from './components/VolunteerHome';
import VolunteerTasks from './components/VolunteerTasks';
import VolunteerProfileView from './components/VolunteerProfileView';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminEvents from './components/admin/AdminEvents';
import AdminLostFound from './components/admin/AdminLostFound';
import AdminUsers from './components/admin/AdminUsers';
import AdminAlerts from './components/admin/AdminAlerts';
import AdminCrowd from './components/admin/AdminCrowd';
import AdminSettings from './components/admin/AdminSettings';
import AdminAnalytics from './components/admin/AdminAnalytics';

import { LanguageProvider } from './context/LanguageContext';

function AppContent() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:eventId" element={<EventDetails />} />
        <Route path="/lost-found" element={<LostAndFound />} />
        <Route path="/lost-found/:reportId" element={<LostFoundDetails />} />
        <Route path="/report-item" element={<ReportItem />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/story/:storyId" element={<StoryDetails />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/safety-guidelines" element={<SafetyGuidelines />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/announcement/:announcementId" element={<AnnouncementDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/volunteer/home" element={<VolunteerHome />} />
        <Route path="/volunteer/tasks" element={<VolunteerTasks />} />
        <Route path="/volunteer/profile" element={<VolunteerProfileView />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/lost-found" element={<AdminLostFound />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/alerts" element={<AdminAlerts />} />
        <Route path="/admin/crowd" element={<AdminCrowd />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-[#FDF5E6] font-sans selection:bg-orange-200 overflow-x-hidden">
          <AppContent />
          <div id="recaptcha-container" className="fixed bottom-0"></div>
        </div>
      </Router>
    </LanguageProvider>
  );
}

