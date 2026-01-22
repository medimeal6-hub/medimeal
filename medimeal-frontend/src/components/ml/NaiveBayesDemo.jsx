import React from 'react'

const NaiveBayesDemo = () => {
  const metrics = {
    accuracy: 0.88,
    precision: 0.85,
    recall: 0.84,
    f1: 0.845
  }

  const confusionMatrix = [
    [40, 6],
    [7, 35]
  ]

  const predictions = [
    { id: 'INT-2001', pair: 'Aspirin + Warfarin', risk: 'High', predicted: 'High', probability: 0.91 },
    { id: 'INT-2002', pair: 'Metformin + Food', risk: 'Low', predicted: 'Low', probability: 0.82 },
    { id: 'INT-2003', pair: 'MAOI + Tyramine', risk: 'High', predicted: 'High', probability: 0.89 },
    { id: 'INT-2004', pair: 'Antibiotic + Milk', risk: 'Medium', predicted: 'Medium', probability: 0.77 }
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
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">Interaction Risks</div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-600">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Pair</th>
                <th className="px-4 py-2">Predicted Risk</th>
                <th className="px-4 py-2">Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {predictions.map((p) => (
                <tr key={p.id} className="text-sm">
                  <td className="px-4 py-2 font-medium text-gray-800">{p.id}</td>
                  <td className="px-4 py-2 text-gray-700">{p.pair}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${p.risk === 'High' ? 'bg-red-50 text-red-700' : p.risk === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {p.predicted}
                    </span>
                  </td>
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

export default NaiveBayesDemo


