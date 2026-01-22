import React from 'react'

const SvmDemo = () => {
  const metrics = {
    accuracy: 0.9,
    precision: 0.89,
    recall: 0.87,
    f1: 0.88
  }

  const boundarySummary = [
    { label: 'Support Vectors', value: 132 },
    { label: 'Margin Width', value: '1.42' },
    { label: 'Kernel', value: 'RBF' }
  ]

  const riskLevels = [
    { id: 'PX-4001', features: 'BP, BMI, LDL', predicted: 'High', probability: 0.89 },
    { id: 'PX-4002', features: 'BP, BMI, HDL', predicted: 'Medium', probability: 0.76 },
    { id: 'PX-4003', features: 'BP, BMI, A1C', predicted: 'Low', probability: 0.81 }
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
          <h3 className="font-semibold text-gray-800 mb-3">Model Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {boundarySummary.map((b) => (
              <div key={b.label} className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">{b.label}</div>
                <div className="text-lg font-semibold text-gray-800">{b.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">Health Risk Levels</div>
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
              {riskLevels.map((r) => (
                <tr key={r.id} className="text-sm">
                  <td className="px-4 py-2 font-medium text-gray-800">{r.id}</td>
                  <td className="px-4 py-2 text-gray-700">{r.features}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${r.predicted === 'High' ? 'bg-red-50 text-red-700' : r.predicted === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {r.predicted}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{(r.probability * 100).toFixed(1)}%</td>
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

export default SvmDemo


