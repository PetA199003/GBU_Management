/*
  # Initial Database Schema for GBU Management System

  1. New Tables
    - `users` - User accounts with roles
    - `projects` - Event projects
    - `hazards` - Global hazard library
    - `control_measures` - Safety control measures
    - `project_hazards` - Project-specific hazard assignments
    - `participants` - Project participants
    - `briefings` - Safety briefings
    - `signatures` - Digital signatures
    - `criteria_categories` - Custom criteria definitions
    - `audit_logs` - System audit trail

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure data access based on user roles

  3. Features
    - User role hierarchy (ADMIN > PROJEKTLEITER > MITARBEITER)
    - Project ownership and access control
    - Audit logging for all changes
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'PROJEKTLEITER', 'MITARBEITER');
CREATE TYPE project_status AS ENUM ('ENTWURF', 'AKTIV', 'ARCHIVIERT');
CREATE TYPE hazard_category AS ENUM ('ELEKTRIK', 'RIGGING', 'PYROTECHNIK', 'WETTER', 'VERKEHR', 'LAERM', 'HOEHE', 'CHEMISCH', 'MECHANISCH', 'BRAND', 'SONSTIGE');
CREATE TYPE control_type AS ENUM ('TECHNISCH', 'ORGANISATORISCH', 'PPE');
CREATE TYPE criteria_type AS ENUM ('boolean', 'select', 'multiselect');
CREATE TYPE criteria_category AS ENUM ('location', 'project', 'season', 'custom');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role user_role DEFAULT 'MITARBEITER',
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  is_outdoor BOOLEAN DEFAULT FALSE,
  build_up_start TIMESTAMPTZ NOT NULL,
  build_up_end TIMESTAMPTZ NOT NULL,
  event_start TIMESTAMPTZ NOT NULL,
  event_end TIMESTAMPTZ NOT NULL,
  status project_status DEFAULT 'ENTWURF',
  
  -- Hazard analysis questions
  has_electricity BOOLEAN DEFAULT FALSE,
  has_generator BOOLEAN DEFAULT FALSE,
  has_hazardous_materials BOOLEAN DEFAULT FALSE,
  has_work_above_2m BOOLEAN DEFAULT FALSE,
  has_public_access BOOLEAN DEFAULT FALSE,
  has_night_work BOOLEAN DEFAULT FALSE,
  has_traffic_area BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hazards table (global library)
CREATE TABLE IF NOT EXISTS hazards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category hazard_category,
  default_likelihood INTEGER DEFAULT 3 CHECK (default_likelihood >= 1 AND default_likelihood <= 5),
  default_severity INTEGER DEFAULT 3 CHECK (default_severity >= 1 AND default_severity <= 5),
  legal_refs TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Control measures table
CREATE TABLE IF NOT EXISTS control_measures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID REFERENCES hazards(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type control_type,
  mandatory BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project hazards (many-to-many with additional data)
CREATE TABLE IF NOT EXISTS project_hazards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  hazard_id UUID REFERENCES hazards(id) ON DELETE CASCADE,
  likelihood INTEGER DEFAULT 3 CHECK (likelihood >= 1 AND likelihood <= 5),
  severity INTEGER DEFAULT 3 CHECK (severity >= 1 AND severity <= 5),
  residual_risk INTEGER DEFAULT 9,
  selected BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, hazard_id)
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  role TEXT,
  imported_from_csv BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Briefings table
CREATE TABLE IF NOT EXISTS briefings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  trainer_user_id UUID REFERENCES users(id),
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signatures table
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  briefing_id UUID REFERENCES briefings(id) ON DELETE CASCADE,
  image_data TEXT, -- Base64 encoded signature
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  physical_signed BOOLEAN DEFAULT FALSE,
  UNIQUE(participant_id, briefing_id)
);

-- Criteria categories table (for custom criteria)
CREATE TABLE IF NOT EXISTS criteria_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type criteria_type NOT NULL,
  category criteria_category NOT NULL,
  options JSONB, -- For select/multiselect options
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk assessments table (replaces localStorage global assessments)
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity TEXT NOT NULL,
  process TEXT,
  hazard TEXT NOT NULL,
  hazard_factors TEXT,
  severity INTEGER DEFAULT 3 CHECK (severity >= 1 AND severity <= 5),
  probability INTEGER DEFAULT 3 CHECK (probability >= 1 AND probability <= 5),
  risk_value INTEGER DEFAULT 9,
  substitution BOOLEAN DEFAULT FALSE,
  technical BOOLEAN DEFAULT FALSE,
  organizational BOOLEAN DEFAULT FALSE,
  personal BOOLEAN DEFAULT FALSE,
  measures TEXT,
  severity_after INTEGER DEFAULT 2 CHECK (severity_after >= 1 AND severity_after <= 5),
  probability_after INTEGER DEFAULT 2 CHECK (probability_after >= 1 AND probability_after <= 5),
  residual_risk INTEGER DEFAULT 4,
  group_name TEXT,
  auto_select JSONB, -- Auto-selection criteria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Projects policies
CREATE POLICY "Users can read projects they have access to" ON projects
  FOR SELECT USING (
    -- Admins can see all
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
    OR
    -- Project creators can see their projects
    created_by_user_id::text = auth.uid()::text
    OR
    -- Mitarbeiter can see projects they participate in
    EXISTS (
      SELECT 1 FROM participants p 
      JOIN users u ON u.email = p.email 
      WHERE p.project_id = projects.id AND u.id::text = auth.uid()::text
    )
  );

CREATE POLICY "Projektleiter and Admins can create projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('ADMIN', 'PROJEKTLEITER')
    )
  );

CREATE POLICY "Project owners and Admins can update projects" ON projects
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
    OR
    created_by_user_id::text = auth.uid()::text
  );

-- Hazards policies (global library)
CREATE POLICY "Everyone can read hazards" ON hazards FOR SELECT USING (true);

CREATE POLICY "Projektleiter and Admins can manage hazards" ON hazards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('ADMIN', 'PROJEKTLEITER')
    )
  );

-- Control measures policies
CREATE POLICY "Everyone can read control measures" ON control_measures FOR SELECT USING (true);

CREATE POLICY "Projektleiter and Admins can manage control measures" ON control_measures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('ADMIN', 'PROJEKTLEITER')
    )
  );

-- Project hazards policies
CREATE POLICY "Users can read project hazards for accessible projects" ON project_hazards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_hazards.project_id
      AND (
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
        OR p.created_by_user_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM participants pt 
          JOIN users u ON u.email = pt.email 
          WHERE pt.project_id = p.id AND u.id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Project owners can manage project hazards" ON project_hazards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_hazards.project_id
      AND (
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
        OR p.created_by_user_id::text = auth.uid()::text
      )
    )
  );

-- Participants policies
CREATE POLICY "Users can read participants for accessible projects" ON participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = participants.project_id
      AND (
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
        OR p.created_by_user_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM participants pt 
          JOIN users u ON u.email = pt.email 
          WHERE pt.project_id = p.id AND u.id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Project owners can manage participants" ON participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = participants.project_id
      AND (
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
        OR p.created_by_user_id::text = auth.uid()::text
      )
    )
  );

-- Risk assessments policies
CREATE POLICY "Everyone can read risk assessments" ON risk_assessments FOR SELECT USING (true);

CREATE POLICY "Projektleiter and Admins can manage risk assessments" ON risk_assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('ADMIN', 'PROJEKTLEITER')
    )
  );

-- Criteria categories policies
CREATE POLICY "Everyone can read criteria categories" ON criteria_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage criteria categories" ON criteria_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Audit logs policies
CREATE POLICY "Admins can read all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can read their own audit logs" ON audit_logs
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- Briefings and signatures policies
CREATE POLICY "Users can read briefings for accessible projects" ON briefings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = briefings.project_id
      AND (
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
        OR p.created_by_user_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM participants pt 
          JOIN users u ON u.email = pt.email 
          WHERE pt.project_id = p.id AND u.id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Project owners can manage briefings" ON briefings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = briefings.project_id
      AND (
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
        OR p.created_by_user_id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can read signatures for accessible projects" ON signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM participants p
      JOIN projects pr ON pr.id = p.project_id
      WHERE p.id = signatures.participant_id
      AND (
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
        OR pr.created_by_user_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM participants pt 
          JOIN users u ON u.email = pt.email 
          WHERE pt.project_id = pr.id AND u.id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can manage signatures" ON signatures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM participants p
      JOIN projects pr ON pr.id = p.project_id
      WHERE p.id = signatures.participant_id
      AND (
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
        OR pr.created_by_user_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM participants pt 
          JOIN users u ON u.email = pt.email 
          WHERE pt.project_id = pr.id AND u.id::text = auth.uid()::text
        )
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_hazards_project ON project_hazards(project_id);
CREATE INDEX IF NOT EXISTS idx_project_hazards_hazard ON project_hazards(hazard_id);
CREATE INDEX IF NOT EXISTS idx_participants_project ON participants(project_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_control_measures_hazard ON control_measures(hazard_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_project ON audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);