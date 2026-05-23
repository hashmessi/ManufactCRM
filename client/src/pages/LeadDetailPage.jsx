import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useLeadStore from '../store/leadStore';
import api from '../api/axios';
import LeadDetail from '../components/leads/LeadDetail';
import InteractionTimeline from '../components/interactions/InteractionTimeline';
import LogInteractionModal from '../components/interactions/LogInteractionModal';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedLead, fetchLeadById, clearSelectedLead } = useLeadStore();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchLeadById(id);
      const res = await api.get(`/interactions?leadId=${id}`);
      setInteractions(res.data.interactions || res.data || []);
    } catch (err) {
      console.error(err);
      navigate('/pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => clearSelectedLead();
  }, [id]);

  const handleInteractionLogged = () => {
    loadData(); // reload lead and interactions to update scores etc.
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-32 bg-bg-tertiary rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-96 bg-bg-tertiary rounded-xl"></div>
          <div className="lg:col-span-2 h-96 bg-bg-tertiary rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!selectedLead) return null;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-4">
        <button 
          onClick={() => navigate('/pipeline')}
          className="flex items-center text-sm text-text-secondary hover:text-accent transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Pipeline
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-3 overflow-y-auto pr-2 custom-scrollbar">
          <LeadDetail />
        </div>
        
        <div className="lg:col-span-2 flex flex-col min-h-0 h-full">
          <InteractionTimeline 
            interactions={interactions} 
            onLogClick={() => setIsLogModalOpen(true)} 
          />
        </div>
      </div>

      {isLogModalOpen && (
        <LogInteractionModal 
          leadId={id} 
          onClose={() => setIsLogModalOpen(false)} 
          onLogged={handleInteractionLogged} 
        />
      )}
    </div>
  );
}
