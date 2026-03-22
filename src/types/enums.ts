export enum Urgency {
  Emergency = 'emergency',
  Urgent = 'urgent',
  Routine = 'routine',
}

export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export enum SessionStatus {
  Active = 'active',
  Completed = 'completed',
  Abandoned = 'abandoned',
}

export enum ConsultationType {
  EmergencyRoom = 'emergency-room',
  FirstAppointment = 'first-appointment',
  CheckUp = 'check-up',
  Cardiology = 'cardiography',
  StressTest = 'stress-test',
  Imaging = 'imaging',
  FollowUp = 'follow-up',
}

export enum NextSteps {
  CallEmergency = 'call-emergency',
  ScheduleUrgent = 'schedule-urgent',
  Schedule = 'schedule',
  SelfCare = 'self-care',
}
