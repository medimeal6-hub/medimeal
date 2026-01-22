import React from 'react'

const DecisionTreeDemo = () => {
  const metrics = {
    accuracy: 0.86,
    precision: 0.84,
    recall: 0.83,
    f1: 0.835
  }

  const featureImportances = [
    { name: 'Calories', value: 0.28 },
    { name: 'Protein', value: 0.22 },
    { name: 'Carbs', value: 0.18 },
    { name: 'Fats', value: 0.14 },
    { name: 'Sodium', value: 0.10 },
    { name: 'Fiber', value: 0.08 }
  ]

  const recommendations = [
    { id: 'MEAL-3001', name: 'Grilled Salmon Bowl', score: 0.92, reason: 'High protein, moderate carbs' },
    { id: 'MEAL-3002', name: 'Quinoa Veggie Salad', score: 0.88, reason: 'High fiber, balanced macros' },
    { id: 'MEAL-3003', name: 'Tofu Stir Fry', score: 0.85, reason: 'Low fat, good protein' }
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
          <h3 className="font-semibold text-gray-800 mb-3">Top Feature Importances</h3>
          <div className="space-y-3">
            {featureImportances.map((f) => (
              <div key={f.name} className="flex items-center">
                <div className="w-36 text-sm text-gray-700">{f.name}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-2 bg-emerald-500" style={{ width: `${f.value * 100}%` }} />
                </div>
                <div className="w-14 text-right text-sm text-gray-600 ml-2">{(f.value * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">Personalized Meals</div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-600">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Meal</th>
                <th className="px-4 py-2">Score</th>
                <th className="px-4 py-2">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recommendations.map((r) => (
                <tr key={r.id} className="text-sm">
                  <td className="px-4 py-2 font-medium text-gray-800">{r.id}</td>
                  <td className="px-4 py-2 text-gray-700">{r.name}</td>
                  <td className="px-4 py-2 text-gray-700">{(r.score * 100).toFixed(1)}%</td>
                  <td className="px-4 py-2 text-gray-700">{r.reason}</td>
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

export default DecisionTreeDemo


