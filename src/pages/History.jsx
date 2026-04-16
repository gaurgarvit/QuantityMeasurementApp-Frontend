import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Calendar, 
  Tag, 
  Activity, 
  AlertTriangle,
  Loader2,
  ChevronDown,
  Filter
} from 'lucide-react';
import { measurementService } from '../api/apiService';
import { MEASUREMENT_TYPES, OPERATIONS } from '../utils/constants';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    operation: 'ALL',
    type: 'ALL'
  });

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      let data = [];
      if (filter.operation === 'ERRORED') {
        const response = await measurementService.getErroredHistory();
        data = response.data;
      } else if (filter.operation === 'MY_HISTORY') {
        const response = await measurementService.getUserHistory();
        data = response.data;
      } else if (filter.operation !== 'ALL') {
        const response = await measurementService.getHistoryByOperation(filter.operation);
        data = response.data;
      } else if (filter.type !== 'ALL') {
        const response = await measurementService.getHistoryByType(filter.type);
        data = response.data;
      } else {
        const response = await measurementService.getAllHistory();
        data = response.data;
      }
      setHistory(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      setError('Failed to fetch history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (errored) => {
    if (errored) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Success
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center">
            <HistoryIcon className="w-8 h-8 mr-3 text-primary-600" />
            Operation History
          </h1>
          <p className="text-slate-600">Review your past measurement operations and calculations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              className="bg-transparent text-sm font-medium outline-none focus:ring-0"
              value={filter.operation}
              onChange={(e) => setFilter({ ...filter, operation: e.target.value, type: 'ALL' })}
            >
              <option value="ALL">All History</option>
              <option value="MY_HISTORY">My History</option>
              <option value="ERRORED">Errored Only</option>
              <optgroup label="By Operation">
                {OPERATIONS.map(op => <option key={op.id} value={op.id}>{op.label}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Tag className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              className="bg-transparent text-sm font-medium outline-none focus:ring-0"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value, operation: 'ALL' })}
            >
              <option value="ALL">All Types</option>
              {Object.entries(MEASUREMENT_TYPES).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading history...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-red-500">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <p className="font-medium">{error}</p>
            <button 
              onClick={fetchHistory}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Activity className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No history found</p>
            <p className="text-sm">Try changing your filters or perform some operations first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operation</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Input</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700 capitalize">{item.operation}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.measurementType}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {item.inputValue1} {item.inputUnit1}
                        {item.inputValue2 !== null && item.inputUnit2 !== null && ` vs ${item.inputValue2} ${item.inputUnit2}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.resultString || `${item.resultValue?.toFixed(4).replace(/\.?0+$/, "")} ${item.resultUnit}`}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.errored)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {formatDate(item.timestamp)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
