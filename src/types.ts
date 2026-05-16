export interface UserProfile {
  uid: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  age: number;
  gender: string;
  bloodGroup: string;
  village: string;
  userType: 'Admin' | 'Volunteer' | 'Visitor' | string;
  address: string;
  profilePhotoUrl: string;
  idProofType: string;
  idProofUrl: string;
  createdAt: any; // serverTimestamp
  // Volunteer specific
  volunteerId?: string;
  verified?: boolean;
  assignedArea?: string;
  totalHours?: number;
  peopleHelped?: number;
  rating?: number;
  joinedAt?: any;
  about?: string;
}

export interface CrowdStatus {
  id: string;
  location: string;
  level: 'Low' | 'Medium' | 'Heavy';
  updatedAt: any;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  module: string;
  timestamp: any;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'emergency' | 'event' | 'missing' | 'parking';
  sentBy: string;
  sentAt: any;
  targetRoles: string[]; // ['Visitor', 'Volunteer']
}

export type TaskStatus = 'Assigned' | 'In Progress' | 'Completed' | 'Pending';

export interface VolunteerTask {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  status: TaskStatus;
  assignedVolunteerId: string;
  createdAt: any;
  iconType?: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: string;
  status: 'ongoing' | 'upcoming' | 'completed';
  location: string;
  imageUrl?: string;
  createdAt?: any;
}

export interface LostFoundReport {
  id: string;
  type: 'lost' | 'found';
  fullName: string;
  phoneNumber: string;
  village: string;
  itemName: string;
  category: string;
  description: string;
  location: string;
  dateTime: string;
  contactNumber: string;
  imageUrl?: string;
  status: 'pending' | 'resolved' | 'urgent';
  emergency: boolean;
  createdBy: string;
  createdAt: any;
  uploadedAt?: any;
}

export interface ParkingLocation {
  id: string;
  name: string;
  type: 'parking' | 'police' | 'medical' | 'temple' | 'water' | 'exit';
  latitude: number;
  longitude: number;
  capacity?: string;
  status: string;
  description: string;
  updatedAt: any;
}

export interface SafetyAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'emergency';
  createdAt: any;
}

export interface CulturalStory {
  id: string;
  title: string;
  shortDescription: string;
  fullStory: string;
  imageUrl: string;
  category: string;
  language: string;
  audioUrl?: string;
  createdAt: any;
}

export interface EmergencyContact {
  id: string;
  title: string;
  description?: string;
  contactNumber: string;
  type: 'police' | 'ambulance' | 'medical' | 'volunteer';
  location?: string;
  updatedAt: any;
}

export interface SafetyGuideline {
  id: string;
  title: string;
  description: string;
  category: string;
  updatedAt: any;
}

export interface EmergencyMessage {
  id: string;
  userId: string;
  userName: string;
  recipient: string;
  message: string;
  status: 'sent' | 'read' | 'resolved';
  createdAt: any;
}

export interface FestivalAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'parking' | 'missing' | 'notice';
  priority: 'high' | 'medium' | 'low';
  iconType: string;
  isNew: boolean;
  relatedLocation?: string;
  createdAt: any;
}
