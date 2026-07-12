export const USER_ROLES = ['fleet_manager', 'driver', 'safety_officer', 'financial_analyst'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  demoEmail: string;
  demoPassword: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  { value: 'fleet_manager', label: 'Fleet Manager', description: 'Full fleet, driver, trip, maintenance, finance, and reporting workspace.', demoEmail: 'fleet@transitops.io', demoPassword: 'fleet123' },
  { value: 'driver', label: 'Driver', description: 'A focused trip workspace for assigned transport operations.', demoEmail: 'driver@transitops.io', demoPassword: 'driver123' },
  { value: 'safety_officer', label: 'Safety Officer', description: 'Driver oversight, maintenance visibility, and compliance reporting.', demoEmail: 'safety@transitops.io', demoPassword: 'safety123' },
  { value: 'financial_analyst', label: 'Financial Analyst', description: 'Fuel, expense, and reporting tools for financial analysis.', demoEmail: 'finance@transitops.io', demoPassword: 'finance123' },
];

const ROUTE_ROLES: Record<string, UserRole[]> = {
  '/dashboard': [...USER_ROLES],
  '/vehicles': ['fleet_manager'],
  '/drivers': ['fleet_manager', 'safety_officer'],
  '/trips': ['fleet_manager', 'driver'],
  '/maintenance': ['fleet_manager', 'safety_officer'],
  '/fuel-logs': ['fleet_manager', 'financial_analyst'],
  '/expenses': ['fleet_manager', 'financial_analyst'],
  '/reports': ['fleet_manager', 'safety_officer', 'financial_analyst'],
};

export function canRoleAccessRoute(role: UserRole | undefined, route: string): boolean {
  return role !== undefined && ROUTE_ROLES[route]?.includes(role) === true;
}
