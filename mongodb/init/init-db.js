// MongoDB Initialization Script
// This script runs when the MongoDB container starts for the first time

// Switch to the gbu_management database
db = db.getSiblingDB('gbu_management');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'name', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          description: 'Email must be a string and is required'
        },
        name: {
          bsonType: 'string',
          description: 'Name must be a string and is required'
        },
        role: {
          enum: ['ADMIN', 'PROJEKTLEITER', 'MITARBEITER'],
          description: 'Role must be one of the enum values'
        },
        passwordHash: {
          bsonType: 'string',
          description: 'Password hash must be a string'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Created date must be a date'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Updated date must be a date'
        }
      }
    }
  }
});

db.createCollection('projects', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'location', 'buildUpStart', 'buildUpEnd', 'eventStart', 'eventEnd', 'createdByUserId'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'Title must be a string and is required'
        },
        location: {
          bsonType: 'string',
          description: 'Location must be a string and is required'
        },
        status: {
          enum: ['ENTWURF', 'AKTIV', 'ARCHIVIERT'],
          description: 'Status must be one of the enum values'
        }
      }
    }
  }
});

db.createCollection('hazards');
db.createCollection('controlMeasures');
db.createCollection('projectHazards');
db.createCollection('participants');
db.createCollection('briefings');
db.createCollection('signatures');
db.createCollection('criteriaCategories');
db.createCollection('riskAssessments');
db.createCollection('auditLogs');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.projects.createIndex({ createdByUserId: 1 });
db.projects.createIndex({ status: 1 });
db.projectHazards.createIndex({ projectId: 1 });
db.projectHazards.createIndex({ hazardId: 1 });
db.participants.createIndex({ projectId: 1 });
db.participants.createIndex({ email: 1 });
db.controlMeasures.createIndex({ hazardId: 1 });
db.auditLogs.createIndex({ userId: 1 });
db.auditLogs.createIndex({ projectId: 1 });
db.auditLogs.createIndex({ timestamp: -1 });

