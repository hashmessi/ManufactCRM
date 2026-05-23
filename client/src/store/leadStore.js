import { create } from 'zustand';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

const useLeadStore = create((set, get) => ({
  leads: [],
  loading: false,
  filters: {},
  stages: STAGES,
  selectedLead: null,
  selectedLeadLoading: false,

  getLeadsByStage: (stage) => {
    return get().leads.filter((lead) => lead.stage === stage);
  },

  fetchLeads: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters.scoreTier) params.append('scoreTier', filters.scoreTier);
      if (filters.source) params.append('source', filters.source);
      if (filters.stage) params.append('stage', filters.stage);

      const queryStr = params.toString();
      const url = queryStr ? `/leads?${queryStr}` : '/leads';
      const response = await api.get(url);
      const leads = response.data.leads || response.data || [];
      set({ leads, loading: false, filters });
    } catch (error) {
      set({ loading: false });
      toast.error('Failed to fetch leads');
    }
  },

  fetchLeadById: async (id) => {
    set({ selectedLeadLoading: true });
    try {
      const response = await api.get(`/leads/${id}`);
      const lead = response.data.lead || response.data;
      set({ selectedLead: lead, selectedLeadLoading: false });
      return lead;
    } catch (error) {
      set({ selectedLeadLoading: false });
      toast.error('Failed to fetch lead details');
      throw error;
    }
  },

  createLead: async (data) => {
    try {
      const response = await api.post('/leads', data);
      const newLead = response.data.lead || response.data;
      set((state) => ({ leads: [newLead, ...state.leads] }));
      toast.success('Lead created successfully');
      return newLead;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create lead';
      toast.error(message);
      throw error;
    }
  },

  updateLead: async (id, data) => {
    try {
      const response = await api.patch(`/leads/${id}`, data);
      const updatedLead = response.data.lead || response.data;
      set((state) => ({
        leads: state.leads.map((l) => (l._id === id ? updatedLead : l)),
        selectedLead: state.selectedLead?._id === id ? updatedLead : state.selectedLead,
      }));
      toast.success('Lead updated successfully');
      return updatedLead;
    } catch (error) {
      toast.error('Failed to update lead');
      throw error;
    }
  },

  updateLeadStage: async (id, newStage) => {
    try {
      const response = await api.patch(`/leads/${id}/stage`, { stage: newStage });
      const updatedLead = response.data.lead || response.data;
      set((state) => ({
        leads: state.leads.map((l) => (l._id === id ? updatedLead : l)),
      }));
      toast.success(`Moved to ${newStage}`);
      return updatedLead;
    } catch (error) {
      toast.error('Failed to update stage');
      throw error;
    }
  },

  deleteLead: async (id) => {
    try {
      await api.delete(`/leads/${id}`);
      set((state) => ({
        leads: state.leads.filter((l) => l._id !== id),
        selectedLead: state.selectedLead?._id === id ? null : state.selectedLead,
      }));
      toast.success('Lead deleted');
    } catch (error) {
      toast.error('Failed to delete lead');
      throw error;
    }
  },

  clearSelectedLead: () => set({ selectedLead: null }),
}));

export default useLeadStore;
