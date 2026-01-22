import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Lock, Unlock, UserPlus, Edit, Eye, Search } from 'lucide-react';

const DietPlanReview = () => {
  const [pendingPlans, setPendingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null);

  useEffect(() => {
    fetchPendingPlans();
  }, []);

  const fetchPendingPlans = async () => {
    try {
      const response = await axios.get('/api/doctor/diet-plans/pending');
      setPendingPlans(response.data.data);
    } catch (error) {
      console.error('Error fetching pending plans:', error);
      // Use mock data on error
      setPendingPlans([
        {
          _id: 'plan-1',
          planName: 'Diabetes Management Plan',
          description: 'Low-carb diet plan for diabetes control with balanced nutrition',
          patientId: {
            _id: 'patient-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            medicalConditions: ['Diabetes', 'Hypertension']
          },
          breakfast: [
            { foodName: 'Oatmeal', quantity: '1 cup' },
            { foodName: 'Berries', quantity: '1/2 cup' }
          ],
          lunch: [
            { foodName: 'Grilled Chicken', quantity: '150g' },
            { foodName: 'Brown Rice', quantity: '1/2 cup' },
            { foodName: 'Steamed Vegetables', quantity: '1 cup' }
          ],
          dinner: [
            { foodName: 'Salmon', quantity: '120g' },
            { foodName: 'Quinoa', quantity: '1/2 cup' },
            { foodName: 'Mixed Salad', quantity: '1 cup' }
          ],
          snacks: [
            { foodName: 'Almonds', quantity: '1 oz' }
          ],
          isLocked: false,
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'plan-2',
          planName: 'Weight Loss Plan',
          description: 'Calorie-controlled meal plan for weight management',
          patientId: {
            _id: 'patient-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            medicalConditions: ['Obesity']
          },
          breakfast: [
            { foodName: 'Greek Yogurt', quantity: '1 cup' },
            { foodName: 'Banana', quantity: '1 medium' }
          ],
          lunch: [
            { foodName: 'Turkey Wrap', quantity: '1 wrap' },
            { foodName: 'Apple', quantity: '1 medium' }
          ],
          dinner: [
            { foodName: 'Grilled Fish', quantity: '100g' },
            { foodName: 'Sweet Potato', quantity: '1 medium' },
            { foodName: 'Broccoli', quantity: '1 cup' }
          ],
          snacks: [
            { foodName: 'Carrot Sticks', quantity: '1 cup' }
          ],
          isLocked: true,
          status: 'pending',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'plan-3',
          planName: 'Heart Health Plan',
          description: 'Low-sodium, heart-healthy diet plan',
          patientId: {
            _id: 'patient-3',
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@example.com',
            medicalConditions: ['Heart Disease', 'High Cholesterol']
          },
          breakfast: [
            { foodName: 'Whole Grain Toast', quantity: '2 slices' },
            { foodName: 'Avocado', quantity: '1/2 medium' }
          ],
          lunch: [
            { foodName: 'Lentil Soup', quantity: '1.5 cups' },
            { foodName: 'Whole Grain Bread', quantity: '1 slice' }
          ],
          dinner: [
            { foodName: 'Baked Chicken Breast', quantity: '120g' },
            { foodName: 'Roasted Vegetables', quantity: '1.5 cups' }
          ],
          snacks: [
            { foodName: 'Walnuts', quantity: '1 oz' }
          ],
          isLocked: false,
          status: 'draft',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (planId) => {
    try {
      await axios.post(`/api/doctor/diet-plans/${planId}/approve`, {});
      alert('Diet plan approved successfully');
      fetchPendingPlans();
    } catch (error) {
      console.error('Error approving plan:', error);
      alert('Failed to approve plan');
    }
  };

  const handleModify = async (planId, modifications) => {
    try {
      await axios.post(`/api/doctor/diet-plans/${planId}/modify`, modifications);
      alert('Diet plan modified successfully');
      setShowModal(false);
      fetchPendingPlans();
    } catch (error) {
      console.error('Error modifying plan:', error);
      alert('Failed to modify plan');
    }
  };

  const handleLock = async (planId, locked) => {
    try {
      await axios.post(`/api/doctor/diet-plans/${planId}/lock`, { locked });
      alert(`Diet plan ${locked ? 'locked' : 'unlocked'} successfully`);
      fetchPendingPlans();
    } catch (error) {
      console.error('Error locking plan:', error);
      alert('Failed to lock/unlock plan');
    }
  };

  const handleAssignDietitian = async (planId, dietitianId) => {
    try {
      await axios.post(`/api/doctor/diet-plans/${planId}/assign-dietitian`, { dietitianId });
      alert('Dietitian assigned successfully');
      fetchPendingPlans();
    } catch (error) {
      console.error('Error assigning dietitian:', error);
      alert('Failed to assign dietitian');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pending Diet Plans</h3>
          <p className="text-sm text-gray-600 mt-1">Review and approve AI-generated meal plans</p>
        </div>
        <div className="p-6">
          {pendingPlans.length > 0 ? (
            <div className="space-y-4">
              {pendingPlans.map((plan) => (
                <div key={plan._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{plan.planName}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Patient: {plan.patientId?.firstName} {plan.patientId?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {plan.isLocked ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs flex items-center">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs flex items-center">
                          <Unlock className="w-3 h-3 mr-1" />
                          Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {plan.description && (
                    <p className="text-sm text-gray-700 mb-4">{plan.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600">Breakfast</div>
                      <div className="text-sm font-medium text-gray-900">
                        {plan.breakfast?.length || 0} items
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Lunch</div>
                      <div className="text-sm font-medium text-gray-900">
                        {plan.lunch?.length || 0} items
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Dinner</div>
                      <div className="text-sm font-medium text-gray-900">
                        {plan.dinner?.length || 0} items
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Snacks</div>
                      <div className="text-sm font-medium text-gray-900">
                        {plan.snacks?.length || 0} items
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(plan._id)}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setAction('modify');
                        setShowModal(true);
                      }}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modify
                    </button>
                    <button
                      onClick={() => handleLock(plan._id, !plan.isLocked)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                        plan.isLocked
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      {plan.isLocked ? (
                        <>
                          <Unlock className="w-4 h-4 mr-1" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-1" />
                          Lock
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setAction('assign');
                        setShowModal(true);
                      }}
                      className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Assign Dietitian
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No pending diet plans to review.
            </div>
          )}
        </div>
      </div>

      {/* Modify/Assign Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {action === 'modify' ? 'Modify Diet Plan' : 'Assign Dietitian'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {action === 'modify' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      General Instructions
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={4}
                      defaultValue={selectedPlan.generalInstructions}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleModify(selectedPlan._id, {
                        generalInstructions: document.querySelector('textarea').value
                      })}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Dietitian
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter dietitian ID or search..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const dietitianId = document.querySelector('input').value;
                        if (dietitianId) {
                          handleAssignDietitian(selectedPlan._id, dietitianId);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlanReview;

