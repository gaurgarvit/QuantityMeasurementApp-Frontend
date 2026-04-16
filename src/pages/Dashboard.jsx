import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeftRight, Repeat, Plus, Minus, Divide, 
  Ruler, Thermometer, Weight, Droplets,
  AlertCircle, ArrowRight, Loader2
} from 'lucide-react';
import { MEASUREMENT_TYPES, OPERATIONS } from '../utils/constants';
import { measurementService } from '../api/apiService';

const Dashboard = () => {
  const [activeOp, setActiveOp] = useState('convert');
  const [type, setType] = useState('LENGTH');
  const [formData, setFormData] = useState({
    thisValue: 0,
    thisUnit: 'INCH',
    thatValue: 0,
    thatUnit: 'INCH',
    targetUnit: 'INCH'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const counts = {};
        for (const op of OPERATIONS) {
          const res = await measurementService.getOperationCount(op.id);
          counts[op.id] = res.data;
        }
        setStats(counts);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, [result]); // Refresh stats after each calculation

  const handleTypeChange = (newType) => {
    setType(newType);
    const defaultUnit = MEASUREMENT_TYPES[newType].units[0];
    setFormData({
      ...formData,
      thisUnit: defaultUnit,
      thatUnit: defaultUnit,
      targetUnit: defaultUnit
    });
    setResult(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const payload = {
      ...formData,
      thisMeasurementType: type,
      thatMeasurementType: type,
      targetMeasurementType: type
    };

    try {
      let response;
      switch (activeOp) {
        case 'compare': response = await measurementService.compare(payload); break;
        case 'convert': response = await measurementService.convert(payload); break;
        case 'add': response = await measurementService.add(payload); break;
        case 'subtract': response = await measurementService.subtract(payload); break;
        case 'divide': response = await measurementService.divide(payload); break;
        default: throw new Error('Invalid operation');
      }

      if (response.data.error) {
        setError(response.data.errorMessage);
      } else {
        setResult(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (typeName) => {
    switch (typeName) {
      case 'LENGTH': return <Ruler className="w-5 h-5" />;
      case 'TEMPERATURE': return <Thermometer className="w-5 h-5" />;
      case 'WEIGHT': return <Weight className="w-5 h-5" />;
      case 'VOLUME': return <Droplets className="w-5 h-5" />;
      default: return null;
    }
  };

  const getOpIcon = (opId) => {
    switch (opId) {
      case 'compare': return <ArrowLeftRight className="w-5 h-5" />;
      case 'convert': return <Repeat className="w-5 h-5" />;
      case 'add': return <Plus className="w-5 h-5" />;
      case 'subtract': return <Minus className="w-5 h-5" />;
      case 'divide': return <Divide className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Quantity Measurement Tool</h1>
        <p className="text-slate-600">Convert, compare, and perform arithmetic on various measurement units.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Selection */}
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Measurement Type</h3>
            <div className="space-y-2">
              {Object.entries(MEASUREMENT_TYPES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleTypeChange(key)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all ${
                    type === key 
                    ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <span className="mr-3">{getTypeIcon(key)}</span>
                  <span className="font-medium">{value.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Operation</h3>
            <div className="space-y-2">
              {OPERATIONS.map((op) => (
                <button
                  key={op.id}
                  onClick={() => { setActiveOp(op.id); setResult(null); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    activeOp === op.id 
                    ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{getOpIcon(op.id)}</span>
                    <span className="font-medium">{op.label}</span>
                  </div>
                  {stats[op.id] !== undefined && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                      {stats[op.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-3">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
            <div className="flex items-center mb-8 pb-4 border-b border-slate-50">
              <div className="p-3 bg-primary-100 rounded-lg text-primary-700 mr-4">
                {getOpIcon(activeOp)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 capitalize">{activeOp} {MEASUREMENT_TYPES[type].label}</h2>
                <p className="text-slate-500 text-sm">Fill in the values to perform the {activeOp} operation.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                {/* First Value */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">First Quantity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="thisValue"
                      step="any"
                      required
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      value={formData.thisValue}
                      onChange={handleInputChange}
                    />
                    <select
                      name="thisUnit"
                      className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      value={formData.thisUnit}
                      onChange={handleInputChange}
                    >
                      {MEASUREMENT_TYPES[type].units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Second Value (for everything except convert) */}
                {activeOp !== 'convert' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">
                      {activeOp === 'divide' ? 'Divisor' : 'Second Quantity'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="thatValue"
                        step="any"
                        required
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        value={formData.thatValue}
                        onChange={handleInputChange}
                      />
                      <select
                        name="thatUnit"
                        className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        value={formData.thatUnit}
                        onChange={handleInputChange}
                      >
                        {MEASUREMENT_TYPES[type].units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Target Unit (for convert, add, subtract, divide) */}
                {activeOp !== 'compare' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Target Unit</label>
                    <select
                      name="targetUnit"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      value={formData.targetUnit}
                      onChange={handleInputChange}
                    >
                      {MEASUREMENT_TYPES[type].units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    'Calculate Result'
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-800">
                <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Calculation Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="mt-8 p-6 bg-primary-50 border border-primary-100 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-700 font-medium text-sm uppercase tracking-wider mb-1">Result</p>
                    <div className="flex items-baseline">
                      <h3 className="text-3xl font-bold text-slate-900 mr-2">
                        {result.resultValue !== null ? result.resultValue.toFixed(4).replace(/\.?0+$/, "") : result.resultString}
                      </h3>
                      {result.resultUnit && (
                        <span className="text-slate-500 font-medium">{result.resultUnit}</span>
                      )}
                    </div>
                  </div>
                  <Link to="/history" className="hidden md:block">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm border border-primary-100 hover:bg-slate-50 transition-colors">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </Link>
                </div>
                {result.resultString && (activeOp === 'compare' || result.resultValue === null) && (
                  <p className="mt-3 text-slate-600 italic">"{result.resultString}"</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
