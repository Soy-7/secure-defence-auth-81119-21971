export type RoleKey =
	| "personnel"
	| "family"
	| "veteran"
	| "cert"
	| "commander"
	| "admin"
	| "auditor";

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
	enforcedMfaMethod?: "totp" | "sms";
	securityNotes?: string[];
	passwordPolicy?: {
		minLength: number;
		requireSpecialCharacter?: boolean;
		message: string;
	};
	highPrivilege?: boolean;
	readOnlyRole?: boolean;
}

export const auditorWhitelist = [
	"auditor@mod.gov.in",
	"audit.ops@mod.gov.in",
	"audit.ctrl@defence.in",
];

export const defenceEmailPattern = /^[a-z0-9._%+-]+@(?:army|navy|airforce|drdo)\.(?:mil|gov)\.in$/i;
export const adminEmailPattern = /^[a-z0-9._%+-]+@(?:mod\.gov\.in|defence\.in)$/i;

export const roleOptions: { value: RoleKey; label: string }[] = [
	{ value: "personnel", label: "Defence Personnel" },
	{ value: "family", label: "Family Member / Dependent" },
	{ value: "veteran", label: "Veteran / Retired Officer" },
	{ value: "cert", label: "CERT Analyst" },
	{ value: "commander", label: "Commander" },
	{ value: "admin", label: "Admin / MoD Authority" },
	{ value: "auditor", label: "Auditor" },
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
		placeholder: "e.g., SPARSH-7654321",
		tooltip: "Enter your SPARSH or Pension ID.",
		idPattern: /^(?:SPARSH|PEN)-?\d{6,8}$/i,
		idValidationMessage:
			"ID must begin with SPARSH or PEN and include 6-8 digits (hyphen optional).",
		enforceUppercase: true,
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
	commander: {
		idLabel: "Command ID / Service ID",
		placeholder: "e.g., CMD-AF-101",
		tooltip: "Command ID prefixes include CMD, CO, HQ. Ensure correct unit suffix.",
		idPattern: /^(?:CMD|CO|HQ)(?:-[A-Z]{1,3})*-?\d{2,}$/i,
		idValidationMessage:
			"Command IDs must start with CMD, CO, or HQ and end with digits (unit codes optional).",
		enforceUppercase: true,
		requiresDefenceEmail: true,
		emailPattern: defenceEmailPattern,
		emailErrorMessage: "Command-level access requires a verified defence email.",
		requiresMfa: true,
		enforcedMfaMethod: "totp",
		highPrivilege: true,
		securityNotes: [
			"High-privilege access flagged for realtime monitoring.",
			"Authenticator-based MFA enforced on every login.",
		],
	},
	admin: {
		idLabel: "Official Email ID",
		placeholder: "e.g., admin@mod.gov.in",
		tooltip: "Use Ministry of Defence email credentials.",
		idPattern: adminEmailPattern,
		idValidationMessage:
			"Email must belong to the mod.gov.in or defence.in domain.",
		inputType: "email",
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
	auditor: {
		idLabel: "Audit Credential / Official Email",
		placeholder: "e.g., auditor@mod.gov.in",
		tooltip: "Auditor access is read-only and limited to approved email addresses.",
		idPattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
		idValidationMessage: "Enter a valid official email address.",
		inputType: "email",
		requiresDefenceEmail: true,
		emailPattern: adminEmailPattern,
		emailErrorMessage:
			"Auditor email must match approved defence domains and whitelist.",
		emailWhitelist: auditorWhitelist,
		requiresMfa: true,
		enforcedMfaMethod: "totp",
		readOnlyRole: true,
		securityNotes: [
			"Access is read-only; activity monitored.",
			"Email must match approved auditor roster.",
		],
	},
};