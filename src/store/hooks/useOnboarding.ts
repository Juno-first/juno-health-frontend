import { useState, useEffect, useCallback } from 'react';
import { onboardingClient }               from '../../libs/api/onboardingClient';
import type { FormData }                  from '../../pages/HealthOnboardingPage';

// ── Conversion helpers ────────────────────────────────────────────────────────

/** cm → feet + inches strings */
function cmToFeetIn(cm: number | null | undefined): { ft: string; in: string } {
  if (!cm) return { ft: "", in: "" };
  const totalIn = cm / 2.54;
  return {
    ft: String(Math.floor(totalIn / 12)),
    in: String(Math.round(totalIn % 12)),
  };
}

/** lbs → kg */
function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10;
}

/** feet + inches strings → cm */
function feetInToCm(ft: string, inches: string): number | null {
  const f = parseFloat(ft);
  const i = parseFloat(inches);
  if (isNaN(f) && isNaN(i)) return null;
  return Math.round(((isNaN(f) ? 0 : f) * 12 + (isNaN(i) ? 0 : i)) * 2.54 * 10) / 10;
}

/** weight string (lbs) → kg */
function weightLbsToKg(lbs: string): number | null {
  const n = parseFloat(lbs);
  return isNaN(n) ? null : lbsToKg(n);
}

/** kg → lbs string */
function kgToLbs(kg: number | null | undefined): string {
  if (!kg) return "";
  return String(Math.round(kg / 0.453592));
}

/** Conditions object → array of selected condition keys */
function conditionsToList(conditions: FormData['conditions']): string[] {
  const KEYS = [
    'diabetes','hypertension','asthma','heartDisease',
    'kidneyDisease','stroke','cancer','mentalHealth',
  ];
  return KEYS.filter(k => !!conditions[k]);
}

/** Array of condition keys → conditions object */
function listToConditions(
  selected: string[] | null | undefined,
  other: string | null | undefined,
): FormData['conditions'] {
  const obj: FormData['conditions'] = { other: other ?? "" };
  (selected ?? []).forEach(k => { obj[k] = true; });
  return obj;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseOnboardingResult {
  /** true while loading existing progress on mount */
  loadStatus:  'idle' | 'loading' | 'loaded' | 'error';
  saveStatus:  SaveStatus;
  saveError:   string | null;
  isCompleted: boolean;
  /** Call after each step to persist progress */
  saveStep:    (data: FormData, step: number) => Promise<void>;
  /** Call on the final step to mark complete */
  complete:    (data: FormData) => Promise<void>;
}

export function useOnboarding(
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
): UseOnboardingResult {
  const [loadStatus,  setLoadStatus]  = useState<'idle'|'loading'|'loaded'|'error'>('idle');
  const [saveStatus,  setSaveStatus]  = useState<SaveStatus>('idle');
  const [saveError,   setSaveError]   = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // ── On mount: load existing progress and pre-populate form ────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadStatus('loading');

    onboardingClient.getProgress()
      .then(res => {
        if (cancelled || !res) { setLoadStatus('loaded'); return; }

        const { ft, in: inches } = cmToFeetIn(res.heightCm);

        setFormData(prev => ({
          ...prev,
          demographics: {
            ...prev.demographics,
            heightFt:  ft,
            heightIn:  inches,
            weight:    kgToLbs(res.weightKg),
            pregnancy: res.pregnancyStatus ?? "",
          },
          conditions:    listToConditions(res.conditionsSelected, res.conditionsOtherText),
          medications:   (res.medications ?? []) as FormData['medications'],
          allergies:     (res.allergies   ?? []) as FormData['allergies'],
          familyHistory: (res.familyHistory ?? {}) as FormData['familyHistory'],
          lifestyle: {
            smoking:  res.smokingStatus         ?? "",
            alcohol:  res.alcoholFrequency       ?? "",
            activity: res.physicalActivityLevel  ?? "",
            diet:     res.dietPattern            ?? "",
            sleep:    res.sleepPattern           ?? "",
            notes:    res.lifestyleNotes         ?? "",
          },
        }));

        setIsCompleted(res.completed);
        setLoadStatus('loaded');
      })
      .catch(() => {
        if (!cancelled) setLoadStatus('error');
      });

    return () => { cancelled = true; };
  }, []);

  // ── Build request from FormData ───────────────────────────────────────────
  function buildRequest(data: FormData, markCompleted = false) {
    return {
      // Demographics
      heightCm:        feetInToCm(data.demographics.heightFt, data.demographics.heightIn),
      weightKg:        weightLbsToKg(data.demographics.weight),
      pregnancyStatus: data.demographics.pregnancy || null,

      // Conditions
      conditionsNone:      conditionsToList(data.conditions).length === 0,
      conditionsSelected:  conditionsToList(data.conditions),
      conditionsOtherText: data.conditions.other || null,

      // Medications & allergies — pass as-is (already typed correctly)
      medications:   data.medications.length   ? data.medications   : null,
      allergies:     data.allergies.length      ? data.allergies     : null,
      familyHistory: Object.keys(data.familyHistory).length ? data.familyHistory : null,

      // Lifestyle
      smokingStatus:         data.lifestyle.smoking   || null,
      alcoholFrequency:      data.lifestyle.alcohol   || null,
      physicalActivityLevel: data.lifestyle.activity  || null,
      dietPattern:           data.lifestyle.diet      || null,
      sleepPattern:          data.lifestyle.sleep     || null,
      lifestyleNotes:        data.lifestyle.notes     || null,

      markCompleted,
    };
  }

  const saveStep = useCallback(async (data: FormData, _step: number) => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      await onboardingClient.saveProgress(buildRequest(data, false));
      setSaveStatus('saved');
      // Reset to idle after 2 s so the UI indicator fades
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to save progress.';
      setSaveError(msg);
      setSaveStatus('error');
    }
  }, []);

  const complete = useCallback(async (data: FormData) => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      await onboardingClient.saveProgress(buildRequest(data, true));
      setIsCompleted(true);
      setSaveStatus('saved');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to complete onboarding.';
      setSaveError(msg);
      setSaveStatus('error');
    }
  }, []);

  return { loadStatus, saveStatus, saveError, isCompleted, saveStep, complete };
}