import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization || '';
		let token = null;
		if (authHeader.startsWith('Bearer ')) {
			token = authHeader.substring(7);
		}
		if (!token && req.cookies && req.cookies.token) {
			token = req.cookies.token;
		}
		if (!token) {
			return res.status(401).json({ message: 'Authentication token missing' });
		}
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = { id: payload.id, role: payload.role, username: payload.username };
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
};

export const allowRoles = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden: insufficient role' });
		}
		next();
	};
};

// Role-specific middleware functions for protecting routes

// Single role access
export const allowAdminOnly = allowRoles('admin'); // Only system administrators

export const allowEmployeeOnly = allowRoles('employee'); // Only employees
export const allowHROnly = allowRoles('hr'); // Only HR
export const allowMarketingOnly = allowRoles('marketing'); // Only Marketing
export const allowSalesOnly = allowRoles('sales'); // Only Sales
export const allowManagerOnly = allowRoles('manager'); // Only Managers
export const allowDeveloperOnly = allowRoles('developer'); // Only Developers
export const allowTesterOnly = allowRoles('tester'); // Only Testers

// Add missing role helper for interns
export const allowInternOnly = allowRoles('intern'); // Only Interns


// Hierarchical access (role and above)
export const allowManagersAndAbove = allowRoles('admin', 'manager'); // Managers and admins
export const allowDevelopersAndAbove = allowRoles('admin', 'manager', 'developer'); // Developers, managers, and admins
export const allowTestersAndAbove = allowRoles('admin', 'manager', 'tester'); // Testers, managers, and admins
export const allowEmployeesAndAbove = allowRoles('admin', 'manager', 'developer', 'tester', 'employee'); // All basic roles

// Department-specific access
export const allowHRAndAbove = allowRoles('admin', 'hr'); // HR and admins
export const allowMarketingAndAbove = allowRoles('admin', 'marketing'); // Marketing and admins
export const allowSalesAndAbove = allowRoles('admin', 'sales'); // Sales and admins

// Team-based access
export const allowDevelopmentTeam = allowRoles('admin', 'manager', 'developer', 'tester'); // Technical team
export const allowManagementTeam = allowRoles('admin', 'manager'); // Management only
export const allowDepartmentRoles = allowRoles('admin', 'hr', 'marketing', 'sales'); // Non-technical departments

// Broad access categories
export const allowTechnicalRoles = allowRoles('admin', 'manager', 'developer', 'tester'); // Technical roles
export const allowNonTechnicalRoles = allowRoles('admin', 'manager', 'employee', 'hr', 'marketing', 'sales'); // Non-technical roles
export const allowAllAuthenticated = allowRoles('admin', 'manager', 'developer', 'tester', 'employee', 'hr', 'marketing', 'sales'); // Any authenticated user

