export type UserRole = "citizen" | "verifier" | "admin" | "csr_partner"

export type TaskCategory = "garbage" | "pothole" | "graffiti" | "drainage" | "streetlight" | "illegal_dump" | "tree_planting" | "other"

export type TaskSeverity = "low" | "medium" | "high" | "critical"

export type TaskStatus = "open" | "claimed" | "submitted" | "verified" | "rejected" | "expired"

export type ProofType = "before_photo" | "after_photo" | "video" | "timestamp" | "location" | "additional"

export type VerificationStatus = "pending" | "approved" | "rejected" | "flagged"

export type TransactionType = "earned" | "redeemed" | "bonus" | "penalty" | "transfer"

export type BadgeCategory = "milestone" | "streak" | "special" | "achievement" | "impact"

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
  phone?: string | null
  role: UserRole
  avatar_url?: string | null;
  full_name?: string;
  location?: any // GEOGRAPHY(POINT) is complex to type directly, treated as any or GeoJSON
  city?: string | null
  state?: string | null

  // Gamification
  total_tokens: number
  total_xp: number
  level: number
  current_streak: number
  longest_streak: number

  // Reputation
  verification_level: number
  tasks_completed: number
  tasks_verified: number
  impact_score: number

  // Timestamps
  last_activity_date?: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string

  // Classification
  category: TaskCategory
  severity: TaskSeverity

  // Location
  location_geo?: any // GEOGRAPHY(POINT) - PostGIS string or object
  location_address?: string | null
  city?: string | null

  // Media
  image_url: string

  // Rewards
  reward_amount: number

  // Status tracking
  status: TaskStatus

  // User relationships
  posted_by?: string | null
  claimed_by?: string | null
  verified_by?: string | null

  // Timestamps
  created_at: string
  updated_at: string

  // Legacy/Optional/Future compatibility
  difficulty?: "easy" | "medium" | "hard"
  state?: string
  pincode?: string | null
  token_reward?: number // Alias for reward_amount in legacy code
  xp_reward?: number
  expires_at?: string | null
  required_proof_types?: ProofType[]
  csr_partner_id?: string | null
  visibility?: "public" | "private" | "csr_only"
  tags?: string[] | null
}

export interface TaskProof {
  id: string
  task_id: string
  user_id: string

  proof_type: ProofType

  // Media
  media_url: string
  media_type: "image" | "video"
  thumbnail_url?: string | null

  // Metadata
  caption?: string | null
  location?: any
  exif_data?: Record<string, any> | null

  // AI Analysis
  ai_analysis?: Record<string, any> | null

  created_at: string
}

export interface Verification {
  id: string
  task_id: string
  verifier_id: string

  // Verification result
  status: VerificationStatus

  // Quality scores
  quality_score?: number | null
  cleanliness_score?: number | null
  impact_score?: number | null
  overall_score?: number | null

  // Feedback
  notes?: string | null
  rejection_reason?: string | null

  // AI assistance
  ai_confidence_score?: number | null
  verification_method: "manual" | "ai" | "hybrid"

  created_at: string
}

export interface TokenTransaction {
  id: string
  user_id: string

  transaction_type: TransactionType

  amount: number
  balance_after: number

  // References
  task_id?: string | null
  redemption_id?: string | null

  description?: string | null
  metadata?: Record<string, any> | null

  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url?: string | null

  category: BadgeCategory

  rarity: BadgeRarity

  // Criteria for earning
  criteria: Record<string, any>

  // Rewards
  reward_tokens: number
  reward_xp: number

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

// Materialized View Type
export interface LeaderboardEntry {
  user_id: string
  display_name: string
  avatar_url?: string | null
  city?: string | null
  state?: string | null
  total_tokens: number
  total_xp: number
  level: number
  tasks_completed: number
  current_streak: number
  impact_score: number
  global_rank: number
  city_rank: number
  updated_at: string
}

export interface RedemptionOption {
  id: string
  title: string
  description: string
  category: "voucher" | "merchandise" | "donation" | "cash" | "certificate" | "experience"
  tokens_required: number
  image_url?: string | null
  icon_name?: string | null
  partner_id?: string | null
  stock_quantity: number
  is_active: boolean
  created_at: string
}

export interface Redemption {
  id: string
  user_id: string

  reward_type: string
  reward_details: Record<string, any>
  tokens_spent: number

  status: "pending" | "approved" | "delivered" | "cancelled"

  csr_partners?: {
    name: string;
  };

  redemption_code?: string | null

  created_at: string
  fulfilled_at?: string | null
}

export interface Notification {
  id: string
  user_id: string

  type: NotificationType

  title: string
  message: string
  link?: string | null

  read: boolean
  metadata?: Record<string, any> | null

  created_at: string
}

export interface CSRPartner {
  id: string
  profile_id: string

  company_name: string
  description?: string | null
  logo_url?: string | null
  website?: string | null

  contact_email: string
  contact_phone?: string | null

  total_budget: number
  spent_budget: number
  available_budget: number

  tasks_sponsored: number
  tokens_distributed: number

  verification_status: "pending" | "verified" | "rejected"
  is_active: boolean
  created_at: string
}
