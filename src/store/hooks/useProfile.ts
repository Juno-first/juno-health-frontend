import { useState, useEffect } from 'react';
import { onboardingClient } from '../../libs/api/onboardingClient';
import type { OnboardingSurveyResponse } from '../../schemas/onboarding.schema';

export type ProfileLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

// ── Display types (what the page consumes) ────────────────────────────────────

export interface ProfileCondition {
  dot:       string;
  name:      string;
  diagnosed: string;
  badge:     string;
  bCls:      string;
}

export interface ProfileAllergy {
  name:        string;
  severity:    string;
  reaction:    string;
  card:        string;
  nameCls:     string;
  reactionCls: string;
  badge:       string;
}

export interface ProfileMedication {
  name:  string;
  dose:  string;
  dr:    string;
}

export interface ProfileContact {
  name:     string;
  relation: string;
  tel:      string;
  avatar:   string;
}

export interface ProfileFamilyMember {
  iconCls:    string;
  relation:   string;
  conditions: string;
}

export interface ProfileVitalStat {
  label: string;
  value: string;
}

export interface ProfileData {
  heightDisplay:  string;
  weightDisplay:  string;
  bloodType:      string;
  pregnancyStatus: string;
  conditions:     ProfileCondition[];
  allergies:      ProfileAllergy[];
  medications:    ProfileMedication[];
  familyHistory:  ProfileFamilyMember[];
  contacts:       ProfileContact[];
  lifestyle: {
    smoking:  string;
    alcohol:  string;
    activity: string;
    diet:     string;
    sleep:    string;
    notes:    string;
  };
  lastUpdatedAt: string | null;
  isComplete:    boolean;
}

// ── Conversion helpers ────────────────────────────────────────────────────────

function cmToFeetIn(cm: number | null | undefined): string {
  if (!cm) return '—';
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn % 12);
  return `${ft}'${inches}"`;
}

function kgToLbs(kg: number | null | undefined): string {
  if (!kg) return '—';
  return `${Math.round(kg / 0.453592)} lbs`;
}

const CONDITION_STYLES: Record<string, { dot: string; bCls: string; badge: string }> = {
  diabetes:      { dot: 'bg-red-500',    bCls: 'bg-yellow-100 text-yellow-700', badge: 'Active'     },
  hypertension:  { dot: 'bg-orange-500', bCls: 'bg-green-100 text-green-700',   badge: 'Controlled' },
  asthma:        { dot: 'bg-blue-500',   bCls: 'bg-blue-100 text-blue-700',     badge: 'Managed'    },
  heartDisease:  { dot: 'bg-red-600',    bCls: 'bg-red-100 text-red-700',       badge: 'Active'     },
  kidneyDisease: { dot: 'bg-purple-500', bCls: 'bg-purple-100 text-purple-700', badge: 'Monitored'  },
  stroke:        { dot: 'bg-gray-700',   bCls: 'bg-gray-100 text-gray-700',     badge: 'History'    },
  cancer:        { dot: 'bg-pink-600',   bCls: 'bg-pink-100 text-pink-700',     badge: 'Active'     },
  mentalHealth:  { dot: 'bg-teal-500',   bCls: 'bg-teal-100 text-teal-700',     badge: 'Managed'    },
};

const CONDITION_LABELS: Record<string, string> = {
  diabetes:      'Diabetes',
  hypertension:  'Hypertension',
  asthma:        'Asthma',
  heartDisease:  'Heart Disease',
  kidneyDisease: 'Kidney Disease',
  stroke:        'Stroke History',
  cancer:        'Cancer',
  mentalHealth:  'Mental Health Condition',
};

const SEVERITY_STYLES: Record<string, {
  card: string; nameCls: string; reactionCls: string; badge: string;
}> = {
  mild: {
    card: 'bg-yellow-50 border-yellow-400',
    nameCls: 'text-yellow-900', reactionCls: 'text-yellow-700',
    badge: 'bg-yellow-200 text-yellow-900',
  },
  moderate: {
    card: 'bg-orange-50 border-orange-400',
    nameCls: 'text-orange-900', reactionCls: 'text-orange-700',
    badge: 'bg-orange-200 text-orange-900',
  },
  severe: {
    card: 'bg-red-50 border-red-500',
    nameCls: 'text-red-900', reactionCls: 'text-red-700',
    badge: 'bg-red-200 text-red-900',
  },
  'life-threatening': {
    card: 'bg-red-50 border-red-700',
    nameCls: 'text-red-900', reactionCls: 'text-red-800',
    badge: 'bg-red-300 text-red-900',
  },
};

