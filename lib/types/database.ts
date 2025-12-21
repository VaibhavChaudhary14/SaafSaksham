export type UserRole = "citizen" | "verifier" | "admin" | "csr_partner"

export type TaskCategory = "garbage" | "pothole" | "graffiti" | "drainage" | "streetlight" | "illegal_dump" | "other"

export type TaskSeverity = "low" | "medium" | "high" | "critical"

export type TaskStatus = "open" | "claimed" | "submitted" | "verified" | "rejected" | "expired"

export type ProofType = "before_photo" | "after_photo" | "video" | "timestamp" | "location" | "additional"

export type VerificationStatus = "pending" | "approved" | "rejected" | "flagged"

export type TransactionType = "earned" | "redeemed" | "bonus" | "penalty" | "transfer"

export type RedemptionCategory = "voucher" | "merchandise" | "donation" | "discount" | "service"

export type BadgeCategory = "milestone" | "streak" | "special" | "achievement"

export type BadgeRarity = "common" | "rare" | "epic" | "legendary"

export type NotificationType =
  | "task_claimed"
  | "task_verified"
  | "task_rejected"
  | "badge_earned"
  | "token_earned"
  | "level_up"
  | "streak_milestone"
  | "system"

export interface Profile {
  id: string
  display_name: string
  phone?: string
  role: UserRole
  avatar_url?: string
  bio?: string
  location_lat?: number
  location_lng?: number
  city?: string
  state?: string
  pincode?: string
  aadhar_verified: boolean
  verification_level: number
  total_tokens: number
  total_xp: number
  current_streak: number
  longest_streak: number
  last_activity_date?: string
  tasks_completed: number
  tasks_verified: number
  impact_score: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  severity: TaskSeverity
  location_lat: number
  location_lng: number
  location_address?: string
  city: string
  state: string
  pincode?: string
  token_reward: number
  xp_reward: number
  estimated_time?: number
  status: TaskStatus
  posted_by?: string
  claimed_by?: string
  verified_by?: string
  claimed_at?: string
  submitted_at?: string
  verified_at?: string
  expires_at?: string
  required_proof_types: ProofType[]
  tags?: string[]
  visibility: "public" | "private" | "csr_only"
  csr_partner_id?: string
  created_at: string
  updated_at: string
}

export interface TaskProof {
  id: string
  task_id: string
  user_id: string
  proof_type: ProofType
  media_url: string
  media_type: "image" | "video"
  caption?: string
  location_lat?: number
  location_lng?: number
  metadata?: Record<string, any>
  ai_analysis?: Record<string, any>
  created_at: string
}

export interface Verification {
  id: string
  task_id: string
  verifier_id: string
  status: VerificationStatus
  quality_score?: number
  cleanliness_score?: number
  impact_score?: number
  notes?: string
  rejection_reason?: string
  ai_confidence_score?: number
  verification_method: "manual" | "ai" | "hybrid"
  created_at: string
}

export interface TokenTransaction {
  id: string
  user_id: string
  transaction_type: TransactionType
  amount: number
  balance_after: number
  task_id?: string
  redemption_id?: string
  description?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface RedemptionOption {
  id: string
  title: string
  description: string
  category: RedemptionCategory
  token_cost: number
  provider?: string
  provider_logo_url?: string
  image_url?: string
  terms_conditions?: string
  stock_available?: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Redemption {
  id: string
  user_id: string
  redemption_option_id: string
  tokens_spent: number
  status: "pending" | "approved" | "delivered" | "cancelled"
  delivery_details?: Record<string, any>
  redemption_code?: string
  redeemed_at?: string
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url?: string
  category: BadgeCategory
  rarity: BadgeRarity
  criteria: Record<string, any>
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

export interface LeaderboardEntry {
  user_id: string
  display_name: string
  avatar_url?: string
  total_tokens: number
  total_xp: number
  tasks_completed: number
  current_streak: number
  impact_score: number
  rank?: number
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  is_read: boolean
  metadata?: Record<string, any>
  created_at: string
}

export interface CSRPartner {
  id: string
  partner_id: string
  company_name: string
  logo_url?: string
  description?: string
  website?: string
  contact_email?: string
  contact_phone?: string
  total_budget: number
  spent_budget: number
  tasks_sponsored: number
  is_verified: boolean
  is_active: boolean
  created_at: string
}
