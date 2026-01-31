// Authentication Service
class AuthService {
  constructor() {
    this.tokenKey = 'token';
    this.userKey = 'user';
  }

  // Decode JWT token (simple base64 decode - not cryptographically verified)
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // Register new user
  async register(email, password, name, phone) {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
        phone,
      });

      if (response.accessToken) {
        this.setToken(response.accessToken);
        const user = this.decodeToken(response.accessToken);
        this.setUser(user);
        return { success: true, user };
      }

      return { success: false, error: 'No token received' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      if (response.accessToken) {
        this.setToken(response.accessToken);
        const user = this.decodeToken(response.accessToken);
        this.setUser(user);
        return { success: true, user };
      }

      return { success: false, error: 'No token received' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      this.setUser(response);
      return response;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.logout();
      return null;
    }
  }

  // Logout
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.location.href = '/';
  }

  // Store token
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Store user info
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Get stored user info
  getUser() {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get user role
  getUserRole() {
    const user = this.getUser();
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return null;
    }
    // Return first role (assuming one primary role)
    return user.roles[0];
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return false;

    // Check if token is expired
    const now = Date.now() / 1000;
    return payload.exp > now;
  }

  // Redirect to role-specific dashboard
  redirectToDashboard() {
    const role = this.getUserRole();
    const dashboards = {
      customer: '/customer/index.html',
      driver: '/driver/index.html',
      restaurant_owner: '/restaurant/index.html',
      admin: '/admin/index.html',
    };

    const dashboard = dashboards[role] || '/';
    window.location.href = dashboard;
  }

  // Check authentication and redirect if needed
  checkAuth(requiredRole = null) {
    if (!this.isAuthenticated()) {
      window.location.href = '/';
      return false;
    }

    if (requiredRole) {
      const userRole = this.getUserRole();
      if (userRole !== requiredRole) {
        this.showError('Access denied - insufficient permissions');
        this.redirectToDashboard();
        return false;
      }
    }

    return true;
  }

  // Show error message (uses toast if available)
  showError(message) {
    if (window.showToast) {
      window.showToast(message, 'error');
    } else {
      alert(message);
    }
  }
}

// Global auth service instance
const auth = new AuthService();
