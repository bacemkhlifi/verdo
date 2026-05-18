import ApiService from "./ApiService";

class LandService {
  async createLand(payload) {
    return ApiService.post("lands", payload);
  }

  async getMyLands() {
    return ApiService.get("lands/my");
  }

  async getAllLands() {
    return ApiService.get("lands");
  }

  async getApprovedLands() {
    return ApiService.get("lands/approved");
  }

  async updateStatus(id, status, rejectionReason = "") {
    return ApiService.patch(`lands/${id}/status`, { status, rejectionReason });
  }

  async deleteLand(id) {
    return ApiService.delete(`lands/${id}`);
  }
}

export default new LandService();
