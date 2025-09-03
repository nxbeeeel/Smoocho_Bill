import React, { useState, useEffect } from 'react';
import { 
  CloudArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  PlayIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { updateService, UpdateInfo, UpdateModule, UpdateSchedule } from '../services/updateService';
import PremiumLayout from '../components/Layout/PremiumLayout';

const UpdateManagementPage: React.FC = () => {
  const [updates, setUpdates] = useState<UpdateInfo[]>([]);
  const [modules, setModules] = useState<UpdateModule[]>([]);
  const [schedules, setSchedules] = useState<UpdateSchedule[]>([]);
  const [selectedTab, setSelectedTab] = useState<'updates' | 'modules' | 'schedules'>('updates');
  // const [showAddUpdate, setShowAddUpdate] = useState(false);
  // const [showAddModule, setShowAddModule] = useState(false);
  // const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [stats, setStats] = useState(updateService.getUpdateStats());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUpdates(updateService.getAllUpdates());
    setModules(updateService.getAllModules());
    setSchedules(updateService.getAllSchedules());
    setStats(updateService.getUpdateStats());
  };

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      await updateService.checkForUpdates();
      loadData();
    } catch (error) {
      console.error('Failed to check updates:', error);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const handleStartUpdate = async (updateId: string) => {
    try {
      await updateService.startUpdate(updateId);
      loadData();
    } catch (error) {
      console.error('Failed to start update:', error);
    }
  };

  const handleRollbackUpdate = async (updateId: string) => {
    if (window.confirm('Are you sure you want to rollback this update? This action cannot be undone.')) {
      try {
        await updateService.rollbackUpdate(updateId);
        loadData();
      } catch (error) {
        console.error('Failed to rollback update:', error);
      }
    }
  };

  const handleToggleModule = (moduleId: string, enabled: boolean) => {
    try {
      updateService.toggleModule(moduleId, enabled);
      loadData();
    } catch (error) {
      console.error('Failed to toggle module:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ready': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'testing': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_development': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'planned': return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return '✨';
      case 'bugfix': return '🐛';
      case 'security': return '🔒';
      case 'performance': return '⚡';
      case 'ui': return '🎨';
      case 'integration': return '🔗';
      default: return '📦';
    }
  };

  return (
    <PremiumLayout>
      {/* 🌟 Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🚀 Update Management</h1>
            <p className="text-primary-100 text-lg">Manage future updates, modules, and deployment schedules</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdates}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
              <span>{isCheckingUpdates ? 'Checking...' : 'Check Updates'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Updates</p>
              <p className="text-2xl font-bold text-neutral-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <CloudArrowUpIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Upcoming</p>
              <p className="text-2xl font-bold text-neutral-900 mt-2">{stats.upcoming}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Modules</p>
              <p className="text-2xl font-bold text-neutral-900 mt-2">{modules.filter(m => m.isEnabled).length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Scheduled</p>
              <p className="text-2xl font-bold text-neutral-900 mt-2">{schedules.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200">
        <div className="border-b border-neutral-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'updates', name: 'Future Updates', count: updates.length },
              { id: 'modules', name: 'System Modules', count: modules.length },
              { id: 'schedules', name: 'Update Schedules', count: schedules.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  selectedTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {tab.name}
                <span className="ml-2 bg-neutral-100 text-neutral-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 🌟 Updates Tab */}
          {selectedTab === 'updates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Future Updates</h2>
                <button
                  onClick={() => {/* setShowAddUpdate(true) */}}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Update</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {updates.map((update) => (
                  <div key={update.id} className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 hover:border-primary-200 transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(update.type)}</span>
                        <div>
                          <h3 className="font-semibold text-neutral-900">{update.name}</h3>
                          <p className="text-sm text-neutral-500">v{update.version}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(update.status)}`}>
                          {update.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(update.priority)}`}>
                          {update.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-neutral-600 mb-4">{update.description}</p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Release Date:</span>
                        <span className="font-medium">{update.releaseDate || 'TBD'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Duration:</span>
                        <span className="font-medium">{update.estimatedDuration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Developer:</span>
                        <span className="font-medium">{update.developer}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Changelog:</h4>
                      <ul className="space-y-1">
                        {update.changelog.slice(0, 3).map((item, index) => (
                          <li key={index} className="text-sm text-neutral-600 flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                        {update.changelog.length > 3 && (
                          <li className="text-sm text-primary-600">+{update.changelog.length - 3} more items</li>
                        )}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {update.breakingChanges && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-200">
                            Breaking Changes
                          </span>
                        )}
                        {update.requiresRestart && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200">
                            Requires Restart
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {update.status === 'ready' && (
                          <button
                            onClick={() => handleStartUpdate(update.id)}
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center space-x-1"
                          >
                            <PlayIcon className="w-4 h-4" />
                            <span>Deploy</span>
                          </button>
                        )}
                        {update.status === 'deployed' && (
                          <button
                            onClick={() => handleRollbackUpdate(update.id)}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 flex items-center space-x-1"
                          >
                            <ArrowUturnLeftIcon className="w-4 h-4" />
                            <span>Rollback</span>
                          </button>
                        )}
                        <button className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors duration-200">
                          <PencilIcon className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors duration-200">
                          <TrashIcon className="w-4 h-4 text-neutral-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🌟 Modules Tab */}
          {selectedTab === 'modules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">System Modules</h2>
                <button
                  onClick={() => {/* setShowAddModule(true) */}}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Module</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {modules.map((module) => (
                  <div key={module.id} className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-neutral-900">{module.name}</h3>
                        <p className="text-sm text-neutral-500">v{module.version}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          module.isEnabled ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                        }`}>
                          {module.isEnabled ? 'Active' : 'Inactive'}
                        </span>
                        {module.isRequired && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-200">
                            Required
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-neutral-600 mb-4">{module.description}</p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Last Updated:</span>
                        <span className="font-medium">{new Date(module.lastUpdated).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Dependencies:</span>
                        <span className="font-medium">{module.dependencies.length || 'None'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {!module.isRequired && (
                          <button
                            onClick={() => handleToggleModule(module.id, !module.isEnabled)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              module.isEnabled
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {module.isEnabled ? 'Disable' : 'Enable'}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors duration-200">
                          <PencilIcon className="w-4 h-4 text-neutral-600" />
                        </button>
                        {!module.isRequired && (
                          <button className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors duration-200">
                            <TrashIcon className="w-4 h-4 text-neutral-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🌟 Schedules Tab */}
          {selectedTab === 'schedules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Update Schedules</h2>
                <button
                  onClick={() => {/* setShowAddSchedule(true) */}}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Schedule</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-neutral-900">{schedule.name}</h3>
                        <p className="text-sm text-neutral-500">{schedule.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(schedule.priority)}`}>
                          {schedule.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          schedule.riskLevel === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                          schedule.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {schedule.riskLevel} risk
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Target Date:</span>
                        <span className="font-medium">{new Date(schedule.targetDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Duration:</span>
                        <span className="font-medium">{schedule.estimatedDuration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Modules:</span>
                        <span className="font-medium">{schedule.modules.length}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Rollback Plan:</h4>
                      <p className="text-sm text-neutral-600">{schedule.rollbackPlan}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {schedule.testingRequired && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
                            Testing Required
                          </span>
                        )}
                        {schedule.approvalRequired && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full border border-purple-200">
                            Approval Required
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200">
                          View Details
                        </button>
                        <button className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors duration-200">
                          <PencilIcon className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors duration-200">
                          <TrashIcon className="w-4 h-4 text-neutral-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🌟 Export/Import Section */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Data Management</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const data = updateService.exportUpdateData();
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `smoocho-updates-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>Export Updates</span>
          </button>
          
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    try {
                      updateService.importUpdateData(e.target?.result as string);
                      loadData();
                    } catch (error) {
                      alert('Failed to import update data: ' + error);
                    }
                  };
                  reader.readAsText(file);
                }
              };
              input.click();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <DocumentArrowUpIcon className="w-5 h-5" />
            <span>Import Updates</span>
          </button>
        </div>
      </div>
    </PremiumLayout>
  );
};

export default UpdateManagementPage;