// Insert default users
db.users.insertMany([
  {
    _id: ObjectId(),
    email: 'admin@gbu-app.de',
    name: 'System Administrator',
    role: 'ADMIN',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    email: 'projektleiter@gbu-app.de',
    name: 'Max Mustermann',
    role: 'PROJEKTLEITER',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: user123
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    email: 'mitarbeiter@gbu-app.de',
    name: 'Lisa Musterfrau',
    role: 'MITARBEITER',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: user123
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert default hazards
const hazardIds = [
  ObjectId(),
  ObjectId(),
  ObjectId(),
  ObjectId(),
  ObjectId(),
  ObjectId(),
  ObjectId(),
  ObjectId()
];

db.hazards.insertMany([
  {
    _id: hazardIds[0],
    title: 'Elektrische Gefährdung',
    description: 'Stromschlag durch defekte oder unsachgemäß verwendete Elektrogeräte',
    category: 'ELEKTRIK',
    defaultLikelihood: 2,
    defaultSeverity: 5,
    legalRefs: 'DGUV Vorschrift 3, VDE 0100',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: hazardIds[1],
    title: 'Absturzgefahr',
    description: 'Sturz von erhöhten Arbeitsplätzen oder Bühnen',
    category: 'HOEHE',
    defaultLikelihood: 3,
    defaultSeverity: 5,
    legalRefs: 'DGUV Regel 112-198, PSAgA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: hazardIds[2],
    title: 'Wetter und Unwetter',
    description: 'Gefährdung durch Wind, Regen, Blitz bei Outdoor-Veranstaltungen',
    category: 'WETTER',
    defaultLikelihood: 4,
    defaultSeverity: 4,
    legalRefs: 'DIN EN 13782',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: hazardIds[3],
    title: 'Kohlenmonoxid-Vergiftung',
    description: 'CO-Vergiftung durch Generatoren oder Heizgeräte',
    category: 'CHEMISCH',
    defaultLikelihood: 2,
    defaultSeverity: 5,
    legalRefs: 'TRGS 900',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: hazardIds[4],
    title: 'Fahrzeugverkehr',
    description: 'Gefährdung durch rangierende oder fahrende Fahrzeuge',
    category: 'VERKEHR',
    defaultLikelihood: 3,
    defaultSeverity: 4,
    legalRefs: 'StVO, DGUV Regel 114-016',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: hazardIds[5],
    title: 'Lärmbelastung',
    description: 'Gehörschädigung durch hohe Schallpegel',
    category: 'LAERM',
    defaultLikelihood: 4,
    defaultSeverity: 3,
    legalRefs: 'LärmVibrationsArbSchV',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: hazardIds[6],
    title: 'Brandgefahr',
    description: 'Brand durch elektrische Geräte, Pyrotechnik oder offenes Feuer',
    category: 'BRAND',
    defaultLikelihood: 2,
    defaultSeverity: 5,
    legalRefs: 'Versammlungsstättenverordnung',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: hazardIds[7],
    title: 'Stolper- und Sturzgefahr',
    description: 'Verletzungen durch Kabel, unebenen Untergrund oder Hindernisse',
    category: 'MECHANISCH',
    defaultLikelihood: 4,
    defaultSeverity: 2,
    legalRefs: 'DGUV Information 208-016',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert control measures for hazards
db.controlMeasures.insertMany([
  // Elektrische Gefährdung
  {
    _id: ObjectId(),
    hazardId: hazardIds[0],
    description: 'Prüfung der elektrischen Anlagen durch Elektrofachkraft',
    type: 'TECHNISCH',
    mandatory: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    hazardId: hazardIds[0],
    description: 'Verwendung von FI-Schutzschaltern',
    type: 'TECHNISCH',
    mandatory: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    hazardId: hazardIds[0],
    description: 'Unterweisung im Umgang mit elektrischen Geräten',
    type: 'ORGANISATORISCH',
    mandatory: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Absturzgefahr
  {
    _id: ObjectId(),
    hazardId: hazardIds[1],
    description: 'Absturzsicherungen (Geländer, Netze)',
    type: 'TECHNISCH',
    mandatory: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    hazardId: hazardIds[1],
    description: 'Persönliche Schutzausrüstung gegen Absturz',
    type: 'PPE',
    mandatory: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    hazardId: hazardIds[1],
    description: 'Unterweisung in Höhenarbeit',
    type: 'ORGANISATORISCH',
    mandatory: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert default criteria categories
db.criteriaCategories.insertMany([
  {
    _id: ObjectId(),
    name: 'Outdoor-Veranstaltung',
    type: 'boolean',
    category: 'location',
    description: 'Veranstaltung findet im Freien statt',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Elektrische Anlagen vorhanden',
    type: 'boolean',
    category: 'project',
    description: 'Projekt verwendet elektrische Anlagen',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Generatoren/Notstromaggregate',
    type: 'boolean',
    category: 'project',
    description: 'Verwendung von Generatoren oder Notstromaggregaten',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert sample risk assessments
db.riskAssessments.insertMany([
  {
    _id: ObjectId(),
    activity: 'Elektrische Arbeiten',
    process: 'Installation und Wartung',
    hazard: 'Stromschlag',
    hazardFactors: 'Defekte Kabel, Feuchtigkeit, unsachgemäße Handhabung',
    severity: 5,
    probability: 3,
    riskValue: 15,
    substitution: false,
    technical: true,
    organizational: true,
    personal: true,
    measures: 'FI-Schutzschalter, Prüfung durch Elektrofachkraft, Isolierte Werkzeuge',
    severityAfter: 5,
    probabilityAfter: 1,
    residualRisk: 5,
    groupName: 'Elektrik',
    autoSelect: {
      hasElectricity: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    activity: 'Arbeiten in der Höhe',
    process: 'Rigging und Montage',
    hazard: 'Absturz',
    hazardFactors: 'Ungesicherte Arbeitsplätze, defekte Ausrüstung',
    severity: 5,
    probability: 3,
    riskValue: 15,
    substitution: false,
    technical: true,
    organizational: true,
    personal: true,
    measures: 'Absturzsicherung, PSA gegen Absturz, Unterweisung',
    severityAfter: 5,
    probabilityAfter: 1,
    residualRisk: 5,
    groupName: 'Höhenarbeit',
    autoSelect: {
      hasWorkAbove2m: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    activity: 'Outdoor-Veranstaltung',
    process: 'Aufbau und Durchführung',
    hazard: 'Wettergefährdung',
    hazardFactors: 'Wind, Regen, Blitz, Temperaturschwankungen',
    severity: 4,
    probability: 4,
    riskValue: 16,
    substitution: false,
    technical: true,
    organizational: true,
    personal: false,
    measures: 'Wetterüberwachung, Windlastberechnungen, Blitzschutz',
    severityAfter: 4,
    probabilityAfter: 2,
    residualRisk: 8,
    groupName: 'Wetter',
    autoSelect: {
      isOutdoor: true,
      season: ['Frühling', 'Sommer', 'Herbst', 'Winter']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('MongoDB initialization completed successfully!');
print('Created collections: users, projects, hazards, controlMeasures, projectHazards, participants, briefings, signatures, criteriaCategories, riskAssessments, auditLogs');
print('Inserted sample data for users, hazards, control measures, criteria categories, and risk assessments');
print('Created indexes for better performance');