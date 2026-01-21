// src/api/penalties.js
import api from "./axios";

export const penaltiesAPI = {
  // GET /penalties/my – fetch current user's penalties
  getMyPenalties: () => api.get("/penalties/my"),

  // GET /penalties/:penaltyId – get penalty by ID
  getPenaltyById: (penaltyId) => api.get(`/penalties/${penaltyId}`),
};
