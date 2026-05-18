import ApiService from "./ApiService";

class AdminService {
  async getSummary() {
    return ApiService.get("admin/summary");
  }

  async getUsers() {
    return ApiService.get("admin/users");
  }

  async createUser(payload) {
    return ApiService.post("admin/users", payload);
  }

  async updateUser(id, payload) {
    return ApiService.patch(`admin/users/${id}`, payload);
  }

  async deleteUser(id) {
    return ApiService.delete(`admin/users/${id}`);
  }

  async getInvestments() {
    return ApiService.get("investments");
  }

  async createInvestment(payload) {
    return ApiService.post("investments", payload);
  }

  async updateInvestment(id, payload) {
    return ApiService.put(`investments/${id}`, payload);
  }

  async deleteInvestment(id) {
    return ApiService.delete(`investments/${id}`);
  }
}

export default new AdminService();