const FAMILY_STYLES: Record<string, { iconCls: string; relation: string }> = {
  mother:   { iconCls: 'text-pink-500',   relation: 'Mother'   },
  father:   { iconCls: 'text-blue-500',   relation: 'Father'   },
  siblings: { iconCls: 'text-purple-500', relation: 'Siblings' },
  children: { iconCls: 'text-green-500',  relation: 'Children' },
};

const DEFAULT_AVATARS = [
  'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
  'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
  'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
];

function mapResponse(res: OnboardingSurveyResponse): ProfileData {
  // Conditions
  const conditions: ProfileCondition[] = (res.conditionsSelected ?? []).map(key => {
    const style = CONDITION_STYLES[key] ?? { dot: 'bg-gray-400', bCls: 'bg-gray-100 text-gray-700', badge: 'Active' };
    return {
      dot:       style.dot,
      name:      CONDITION_LABELS[key] ?? key,
      diagnosed: '—',
      badge:     style.badge,
      bCls:      style.bCls,
    };
  });

  // Add other conditions text as a custom entry
  if (res.conditionsOtherText?.trim()) {
    conditions.push({
      dot: 'bg-gray-400', name: res.conditionsOtherText.trim(),
      diagnosed: '—', badge: 'Active', bCls: 'bg-gray-100 text-gray-700',
    });
  }

  // Allergies
  const allergies: ProfileAllergy[] = ((res.allergies ?? []) as any[]).map(a => {
    const sev = (a.severity ?? 'moderate').toLowerCase();
    const style = SEVERITY_STYLES[sev] ?? SEVERITY_STYLES.moderate;
    return {
      name:        a.name ?? '—',
      severity:    (a.severity ?? 'MODERATE').toUpperCase(),
      reaction:    a.reaction ?? '—',
      ...style,
    };
  });

  // Medications
  const medications: ProfileMedication[] = ((res.medications ?? []) as any[]).map(m => ({
    name: m.name ?? '—',
    dose: [m.dosage, m.frequency].filter(Boolean).join(' – '),
    dr:   m.doctor ? `Dr. ${m.doctor}` : 'Unknown',
  }));

  // Family history
  const familyHistory: ProfileFamilyMember[] = Object.entries(
    (res.familyHistory ?? {}) as Record<string, string[]>
  )
    .filter(([, conditions]) => conditions.length > 0)
    .map(([member, conds]) => ({
      iconCls:    FAMILY_STYLES[member]?.iconCls    ?? 'text-gray-500',
      relation:   FAMILY_STYLES[member]?.relation   ?? member,
      conditions: conds.join(', '),
    }));

  // Emergency contacts
  const contacts: ProfileContact[] = ((res as any).contacts ?? []).map(
    (c: any, i: number) => ({
      name:     c.name         ?? '—',
      relation: c.relationship ?? '—',
      tel:      (c.phone ?? '').replace(/\D/g, ''),
      avatar:   DEFAULT_AVATARS[i % DEFAULT_AVATARS.length],
    })
  );

  return {
    heightDisplay:   cmToFeetIn(res.heightCm),
    weightDisplay:   kgToLbs(res.weightKg),
    bloodType:       '—',   // not collected in onboarding yet
    pregnancyStatus: res.pregnancyStatus ?? '—',
    conditions,
    allergies,
    medications,
    familyHistory,
    contacts,
    lifestyle: {
      smoking:  res.smokingStatus         ?? '—',
      alcohol:  res.alcoholFrequency       ?? '—',
      activity: res.physicalActivityLevel  ?? '—',
      diet:     res.dietPattern            ?? '—',
      sleep:    res.sleepPattern           ?? '—',
      notes:    res.lifestyleNotes         ?? '',
    },
    lastUpdatedAt: res.lastUpdatedAt ?? null,
    isComplete:    res.completed,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useProfile() {
  const [profile,    setProfile]    = useState<ProfileData | null>(null);
  const [loadStatus, setLoadStatus] = useState<ProfileLoadStatus>('idle');
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadStatus('loading');

    onboardingClient.getProgress()
      .then(res => {
        if (cancelled) return;
        if (!res) { setLoadStatus('loaded'); return; }
        setProfile(mapResponse(res));
        setLoadStatus('loaded');
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[useProfile]', err);
        setError('Failed to load profile data.');
        setLoadStatus('error');
      });

    return () => { cancelled = true; };
  }, []);

  return { profile, loadStatus, error };
}