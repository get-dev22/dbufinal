const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthToken() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token || null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async adminLogin(credentials) {
    return this.request('/auth/admin-login', {
      method: 'POST',
      body: credentials,
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: profileData,
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: passwordData,
    });
  }

  // User endpoints
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return this.request(endpoint);
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getUserStats() {
    return this.request('/users/stats/overview');
  }

  // Complaint endpoints
  async getComplaints(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/complaints?${queryString}` : '/complaints';
    const response = await this.request(endpoint);
    return response.complaints || response.data || response || [];
  }

  async getComplaintById(complaintId) {
    return this.request(`/complaints/${complaintId}`);
  }

  async createComplaint(complaintData) {
    return this.request('/complaints', {
      method: 'POST',
      body: complaintData,
    });
  }

  async addComplaintResponse(complaintId, responseData) {
    return this.request(`/complaints/${complaintId}/responses`, {
      method: 'POST',
      body: responseData,
    });
  }

  async updateComplaintStatus(complaintId, status) {
    return this.request(`/complaints/${complaintId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async assignComplaint(complaintId, assignedTo) {
    return this.request(`/complaints/${complaintId}/assign`, {
      method: 'PATCH',
      body: { assignedTo },
    });
  }

  async getComplaintStats() {
    return this.request('/complaints/stats/overview');
  }

  // Club endpoints
  async getClubs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/clubs?${queryString}` : '/clubs';
    const response = await this.request(endpoint);
    return response.clubs || response.data || response || [];
  }

  async getClubById(clubId) {
    return this.request(`/clubs/${clubId}`);
  }

  async createClub(clubData) {
    return this.request('/clubs', {
      method: 'POST',
      body: clubData,
    });
  }

  async updateClub(clubId, clubData) {
    return this.request(`/clubs/${clubId}`, {
      method: 'PUT',
      body: clubData,
    });
  }

  async deleteClub(clubId) {
    return this.request(`/clubs/${clubId}`, {
      method: 'DELETE',
    });
  }

  async joinClub(clubId, memberData) {
    return this.request(`/clubs/${clubId}/join`, {
      method: 'POST',
      body: memberData,
    });
  }

  async leaveClub(clubId) {
    return this.request(`/clubs/${clubId}/leave`, {
      method: 'POST',
    });
  }

  async approveClubMember(clubId, memberId) {
    return this.request(`/clubs/${clubId}/members/${memberId}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectClubMember(clubId, memberId) {
    return this.request(`/clubs/${clubId}/members/${memberId}/reject`, {
      method: 'PATCH',
    });
  }

  async getClubJoinRequests(clubId) {
    return this.request(`/clubs/${clubId}/join-requests`);
  }

  async getClubStats() {
    return this.request('/clubs/stats/overview');
  }

  // Post endpoints
  async getPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/posts?${queryString}` : '/posts';
    const response = await this.request(endpoint);
    return response.posts || response.data || response || [];
  }

  async getPostById(postId) {
    return this.request(`/posts/${postId}`);
  }

  async createPost(postData) {
    return this.request('/posts', {
      method: 'POST',
      body: postData,
    });
  }

  async updatePost(postId, postData) {
    return this.request(`/posts/${postId}`, {
      method: 'PUT',
      body: postData,
    });
  }

  async deletePost(postId) {
    return this.request(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async likePost(postId) {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async addPostComment(postId, commentData) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: commentData,
    });
  }

  async registerForEvent(postId) {
    return this.request(`/posts/${postId}/register`, {
      method: 'POST',
    });
  }

  async getPostStats() {
    return this.request('/posts/stats/overview');
  }

  // Election endpoints
  async getElections(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/elections?${queryString}` : '/elections';
    const response = await this.request(endpoint);
    return response.elections || response.data || response || [];
  }

  async getElectionById(electionId) {
    return this.request(`/elections/${electionId}`);
  }

  async createElection(electionData) {
    return this.request('/elections', {
      method: 'POST',
      body: electionData,
    });
  }

  async updateElection(electionId, electionData) {
    return this.request(`/elections/${electionId}`, {
      method: 'PUT',
      body: electionData,
    });
  }

  async deleteElection(electionId) {
    return this.request(`/elections/${electionId}`, {
      method: 'DELETE',
    });
  }

  async voteInElection(electionId, candidateId) {
    return this.request(`/elections/${electionId}/vote`, {
      method: 'POST',
      body: { candidateId },
    });
  }

  async announceElectionResults(electionId) {
    return this.request(`/elections/${electionId}/announce`, {
      method: 'POST',
    });
  }

  async getElectionStats() {
    return this.request('/elections/stats/overview');
  }

  // Contact endpoints
  async submitContactMessage(contactData) {
    return this.request('/contact', {
      method: 'POST',
      body: contactData,
    });
  }

  async getContactMessages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/contact?${queryString}` : '/contact';
    const response = await this.request(endpoint);
    return response.contacts || response.data || response || [];
  }

  async getContactMessageById(contactId) {
    return this.request(`/contact/${contactId}`);
  }

  async updateContactStatus(contactId, statusData) {
    return this.request(`/contact/${contactId}/status`, {
      method: 'PATCH',
      body: statusData,
    });
  }

  async replyToContact(contactId, replyData) {
    return this.request(`/contact/${contactId}/reply`, {
      method: 'POST',
      body: replyData,
    });
  }

  async assignContact(contactId, assignedTo) {
    return this.request(`/contact/${contactId}/assign`, {
      method: 'PATCH',
      body: { assignedTo },
    });
  }

  async deleteContact(contactId) {
    return this.request(`/contact/${contactId}`, {
      method: 'DELETE',
    });
  }

  async getContactStats() {
    return this.request('/contact/stats/overview');
  }
}

export const apiService = new ApiService();
export default apiService;