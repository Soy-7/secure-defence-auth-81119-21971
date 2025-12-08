export type RoleKey =
	| "personnel"
	| "family"
	| "veteran"
	| "cert"
	| "admin";

export interface RoleConfig {
	idLabel: string;
	placeholder: string;
	tooltip: string;
	idPattern: RegExp;
	idValidationMessage: string;
	inputType?: "text" | "email";
	enforceUppercase?: boolean;
	requiresDefenceEmail?: boolean;
	emailPattern?: RegExp;
	emailErrorMessage?: string;
	emailWarningMessage?: string;
	emailWhitelist?: string[];
	requiresMfa?: boolean;
	enforcedMfaMethod?: "totp" | "email";
	securityNotes?: string[];
	passwordPolicy?: {
		minLength: number;
		requireSpecialCharacter?: boolean;
		message: string;
	};
	highPrivilege?: boolean;
	readOnlyRole?: boolean;
}

export const defenceEmailPattern = /^[a-z0-9._%+-]+@(?:army|navy|airforce|drdo)\.(?:mil|gov)\.in$|^[a-z0-9._%+-]+@(?:gov|nic)\.in$/i;
export const adminEmailPattern = /^[a-z0-9._%+-]+@(?:mod\.gov\.in|defence\.in|gov\.in|nic\.in)$/i;
export const modCredentialPattern = /^MOD-[A-Z]{2,4}-\d{4}$/;

export const roleOptions: { value: RoleKey; label: string }[] = [
	{ value: "personnel", label: "Defence Personnel" },
	{ value: "family", label: "Family Member / Dependent" },
	{ value: "veteran", label: "Veteran / Retired Officer" },
	{ value: "cert", label: "CERT Analyst" },
	{ value: "admin", label: "Admin / MoD Authority" },
];

export const roleConfigurations: Record<RoleKey, RoleConfig> = {
	personnel: {
		idLabel: "Service ID",
		placeholder: "e.g., ARMY123456",
		tooltip: "Enter your official Service ID. Prefix indicates branch (ARMY, NAVY, AIRF, DRDO).",
		idPattern: /^(?:ARMY|NAVY|AIRF|DRDO)[A-Z0-9]{2,6}$/,
		idValidationMessage:
			"Service ID must be 6-10 characters, start with ARMY, NAVY, AIRF, or DRDO, and contain only letters/numbers.",
		enforceUppercase: true,
		requiresDefenceEmail: true,
		emailPattern: defenceEmailPattern,
		emailErrorMessage: "Defence Personnel must use an official defence email domain (army/navy/airforce/drdo).",
		securityNotes: [
			"Access audited under active duty policy.",
			"Defence email required for faster verification.",
		],
	},
	family: {
		idLabel: "Defence Family ID (D-FID)",
		placeholder: "e.g., D-FID-23857",
		tooltip: "Your D-FID links to your sponsor's record. Non-defence email allowed but flagged for manual verification.",
		idPattern: /^D-FID-\d{4,}$/i,
		idValidationMessage: "D-FID must start with D-FID- followed by at least 4 digits.",
		enforceUppercase: true,
		emailWarningMessage:
			"Non-defence email detected. Registration will be flagged for manual verification.",
		securityNotes: [
			"Manual verification required if email is non-defence.",
			"Limited portal capabilities until sponsor confirmation.",
		],
	},
	veteran: {
		idLabel: "SPARSH / Pension ID",
		placeholder: "e.g., 7654321",
		tooltip: "Enter your SPARSH ID or Pension ID (numeric only, 6-12 digits).",
		idPattern: /^\d{6,12}$/,
		idValidationMessage:
			"SPARSH/Pension ID must be 6-12 digits (numbers only).",
		enforceUppercase: false,
		requiresDefenceEmail: true,
		emailPattern: defenceEmailPattern,
		emailErrorMessage:
			"Veterans are required to use a registered defence or pension-linked email.",
		securityNotes: ["Pension-linked accounts monitored for anomalous payments."],
	},
	cert: {
		idLabel: "Analyst Credential / Service ID",
		placeholder: "e.g., CERT-ANL-0942",
		tooltip: "Analyst ID issues CERT dashboard access. Defence domain required.",
		idPattern: /^CERT-[A-Z0-9-]*\d{3,}$/i,
		idValidationMessage:
			"Analyst ID must include the CERT- prefix and end with digits.",
		enforceUppercase: true,
		requiresDefenceEmail: true,
		emailPattern: defenceEmailPattern,
		emailErrorMessage: "CERT Analysts must use a defence-controlled email domain.",
		requiresMfa: true,
		enforcedMfaMethod: "totp",
		securityNotes: [
			"MFA via authenticator app is mandatory.",
			"All actions logged within CERT audit trail.",
		],
	},
	admin: {
		idLabel: "MOD Credential ID",
		placeholder: "e.g., MOD-HQ-2045",
		tooltip: "Issued by the MoD Identity Directorate. Format: MOD-UNIT-####.",
		idPattern: modCredentialPattern,
		idValidationMessage:
			"Credential ID must follow MOD-UNIT-#### with an approved unit code and four digits.",
		enforceUppercase: true,
		requiresMfa: true,
		enforcedMfaMethod: "totp",
		requiresDefenceEmail: true,
		emailPattern: adminEmailPattern,
		emailErrorMessage: "Administrators must authenticate with mod.gov.in or defence.in email.",
		passwordPolicy: {
			minLength: 12,
			requireSpecialCharacter: true,
			message: "Passwords must be at least 12 characters with a special character for admin access.",
		},
		securityNotes: [
			"Strict password policy enforced (12+ chars, special character).",
			"MFA mandatory. Session is privileged.",
		],
	},
};