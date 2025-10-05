'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Shield, AlertTriangle, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { hasPermission, UserRole } from '@/lib/permissions';

interface RiskAssessment {
  id: string;
  activity: string;
  process: string;
  hazard: string;
  hazardFactors: string;
  severity: number;
  probability: number;
  riskValue: number;
  substitution: boolean;
  technical: boolean;
  organizational: boolean;
  personal: boolean;
  measures: string;
  severityAfter: number;
  probabilityAfter: number;
  residualRisk: number;
  group?: string;
  createdAt: string;
  updatedAt: string;
  autoSelect?: {
    location?: {[key: string]: boolean};
    project?: {[key: string]: boolean};
    season?: string[];
    customCriteria?: string[];
    customCriteriaValues?: {[key: string]: any};
    isOutdoor?: boolean;
    hasElectricity?: boolean;
    hasGenerator?: boolean;
    hasWorkAbove2m?: boolean;
    hasPublicAccess?: boolean;
    hasNightWork?: boolean;
    hasTrafficArea?: boolean;
    hasHazardousMaterials?: boolean;
  };
}

const getRiskColor = (risk: number): string => {
  if (risk <= 4) return 'bg-green-100 text-green-800';
  if (risk <= 8) return 'bg-yellow-100 text-yellow-800';
  if (risk <= 16) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getRiskLabel = (risk: number): string => {
  if (risk <= 4) return 'Niedrig';
  if (risk <= 8) return 'Mittel';
  if (risk <= 16) return 'Hoch';
  return 'Sehr hoch';
};

export default function HazardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [globalRiskAssessments, setGlobalRiskAssessments] = useState<RiskAssessment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<RiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [availableCriteria, setAvailableCriteria] = useState<any[]>([]);
  const [criteriaLoaded, setCriteriaLoaded] = useState(false);

  const [formData, setFormData] = useState<RiskAssessment>({
    id: '',
    activity: '',
    process: '',
    hazard: '',
    hazardFactors: '',
    severity: 3,
    probability: 3,
    riskValue: 9,
    substitution: false,
    technical: false,
    organizational: false,
    personal: false,
    measures: '',
    severityAfter: 2,
    probabilityAfter: 2,
    residualRisk: 4,
    group: '',
    createdAt: '',
    updatedAt: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && !hasPermission(session?.user?.role, UserRole.PROJEKTLEITER)) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    // Load global risk assessments from localStorage
    const savedAssessments = localStorage.getItem('gbu-global-risk-assessments');
    if (savedAssessments) {
      try {
        setGlobalRiskAssessments(JSON.parse(savedAssessments));
      } catch (error) {
        console.error('Error loading global risk assessments:', error);
        initializeDefaultAssessments();
      }
    } else {
      initializeDefaultAssessments();
    }
    
    // Load available criteria
    const savedCriteria = localStorage.getItem('gbu-criteria-categories');
    if (savedCriteria) {
      try {
        const criteria = JSON.parse(savedCriteria);
        setAvailableCriteria(criteria);
        setCriteriaLoaded(true);
      } catch (error) {
        console.error('Error loading criteria categories:', error);
        setCriteriaLoaded(true);
      }
    } else {
      setCriteriaLoaded(true);
    }
  }, []);

  const initializeDefaultAssessments = () => {
    const defaultAssessments: RiskAssessment[] = [
      {
        id: '1',
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
        group: 'Elektrik',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoSelect: {
          hasElectricity: true
        }
      },
      {
        id: '2',
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
        group: 'Höhenarbeit',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoSelect: {
          hasWorkAbove2m: true
        }
      },
      {
        id: '3',
        activity: 'Generatorbetrieb',
        process: 'Stromversorgung',
        hazard: 'Kohlenmonoxid-Vergiftung',
        hazardFactors: 'Abgase in geschlossenen Räumen',
        severity: 5,
        probability: 2,
        riskValue: 10,
        substitution: true,
        technical: true,
        organizational: true,
        personal: false,
        measures: 'Aufstellung im Freien, CO-Warnmelder, Belüftung',
        severityAfter: 5,
        probabilityAfter: 1,
        residualRisk: 5,
        group: 'Generatoren',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoSelect: {
          hasGenerator: true
        }
      }
    ];

    setGlobalRiskAssessments(defaultAssessments);
    localStorage.setItem('gbu-global-risk-assessments', JSON.stringify(defaultAssessments));
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !hasPermission(session.user.role, UserRole.PROJEKTLEITER)) {
    return null;
  }

  const handleInputChange = (field: keyof RiskAssessment, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate risk values
      if (field === 'severity' || field === 'probability') {
        updated.riskValue = updated.severity * updated.probability;
      }
      if (field === 'severityAfter' || field === 'probabilityAfter') {
        updated.residualRisk = updated.severityAfter * updated.probabilityAfter;
      }
      
      return updated;
    });
  };

  const resetForm = () => {
    setFormData({
      id: '',
      activity: '',
      process: '',
      hazard: '',
      hazardFactors: '',
      severity: 3,
      probability: 3,
      riskValue: 9,
      substitution: false,
      technical: false,
      organizational: false,
      personal: false,
      measures: '',
      severityAfter: 2,
      probabilityAfter: 2,
      residualRisk: 4,
      group: '',
      createdAt: '',
      updatedAt: '',
      autoSelect: {
        isOutdoor: false,
        hasElectricity: false,
        hasGenerator: false,
        hasWorkAbove2m: false,
        hasPublicAccess: false,
        hasNightWork: false,
        hasTrafficArea: false,
        hasHazardousMaterials: false,
        season: [],
        customCriteria: [],
        customCriteriaValues: {}
      }
    });
    setEditingAssessment(null);
  };

  const handleEdit = (assessment: RiskAssessment) => {
    setEditingAssessment(assessment);
    setFormData({
      ...assessment,
      autoSelect: assessment.autoSelect || {
        isOutdoor: false,
        hasElectricity: false,
        hasGenerator: false,
        hasWorkAbove2m: false,
        hasPublicAccess: false,
        hasNightWork: false,
        hasTrafficArea: false,
        hasHazardousMaterials: false,
        season: [],
        customCriteria: [],
        customCriteriaValues: {}
      }
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.activity || !formData.hazard) {
        toast.error('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      let updatedAssessments;

      if (editingAssessment) {
        updatedAssessments = globalRiskAssessments.map(a => 
          a.id === editingAssessment.id 
            ? { ...formData, updatedAt: new Date().toISOString() }
            : a
        );
        toast.success('Gefährdungsbeurteilung erfolgreich aktualisiert!');
      } else {
        const newAssessment: RiskAssessment = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedAssessments = [...globalRiskAssessments, newAssessment];
        toast.success('Gefährdungsbeurteilung erfolgreich erstellt!');
      }

      setGlobalRiskAssessments(updatedAssessments);
      localStorage.setItem('gbu-global-risk-assessments', JSON.stringify(updatedAssessments));

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Fehler beim Speichern der Gefährdungsbeurteilung.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (assessmentId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Gefährdungsbeurteilung löschen möchten?')) {
      return;
    }

    try {
      const updatedAssessments = globalRiskAssessments.filter(a => a.id !== assessmentId);
      setGlobalRiskAssessments(updatedAssessments);
      localStorage.setItem('gbu-global-risk-assessments', JSON.stringify(updatedAssessments));
      toast.success('Gefährdungsbeurteilung erfolgreich gelöscht!');
    } catch (error) {
      toast.error('Fehler beim Löschen der Gefährdungsbeurteilung.');
    }
  };

  // Get groups that are actually used
  const usedGroups = Array.from(new Set(globalRiskAssessments.map(a => a.group).filter((group): group is string => Boolean(group))));

  const filteredAssessments = selectedGroup === 'all' 
    ? globalRiskAssessments 
    : globalRiskAssessments.filter(a => a.group === selectedGroup);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gefährdungen verwalten</h1>
          <p className="text-muted-foreground">
            Globale Bibliothek von Gefährdungsbeurteilungen für Veranstaltungsprojekte
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Neue Gefährdung
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAssessment ? 'Gefährdungsbeurteilung bearbeiten' : 'Neue Gefährdungsbeurteilung erstellen'}
              </DialogTitle>
              <DialogDescription>
                Erstellen Sie eine detaillierte Gefährdungsbeurteilung nach dem STOP-Prinzip.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="activity">Tätigkeit *</Label>
                  <Input
                    id="activity"
                    value={formData.activity}
                    onChange={(e) => handleInputChange('activity', e.target.value)}
                    placeholder="z.B. Elektrische Arbeiten"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="process">Arbeitsverfahren</Label>
                  <Input
                    id="process"
                    value={formData.process}
                    onChange={(e) => handleInputChange('process', e.target.value)}
                    placeholder="z.B. Installation und Wartung"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hazard">Gefährdung *</Label>
                <Input
                  id="hazard"
                  value={formData.hazard}
                  onChange={(e) => handleInputChange('hazard', e.target.value)}
                  placeholder="z.B. Stromschlag"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hazardFactors">Gefährdungs- und Belastungsfaktoren</Label>
                <Textarea
                  id="hazardFactors"
                  value={formData.hazardFactors}
                  onChange={(e) => handleInputChange('hazardFactors', e.target.value)}
                  placeholder="z.B. Defekte Kabel, Feuchtigkeit, unsachgemäße Handhabung"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="severity">Schadensschwere (1-5)</Label>
                  <Select value={formData.severity.toString()} onValueChange={(value) => handleInputChange('severity', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Sehr gering</SelectItem>
                      <SelectItem value="2">2 - Gering</SelectItem>
                      <SelectItem value="3">3 - Mittel</SelectItem>
                      <SelectItem value="4">4 - Hoch</SelectItem>
                      <SelectItem value="5">5 - Sehr hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="probability">Wahrscheinlichkeit (1-5)</Label>
                  <Select value={formData.probability.toString()} onValueChange={(value) => handleInputChange('probability', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Sehr unwahrscheinlich</SelectItem>
                      <SelectItem value="2">2 - Unwahrscheinlich</SelectItem>
                      <SelectItem value="3">3 - Möglich</SelectItem>
                      <SelectItem value="4">4 - Wahrscheinlich</SelectItem>
                      <SelectItem value="5">5 - Sehr wahrscheinlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Risikobewertung</Label>
                  <div className={`p-3 rounded-md text-center font-bold ${getRiskColor(formData.riskValue)}`}>
                    {formData.riskValue} ({getRiskLabel(formData.riskValue)})
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Schutzmaßnahmen (STOP-Prinzip)</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="substitution"
                      checked={formData.substitution}
                      onCheckedChange={(checked) => handleInputChange('substitution', checked)}
                    />
                    <Label htmlFor="substitution">Substitution</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="technical"
                      checked={formData.technical}
                      onCheckedChange={(checked) => handleInputChange('technical', checked)}
                    />
                    <Label htmlFor="technical">Technische Maßnahmen</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="organizational"
                      checked={formData.organizational}
                      onCheckedChange={(checked) => handleInputChange('organizational', checked)}
                    />
                    <Label htmlFor="organizational">Organisatorische Maßnahmen</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="personal"
                      checked={formData.personal}
                      onCheckedChange={(checked) => handleInputChange('personal', checked)}
                    />
                    <Label htmlFor="personal">Persönliche Schutzausrüstung</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="measures">Konkrete Schutzmaßnahmen</Label>
                <Textarea
                  id="measures"
                  value={formData.measures}
                  onChange={(e) => handleInputChange('measures', e.target.value)}
                  placeholder="z.B. FI-Schutzschalter, Prüfung durch Elektrofachkraft, Isolierte Werkzeuge"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="severityAfter">Schadensschwere nach Maßnahmen</Label>
                  <Select value={formData.severityAfter.toString()} onValueChange={(value) => handleInputChange('severityAfter', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Sehr gering</SelectItem>
                      <SelectItem value="2">2 - Gering</SelectItem>
                      <SelectItem value="3">3 - Mittel</SelectItem>
                      <SelectItem value="4">4 - Hoch</SelectItem>
                      <SelectItem value="5">5 - Sehr hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="probabilityAfter">Wahrscheinlichkeit nach Maßnahmen</Label>
                  <Select value={formData.probabilityAfter.toString()} onValueChange={(value) => handleInputChange('probabilityAfter', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Sehr unwahrscheinlich</SelectItem>
                      <SelectItem value="2">2 - Unwahrscheinlich</SelectItem>
                      <SelectItem value="3">3 - Möglich</SelectItem>
                      <SelectItem value="4">4 - Wahrscheinlich</SelectItem>
                      <SelectItem value="5">5 - Sehr wahrscheinlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Restrisiko</Label>
                  <div className={`p-3 rounded-md text-center font-bold ${getRiskColor(formData.residualRisk)}`}>
                    {formData.residualRisk} ({getRiskLabel(formData.residualRisk)})
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group">Gruppe (optional)</Label>
                <Input
                  id="group"
                  value={formData.group || ''}
                  onChange={(e) => handleInputChange('group', e.target.value)}
                  placeholder="z.B. Elektrik, Höhenarbeit, Generatoren"
                />
              </div>

              <div className="space-y-4 border-t pt-6">
                <div>
                  <h3 className="text-lg font-medium">Automatische Auswahl</h3>
                  <p className="text-sm text-muted-foreground">
                    Definieren Sie, wann diese Gefährdung automatisch bei neuen Projekten ausgewählt werden soll
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Projektmerkmale</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autoSelect-isOutdoor"
                          checked={formData.autoSelect?.isOutdoor || false}
                          onCheckedChange={(checked) => handleInputChange('autoSelect', {
                            ...formData.autoSelect,
                            isOutdoor: checked
                          })}
                        />
                        <Label htmlFor="autoSelect-isOutdoor">Outdoor-Veranstaltung</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autoSelect-hasElectricity"
                          checked={formData.autoSelect?.hasElectricity || false}
                          onCheckedChange={(checked) => handleInputChange('autoSelect', {
                            ...formData.autoSelect,
                            hasElectricity: checked
                          })}
                        />
                        <Label htmlFor="autoSelect-hasElectricity">Elektrische Anlagen</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autoSelect-hasGenerator"
                          checked={formData.autoSelect?.hasGenerator || false}
                          onCheckedChange={(checked) => handleInputChange('autoSelect', {
                            ...formData.autoSelect,
                            hasGenerator: checked
                          })}
                        />
                        <Label htmlFor="autoSelect-hasGenerator">Generatoren/Notstromaggregate</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autoSelect-hasWorkAbove2m"
                          checked={formData.autoSelect?.hasWorkAbove2m || false}
                          onCheckedChange={(checked) => handleInputChange('autoSelect', {
                            ...formData.autoSelect,
                            hasWorkAbove2m: checked
                          })}
                        />
                        <Label htmlFor="autoSelect-hasWorkAbove2m">Arbeiten über 2m Höhe</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autoSelect-hasPublicAccess"
                          checked={formData.autoSelect?.hasPublicAccess || false}
                          onCheckedChange={(checked) => handleInputChange('autoSelect', {
                            ...formData.autoSelect,
                            hasPublicAccess: checked
                          })}
                        />
                        <Label htmlFor="autoSelect-hasPublicAccess">Publikumsverkehr</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autoSelect-hasNightWork"
                          checked={formData.autoSelect?.hasNightWork || false}
                          onCheckedChange={(checked) => handleInputChange('autoSelect', {
                            ...formData.autoSelect,
                            hasNightWork: checked
                          })}
                        />
                        <Label htmlFor="autoSelect-hasNightWork">Nachtarbeit</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autoSelect-hasTrafficArea"
                          checked={formData.autoSelect?.hasTrafficArea || false}
                          onCheckedChange={(checked) => handleInputChange('autoSelect', {
                            ...formData.autoSelect,
                            hasTrafficArea: checked
                          })}
                        />
                        <Label htmlFor="autoSelect-hasTrafficArea">Verkehrsflächen betroffen</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autoSelect-hasHazardousMaterials"
                          checked={formData.autoSelect?.hasHazardousMaterials || false}
                          onCheckedChange={(checked) => handleInputChange('autoSelect', {
                            ...formData.autoSelect,
                            hasHazardousMaterials: checked
                          })}
                        />
                        <Label htmlFor="autoSelect-hasHazardousMaterials">Gefahrstoffe</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Jahreszeiten</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      {['Frühling', 'Sommer', 'Herbst', 'Winter'].map((season) => (
                        <div key={season} className="flex items-center space-x-2">
                          <Checkbox
                            id={`autoSelect-season-${season}`}
                            checked={(formData.autoSelect?.season || []).includes(season)}
                            onCheckedChange={(checked) => {
                              const currentSeasons = formData.autoSelect?.season || [];
                              const newSeasons = checked 
                                ? [...currentSeasons, season]
                                : currentSeasons.filter(s => s !== season);
                              handleInputChange('autoSelect', {
                                ...formData.autoSelect,
                                season: newSeasons
                              });
                            }}
                          />
                          <Label htmlFor={`autoSelect-season-${season}`}>{season}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {criteriaLoaded && availableCriteria.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Benutzerdefinierte Kriterien</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {availableCriteria.map((criteria) => (
                          <div key={criteria.id} className="space-y-2">
                            <Label className="text-sm font-medium">
                              {criteria.name}
                            </Label>
                            {criteria.description && (
                              <p className="text-xs text-muted-foreground">{criteria.description}</p>
                            )}
                            
                            {criteria.type === 'boolean' && (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`autoSelect-custom-${criteria.id}`}
                                  checked={(formData.autoSelect?.customCriteria || []).includes(criteria.id)}
                                  onCheckedChange={(checked) => {
                                    const currentCriteria = formData.autoSelect?.customCriteria || [];
                                    const newCriteria = checked 
                                      ? [...currentCriteria, criteria.id]
                                      : currentCriteria.filter(c => c !== criteria.id);
                                    handleInputChange('autoSelect', {
                                      ...formData.autoSelect,
                                      customCriteria: newCriteria
                                    });
                                  }}
                                />
                                <Label htmlFor={`autoSelect-custom-${criteria.id}`} className="text-sm">
                                  Erforderlich
                                </Label>
                              </div>
                            )}
                            
                            {criteria.type === 'multiselect' && criteria.options && (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Checkbox
                                    id={`autoSelect-custom-${criteria.id}`}
                                    checked={(formData.autoSelect?.customCriteria || []).includes(criteria.id)}
                                    onCheckedChange={(checked) => {
                                      const currentCriteria = formData.autoSelect?.customCriteria || [];
                                      const newCriteria = checked 
                                        ? [...currentCriteria, criteria.id]
                                        : currentCriteria.filter(c => c !== criteria.id);
                                      handleInputChange('autoSelect', {
                                        ...formData.autoSelect,
                                        customCriteria: newCriteria,
                                        customCriteriaValues: checked 
                                          ? formData.autoSelect?.customCriteriaValues 
                                          : { ...formData.autoSelect?.customCriteriaValues, [criteria.id]: undefined }
                                      });
                                    }}
                                  />
                                  <Label htmlFor={`autoSelect-custom-${criteria.id}`} className="text-sm">
                                    Aktivieren
                                  </Label>
                                </div>
                                
                                {(formData.autoSelect?.customCriteria || []).includes(criteria.id) && (
                                  <div className="ml-6 space-y-1">
                                    <Label className="text-xs text-muted-foreground">Erforderliche Werte:</Label>
                                    {criteria.options.map((option: string) => (
                                      <div key={option} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`autoSelect-custom-${criteria.id}-${option}`}
                                          checked={(formData.autoSelect?.customCriteriaValues?.[criteria.id] || []).includes(option)}
                                          onCheckedChange={(checked) => {
                                            const currentValues = formData.autoSelect?.customCriteriaValues?.[criteria.id] || [];
                                            const newValues = checked 
                                              ? [...currentValues, option]
                                              : currentValues.filter((v: string) => v !== option);
                                            handleInputChange('autoSelect', {
                                              ...formData.autoSelect,
                                              customCriteriaValues: {
                                                ...formData.autoSelect?.customCriteriaValues,
                                                [criteria.id]: newValues
                                              }
                                            });
                                          }}
                                        />
                                        <Label htmlFor={`autoSelect-custom-${criteria.id}-${option}`} className="text-xs">
                                          {option}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Wird gespeichert...' : (editingAssessment ? 'Aktualisieren' : 'Erstellen')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Label htmlFor="groupFilter">Gruppe filtern:</Label>
        </div>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Gruppen</SelectItem>
            {usedGroups.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gefährdungsbeurteilungen
          </CardTitle>
          <CardDescription>
            Globale Bibliothek von Gefährdungsbeurteilungen ({filteredAssessments.length} von {globalRiskAssessments.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-16">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Keine Gefährdungsbeurteilungen vorhanden
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Erstellen Sie Ihre erste Gefährdungsbeurteilung für die globale Bibliothek.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Erste Gefährdungsbeurteilung erstellen
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tätigkeit</TableHead>
                  <TableHead>Gefährdung</TableHead>
                  <TableHead>Gruppe</TableHead>
                  <TableHead>Risiko</TableHead>
                  <TableHead>Restrisiko</TableHead>
                  <TableHead>STOP</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">{assessment.activity}</TableCell>
                    <TableCell>{assessment.hazard}</TableCell>
                    <TableCell>
                      {assessment.group ? (
                        <Badge variant="outline">{assessment.group}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(assessment.riskValue)}>
                        {assessment.riskValue}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(assessment.residualRisk)}>
                        {assessment.residualRisk}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {assessment.substitution && <Badge variant="outline" className="text-xs">S</Badge>}
                        {assessment.technical && <Badge variant="outline" className="text-xs">T</Badge>}
                        {assessment.organizational && <Badge variant="outline" className="text-xs">O</Badge>}
                        {assessment.personal && <Badge variant="outline" className="text-xs">P</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {assessment.autoSelect ? (
                        <div className="flex flex-wrap gap-1">
                          {assessment.autoSelect.isOutdoor && <Badge variant="outline" className="text-xs">Outdoor</Badge>}
                          {assessment.autoSelect.hasElectricity && <Badge variant="outline" className="text-xs">Elektrik</Badge>}
                          {assessment.autoSelect.hasGenerator && <Badge variant="outline" className="text-xs">Generator</Badge>}
                          {assessment.autoSelect.hasWorkAbove2m && <Badge variant="outline" className="text-xs">Höhe</Badge>}
                          {assessment.autoSelect.hasPublicAccess && <Badge variant="outline" className="text-xs">Publikum</Badge>}
                          {assessment.autoSelect.hasNightWork && <Badge variant="outline" className="text-xs">Nacht</Badge>}
                          {assessment.autoSelect.hasTrafficArea && <Badge variant="outline" className="text-xs">Verkehr</Badge>}
                          {assessment.autoSelect.hasHazardousMaterials && <Badge variant="outline" className="text-xs">Gefahrstoffe</Badge>}
                          {assessment.autoSelect.season && assessment.autoSelect.season.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {assessment.autoSelect.season.slice(0, 2).join(', ')}
                              {assessment.autoSelect.season.length > 2 && '...'}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Keine Auto-Auswahl</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(assessment)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(assessment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}