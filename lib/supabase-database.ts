import { getSupabaseClient, getSupabaseAdminClient } from './supabase';
import { createAuditLog } from './audit';

// Users
export async function getUsers() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      name,
      role,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createUser(userData: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateUser(id: string, updates: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteUser(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// Projects
export async function getProjects(userId?: string) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('projects')
    .select(`
      *,
      created_by:users!projects_created_by_user_id_fkey(name, email),
      participants(id),
      project_hazards(id, selected)
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('created_by_user_id', userId);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getProject(id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      created_by:users!projects_created_by_user_id_fkey(name, email),
      participants(*),
      project_hazards(
        *,
        hazard:hazards!project_hazards_hazard_id_fkey(
          *,
          control_measures(*)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createProject(projectData: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProject(id: string, updates: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProject(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// Gefährdungen
export async function getHazards() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('hazards')
    .select(`
      *,
      control_measures(*)
    `)
    .order('category', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createHazard(hazardData: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('hazards')
    .insert(hazardData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateHazard(id: string, updates: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('hazards')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteHazard(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('hazards')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// Risk Assessments (Global Library)
export async function getRiskAssessments() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('risk_assessments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createRiskAssessment(assessmentData: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('risk_assessments')
    .insert(assessmentData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateRiskAssessment(id: string, updates: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('risk_assessments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteRiskAssessment(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('risk_assessments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// Teilnehmer
export async function getParticipants(projectId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('project_id', projectId)
    .order('last_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createParticipant(participantData: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('participants')
    .insert(participantData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateParticipant(id: string, updates: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('participants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteParticipant(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// Criteria Categories
export async function getCriteriaCategories() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('criteria_categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createCriteriaCategory(categoryData: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('criteria_categories')
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCriteriaCategory(id: string, updates: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('criteria_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCriteriaCategory(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('criteria_categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// Project Hazards
export async function getProjectHazards(projectId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('project_hazards')
    .select(`
      *,
      hazard:hazards!project_hazards_hazard_id_fkey(*)
    `)
    .eq('project_id', projectId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProjectHazards(projectId: string, hazardIds: string[]) {
  const supabase = getSupabaseClient();
  
  // First, delete existing project hazards
  await supabase
    .from('project_hazards')
    .delete()
    .eq('project_id', projectId);

  // Then insert new ones
  if (hazardIds.length > 0) {
    const projectHazards = hazardIds.map(hazardId => ({
      project_id: projectId,
      hazard_id: hazardId,
      selected: true
    }));

    const { error } = await supabase
      .from('project_hazards')
      .insert(projectHazards);

    if (error) {
      throw new Error(error.message);
    }
  }
}

// Signatures
export async function createSignature(signatureData: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('signatures')
    .insert(signatureData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getSignatures(briefingId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('signatures')
    .select(`
      *,
      participant:participants!signatures_participant_id_fkey(*)
    `)
    .eq('briefing_id', briefingId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}