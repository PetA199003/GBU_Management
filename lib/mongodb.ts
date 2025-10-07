import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// MongoDB connection
let client: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/gbu_management?authSource=admin';
const DB_NAME = 'gbu_management';

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Disconnected from MongoDB');
  }
}

// Helper function to get collection
export async function getCollection<T = any>(collectionName: string): Promise<Collection<T>> {
  const database = await connectToDatabase();
  return database.collection<T>(collectionName);
}

// Helper function to convert MongoDB _id to string id
export function transformMongoDocument(doc: any): any {
  if (!doc) return doc;
  
  if (Array.isArray(doc)) {
    return doc.map(transformMongoDocument);
  }
  
  if (typeof doc === 'object' && doc._id) {
    const { _id, ...rest } = doc;
    return {
      id: _id.toString(),
      ...rest
    };
  }
  
  return doc;
}

// Helper function to convert string id to MongoDB ObjectId
export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

// User operations
export async function getUsers() {
  try {
    const collection = await getCollection('users');
    const users = await collection.find({}).toArray();
    return transformMongoDocument(users);
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const collection = await getCollection('users');
    const user = await collection.findOne({ email });
    return transformMongoDocument(user);
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function createUser(userData: any) {
  try {
    const collection = await getCollection('users');
    const result = await collection.insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const user = await collection.findOne({ _id: result.insertedId });
    return transformMongoDocument(user);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(id: string, updates: any) {
  try {
    const collection = await getCollection('users');
    const result = await collection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return transformMongoDocument(result.value);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    const collection = await getCollection('users');
    await collection.deleteOne({ _id: toObjectId(id) });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Project operations
export async function getProjects(userId?: string) {
  try {
    const collection = await getCollection('projects');
    const query = userId ? { createdByUserId: userId } : {};
    const projects = await collection.find(query).sort({ createdAt: -1 }).toArray();
    
    // Add participant count and risk assessment count
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const participantsCollection = await getCollection('participants');
        const projectHazardsCollection = await getCollection('projectHazards');
        
        const participantCount = await participantsCollection.countDocuments({ 
          projectId: project._id.toString() 
        });
        
        const riskAssessmentCount = await projectHazardsCollection.countDocuments({ 
          projectId: project._id.toString(),
          selected: true 
        });
        
        return {
          ...project,
          participants: { length: participantCount },
          riskAssessmentIds: Array(riskAssessmentCount).fill(null).map((_, i) => i.toString())
        };
      })
    );
    
    return transformMongoDocument(projectsWithCounts);
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
}

export async function getProject(id: string) {
  try {
    const collection = await getCollection('projects');
    const project = await collection.findOne({ _id: toObjectId(id) });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Get participants
    const participantsCollection = await getCollection('participants');
    const participants = await participantsCollection.find({ 
      projectId: id 
    }).toArray();
    
    // Get project hazards
    const projectHazardsCollection = await getCollection('projectHazards');
    const projectHazards = await projectHazardsCollection.find({ 
      projectId: id 
    }).toArray();
    
    return transformMongoDocument({
      ...project,
      participants: participants,
      riskAssessmentIds: projectHazards.filter(ph => ph.selected).map(ph => ph.hazardId)
    });
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
}

export async function createProject(projectData: any) {
  try {
    const collection = await getCollection('projects');
    const result = await collection.insertOne({
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const project = await collection.findOne({ _id: result.insertedId });
    return transformMongoDocument(project);
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function updateProject(id: string, updates: any) {
  try {
    const collection = await getCollection('projects');
    const result = await collection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return transformMongoDocument(result.value);
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function deleteProject(id: string) {
  try {
    const collection = await getCollection('projects');
    await collection.deleteOne({ _id: toObjectId(id) });
    
    // Also delete related data
    const participantsCollection = await getCollection('participants');
    await participantsCollection.deleteMany({ projectId: id });
    
    const projectHazardsCollection = await getCollection('projectHazards');
    await projectHazardsCollection.deleteMany({ projectId: id });
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// Risk Assessment operations
export async function getRiskAssessments() {
  try {
    const collection = await getCollection('riskAssessments');
    const assessments = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return transformMongoDocument(assessments);
  } catch (error) {
    console.error('Error getting risk assessments:', error);
    throw error;
  }
}

export async function createRiskAssessment(assessmentData: any) {
  try {
    const collection = await getCollection('riskAssessments');
    const result = await collection.insertOne({
      ...assessmentData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const assessment = await collection.findOne({ _id: result.insertedId });
    return transformMongoDocument(assessment);
  } catch (error) {
    console.error('Error creating risk assessment:', error);
    throw error;
  }
}

export async function updateRiskAssessment(id: string, updates: any) {
  try {
    const collection = await getCollection('riskAssessments');
    const result = await collection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return transformMongoDocument(result.value);
  } catch (error) {
    console.error('Error updating risk assessment:', error);
    throw error;
  }
}

export async function deleteRiskAssessment(id: string) {
  try {
    const collection = await getCollection('riskAssessments');
    await collection.deleteOne({ _id: toObjectId(id) });
  } catch (error) {
    console.error('Error deleting risk assessment:', error);
    throw error;
  }
}

// Criteria Categories operations
export async function getCriteriaCategories() {
  try {
    const collection = await getCollection('criteriaCategories');
    const categories = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return transformMongoDocument(categories);
  } catch (error) {
    console.error('Error getting criteria categories:', error);
    throw error;
  }
}

export async function createCriteriaCategory(categoryData: any) {
  try {
    const collection = await getCollection('criteriaCategories');
    const result = await collection.insertOne({
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const category = await collection.findOne({ _id: result.insertedId });
    return transformMongoDocument(category);
  } catch (error) {
    console.error('Error creating criteria category:', error);
    throw error;
  }
}

export async function updateCriteriaCategory(id: string, updates: any) {
  try {
    const collection = await getCollection('criteriaCategories');
    const result = await collection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return transformMongoDocument(result.value);
  } catch (error) {
    console.error('Error updating criteria category:', error);
    throw error;
  }
}

export async function deleteCriteriaCategory(id: string) {
  try {
    const collection = await getCollection('criteriaCategories');
    await collection.deleteOne({ _id: toObjectId(id) });
  } catch (error) {
    console.error('Error deleting criteria category:', error);
    throw error;
  }
}

// Participants operations
export async function getParticipants(projectId: string) {
  try {
    const collection = await getCollection('participants');
    const participants = await collection.find({ projectId }).sort({ lastName: 1 }).toArray();
    return transformMongoDocument(participants);
  } catch (error) {
    console.error('Error getting participants:', error);
    throw error;
  }
}

export async function createParticipant(participantData: any) {
  try {
    const collection = await getCollection('participants');
    const result = await collection.insertOne({
      ...participantData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const participant = await collection.findOne({ _id: result.insertedId });
    return transformMongoDocument(participant);
  } catch (error) {
    console.error('Error creating participant:', error);
    throw error;
  }
}

export async function updateParticipant(id: string, updates: any) {
  try {
    const collection = await getCollection('participants');
    const result = await collection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return transformMongoDocument(result.value);
  } catch (error) {
    console.error('Error updating participant:', error);
    throw error;
  }
}

export async function deleteParticipant(id: string) {
  try {
    const collection = await getCollection('participants');
    await collection.deleteOne({ _id: toObjectId(id) });
  } catch (error) {
    console.error('Error deleting participant:', error);
    throw error;
  }
}

// Project Hazards operations
export async function updateProjectHazards(projectId: string, hazardIds: string[]) {
  try {
    const collection = await getCollection('projectHazards');
    
    // First, delete existing project hazards
    await collection.deleteMany({ projectId });
    
    // Then insert new ones
    if (hazardIds.length > 0) {
      const projectHazards = hazardIds.map(hazardId => ({
        projectId,
        hazardId,
        selected: true,
        likelihood: 3,
        severity: 3,
        residualRisk: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      await collection.insertMany(projectHazards);
    }
  } catch (error) {
    console.error('Error updating project hazards:', error);
    throw error;
  }
}

// Audit Log operations
export async function createAuditLog(auditData: any) {
  try {
    const collection = await getCollection('auditLogs');
    const result = await collection.insertOne({
      ...auditData,
      timestamp: new Date()
    });
    
    const auditLog = await collection.findOne({ _id: result.insertedId });
    return transformMongoDocument(auditLog);
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
}