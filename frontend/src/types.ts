export type UserRole = 'admin' | 'bereichsleiter' | 'technischer_leiter' | 'projektleiter' | 'user';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  active: boolean;
  created_at: string;
}

export type Season = 'fruehling' | 'sommer' | 'herbst' | 'winter';
export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both';
export type ProjectStatus = 'planung' | 'aktiv' | 'abgeschlossen' | 'archiviert';

export interface Project {
  id: number;
  name: string;
  description?: string;
  location?: string;
  aufbau_datum?: string;
  start_date?: string;
  end_date?: string;
  season?: Season;
  indoor_outdoor?: IndoorOutdoor;
  status: ProjectStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectAssignment {
  id: number;
  project_id: number;
  user_id: number;
  assigned_by: number;
  assigned_at: string;
}

export interface Bereich {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
}

export interface BereichAssignment {
  id: number;
  bereich_id: number;
  bereichsleiter_id: number;
  project_id: number;
  assigned_by: number;
  assigned_at: string;
}

export type RisikoBewertung = 'niedrig' | 'mittel' | 'hoch';
export type BoolCheck = 'WAHR' | 'FALSCH' | '';

export interface Gefaehrdung {
  id: number;
  gbu_template_id?: number;
  project_id?: number;
  bereich_id?: number;
  tätigkeit: string;
  gefährdung?: string;
  gefährdungsfaktoren?: string;
  belastungsfaktoren?: string;
  schadenschwere?: number;
  wahrscheinlichkeit?: number;
  risikobewertung?: RisikoBewertung;
  s_substitution?: BoolCheck;
  t_technisch?: BoolCheck;
  o_organisatorisch?: BoolCheck;
  p_persoenlich?: BoolCheck;
  massnahmen?: string;
  s_massnahmen?: string;
  t_massnahmen?: string;
  o_massnahmen?: string;
  p_massnahmen?: string;
  überprüfung_wirksamkeit?: string;
  überprüfung_meldung?: string;
  sonstige_bemerkungen?: string;
  gesetzliche_regelungen?: string;
  mängel_behoben: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GBUTemplate {
  id: number;
  name: string;
  description?: string;
  season: Season | 'alle';
  indoor_outdoor: IndoorOutdoor | 'alle';
  is_global: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  gefaehrdungen?: Gefaehrdung[];
  gefaehrdungen_count?: number;
}

export interface ProjectGBU {
  id: number;
  project_id: number;
  gbu_template_id: number;
  added_by: number;
  added_at: string;
}

export type SignatureType = 'digital' | 'analog' | 'pending';

export interface Participant {
  id: number;
  project_id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  position?: string;
  company?: string;
  signature_type: SignatureType;
  signed_at?: string;
  imported_from_csv: boolean;
  created_at: string;
}

export interface Unterweisung {
  id: number;
  project_id: number;
  title?: string;
  content?: string;
  veranstaltung?: string;
  datum_ort?: string;
  organisation?: string;
  allgemeine_hinweise?: string;
  notfaelle_raeumung?: string;
  zusaetzliche_regeln?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  items?: UnterweisungItem[];
}

export interface UnterweisungItem {
  id: number;
  unterweisung_id: number;
  section?: string;
  icon_type?: string;
  content?: string;
  sort_order: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
