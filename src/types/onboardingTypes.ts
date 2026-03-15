// Shared types used by both HealthOnboardingPage and useOnboarding

export interface Demographics {
  heightFt:  string;
  heightIn:  string;
  weight:    string;
  bloodType: string;
  pregnancy: string;
  language:  string;
}

export interface Conditions {
  diabetes?:      boolean;
  hypertension?:  boolean;
  asthma?:        boolean;
  heartDisease?:  boolean;
  kidneyDisease?: boolean;
  stroke?:        boolean;
  cancer?:        boolean;
  mentalHealth?:  boolean;
  other:          string;
  [key: string]:  boolean | string | undefined;
}

export interface Medication {
  name:      string;
  dosage:    string;
  frequency: string;
  doctor:    string;
  pharmacy:  string;
}

export interface Allergy {
  name:     string;
  severity: string;
  reaction: string;
}

export interface Lifestyle {
  smoking:  string;
  alcohol:  string;
  activity: string;
  diet:     string;
  sleep:    string;
  notes:    string;
}

export interface Contact {
  name:         string;
  relationship: string;
  phone:        string;
}

export interface FormData {
  demographics:  Demographics;
  conditions:    Conditions;
  medications:   Medication[];
  allergies:     Allergy[];
  familyHistory: Record<string, string[]>;
  lifestyle:     Lifestyle;
  contacts:      Contact[];
}

// Alias for the hook which uses the longer name
export type OnboardingFormData = FormData;

export const INITIAL_FORM_DATA: FormData = {
  demographics:  { heightFt: "", heightIn: "", weight: "", bloodType: "", pregnancy: "", language: "english" },
  conditions:    { other: "" },
  medications:   [],
  allergies:     [],
  familyHistory: {},
  lifestyle:     { smoking: "", alcohol: "", activity: "", diet: "", sleep: "", notes: "" },
  contacts:      [],
};