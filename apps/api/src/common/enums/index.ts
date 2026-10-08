export enum UserRole {
  MANAGER = 'MANAGER',
  COACH = 'COACH',
  ATHLETE = 'ATHLETE',
  VIEWER = 'VIEWER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum AthleteStatus {
  ACTIVE = 'ACTIVE',
  UNAVAILABLE = 'UNAVAILABLE',
  INJURED = 'INJURED',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export enum ActivityType {
  TRAINING = 'TRAINING',
  MATCH = 'MATCH',
  MEETING = 'MEETING',
  EVENT = 'EVENT',
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  EXCUSED = 'EXCUSED',
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  MAYBE = 'MAYBE',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum MatchVenueType {
  HOME = 'HOME',
  AWAY = 'AWAY',
  NEUTRAL = 'NEUTRAL',
}

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MatchResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  DRAW = 'DRAW',
}

export enum SquadStatus {
  STARTING = 'STARTING',
  SUBSTITUTE = 'SUBSTITUTE',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum MatchEventType {
  GOAL = 'GOAL',
}

export enum AnnouncementPriority {
  NORMAL = 'NORMAL',
  IMPORTANT = 'IMPORTANT',
  URGENT = 'URGENT',
}

export enum AnnouncementAudience {
  ALL_TEAM = 'ALL_TEAM',
  COACH = 'COACH',
  ATHLETE = 'ATHLETE',
  MANAGER = 'MANAGER',
}

export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}
