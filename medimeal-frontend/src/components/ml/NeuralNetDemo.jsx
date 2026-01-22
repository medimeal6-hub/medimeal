import React from 'react'

const NeuralNetDemo = () => {
  const metrics = {
    accuracy: 0.91,
    precision: 0.90,
    recall: 0.89,
    f1: 0.895
  }

  const trainingSummary = [
    { label: 'Epochs', value: 25 },
    { label: 'Learning Rate', value: 0.001 },
    { label: 'Parameters', value: '58K' }
  ]

  const conflicts = [
    { id: 'CF-5001', features: 'Warfarin + Spinach', predicted: 'Conflict', probability: 0.93 },
    { id: 'CF-5002', features: 'Statin + Grapefruit', predicted: 'Conflict', probability: 0.91 },
    { id: 'CF-5003', features: 'ACE + Banana', predicted: 'No Conflict', probability: 0.84 }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Metrics</h3>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Accuracy" value={(metrics.accuracy * 100).toFixed(1) + '%'} />
            <Metric label="Precision" value={(metrics.precision * 100).toFixed(1) + '%'} />
            <Metric label="Recall" value={(metrics.recall * 100).toFixed(1) + '%'} />
            <Metric label="F1-score" value={(metrics.f1 * 100).toFixed(1) + '%'} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-3">Training Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {trainingSummary.map((t) => (
              <div key={t.label} className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">{t.label}</div>
                <div className="text-lg font-semibold text-gray-800">{t.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">AI-based Conflict Predictions</div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-600">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Features</th>
                <th className="px-4 py-2">Predicted</th>
                <th className="px-4 py-2">Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {conflicts.map((c) => (
                <tr key={c.id} className="text-sm">
                  <td className="px-4 py-2 font-medium text-gray-800">{c.id}</td>
                  <td className="px-4 py-2 text-gray-700">{c.features}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${c.predicted === 'Conflict' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {c.predicted}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{(c.probability * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const Metric = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-gray-50">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-lg font-semibold text-gray-800">{value}</div>
  </div>
)

export default NeuralNetDemo








