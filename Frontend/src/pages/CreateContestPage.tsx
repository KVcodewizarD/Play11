import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL;

const CreateContestPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    entryFee: 25,
    maxParticipants: 100,
    maxTeamsPerUser: 1,
    isPrivate: false,
    privateCode: '',
    prizeDistribution: '50-30-20' // Winner takes 50%, 2nd gets 30%, 3rd gets 20%
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const generatePrivateCode = () => {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, privateCode: code }));
  };

  const calculatePrizePool = () => {
    return formData.entryFee * formData.maxParticipants * 0.9; // 10% platform fee
  };

  const createContest = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a contest name');
      return;
    }

    if (formData.isPrivate && !formData.privateCode.trim()) {
      toast.error('Please generate or enter a private code');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('play11_token');
      if (!token) {
        toast.error('Please login to create contests');
        return;
      }

      const contestData = {
        name: formData.name,
        entryFee: formData.entryFee,
        maxParticipants: formData.maxParticipants,
        matchId: matchId, // This will be mapped to 'match' field in backend
        maxTeamsPerUser: formData.maxTeamsPerUser,
        isPrivate: formData.isPrivate,
        privateCode: formData.isPrivate ? formData.privateCode : undefined,
        prizeDistribution: formData.prizeDistribution,
        status: 'open'
      };

      const response = await fetch(`${API_URL}/api/contests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create contest');
      }

      const createdContest = await response.json();
      console.log('Contest created:', createdContest);
      
      toast.success('Contest created successfully!');
      navigate(`/dashboard/matches/${matchId}/contests`);
    } catch (error) {
      console.error('Contest creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create contest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Contest</h1>
        <p className="text-gray-600">Set up your own fantasy football contest</p>
      </div>

      {/* Match Info */}
      <div className="card">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl mb-1">🔴</div>
            <div className="font-semibold text-sm">Manchester United</div>
          </div>
          <div className="text-xl mx-4">VS</div>
          <div className="text-center">
            <div className="text-2xl mb-1">🔴</div>
            <div className="font-semibold text-sm">Liverpool</div>
          </div>
        </div>
        <div className="text-center mt-3 text-sm text-gray-600">
          March 15, 2024 at 3:00 PM
        </div>
      </div>

      {/* Contest Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          createContest();
        }}
      >
        {/* Contest Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contest Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter contest name..."
            className="input-field"
            required
          />
        </div>

        {/* Entry Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entry Fee (₹)
          </label>
          <select
            name="entryFee"
            value={formData.entryFee}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value={10}>₹10</option>
            <option value={25}>₹25</option>
            <option value={50}>₹50</option>
            <option value={100}>₹100</option>
            <option value={250}>₹250</option>
            <option value={500}>₹500</option>
          </select>
        </div>

        {/* Max Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Participants
          </label>
          <select
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value={2}>2 (Head to Head)</option>
            <option value={5}>5 participants</option>
            <option value={10}>10 participants</option>
            <option value={25}>25 participants</option>
            <option value={50}>50 participants</option>
            <option value={100}>100 participants</option>
            <option value={500}>500 participants</option>
            <option value={1000}>1000 participants</option>
          </select>
        </div>

        {/* Max Teams Per User */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Teams Per User
          </label>
          <select
            name="maxTeamsPerUser"
            value={formData.maxTeamsPerUser}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value={1}>1 team</option>
            <option value={3}>3 teams</option>
            <option value={5}>5 teams</option>
            <option value={11}>11 teams</option>
          </select>
        </div>

        {/* Prize Distribution */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prize Distribution
          </label>
          <select
            name="prizeDistribution"
            value={formData.prizeDistribution}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="winner-takes-all">Winner Takes All (100%)</option>
            <option value="50-30-20">Top 3 (50%, 30%, 20%)</option>
            <option value="40-25-20-15">Top 4 (40%, 25%, 20%, 15%)</option>
            <option value="distributed">Distributed among top 50%</option>
          </select>
        </div>

        {/* Private Contest */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="font-medium">Make this a private contest</span>
          </label>
          <p className="text-sm text-gray-600 mt-2">
            Only users with the private code can join this contest
          </p>
          
          {formData.isPrivate && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Private Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="privateCode"
                  value={formData.privateCode}
                  onChange={handleInputChange}
                  placeholder="Enter or generate code"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={generatePrivateCode}
                  className="btn-outline"
                >
                  Generate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contest Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Contest Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Entry Fee:</span>
              <span className="font-medium">₹{formData.entryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Max Participants:</span>
              <span className="font-medium">{formData.maxParticipants}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Prize Pool:</span>
              <span className="font-medium text-green-600">₹{calculatePrizePool().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee (10%):</span>
              <span className="font-medium">₹{(formData.entryFee * formData.maxParticipants * 0.1).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Contest Type:</span>
              <span className="font-medium">{formData.isPrivate ? 'Private' : 'Public'}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {loading ? 'Creating Contest...' : 'Create Contest'}
        </button>
      </motion.form>
    </div>
  );
};

export default CreateContestPage;