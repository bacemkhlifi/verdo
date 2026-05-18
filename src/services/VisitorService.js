import ApiService from "./ApiService";

const VISITOR_ID_KEY = "verdolive_visitor_id";
const SESSION_TRACKED_KEY = "verdolive_visit_tracked";

const createVisitorId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

class VisitorService {
  async trackVisit(path = window.location.pathname) {
    if (sessionStorage.getItem(SESSION_TRACKED_KEY)) {
      return;
    }

    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = createVisitorId();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    try {
      await ApiService.post("visitors", { visitorId, path });
      sessionStorage.setItem(SESSION_TRACKED_KEY, "true");
    } catch (error) {
      console.warn("Visitor tracking failed:", error);
    }
  }
}

export default new VisitorService();
