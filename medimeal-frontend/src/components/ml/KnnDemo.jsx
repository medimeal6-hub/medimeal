import React from 'react'

const KnnDemo = () => {
  const metrics = {
    accuracy: 0.92,
    precision: 0.90,
    recall: 0.88,
    f1: 0.89
  }

  const confusionMatrix = [
    [45, 3],
    [4, 38]
  ]

  const predictions = [
    { id: 'RX-1001', features: 'Vitamin K, Warfarin', predicted: 'Conflict', actual: 'Conflict', probability: 0.94 },
    { id: 'RX-1002', features: 'Grapefruit, Statin', predicted: 'Conflict', actual: 'Conflict', probability: 0.90 },
    { id: 'RX-1003', features: 'Milk, Antibiotic', predicted: 'No Conflict', actual: 'No Conflict', probability: 0.86 },
    { id: 'RX-1004', features: 'Caffeine, Beta-Blocker', predicted: 'Conflict', actual: 'Conflict', probability: 0.88 }
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
          <h3 className="font-semibold text-gray-800 mb-3">Confusion Matrix</h3>
          <div className="inline-block">
            {confusionMatrix.map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => (
                  <div key={c} className="w-24 h-16 flex items-center justify-center border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">{cell}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="text-xs text-gray-500 mt-2">Rows: Actual, Columns: Predicted</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">Predictions</div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-600">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Features</th>
                <th className="px-4 py-2">Predicted</th>
                <th className="px-4 py-2">Actual</th>
                <th className="px-4 py-2">Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {predictions.map((p) => (
                <tr key={p.id} className="text-sm">
                  <td className="px-4 py-2 font-medium text-gray-800">{p.id}</td>
                  <td className="px-4 py-2 text-gray-700">{p.features}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${p.predicted === 'Conflict' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {p.predicted}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{p.actual}</td>
                  <td className="px-4 py-2 text-gray-700">{(p.probability * 100).toFixed(1)}%</td>
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

export default KnnDemo


