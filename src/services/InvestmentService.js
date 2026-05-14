import ApiService from "./ApiService";

class InvestmentService {
  async investInLand(landId, amount) {
    return ApiService.post(`investments/lands/${landId}`, { amount });
  }

  async getMyInvestments() {
    return ApiService.get("investments/my");
  }
}

export default new InvestmentService();
