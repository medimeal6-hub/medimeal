import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'

const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
    <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
    {children}
  </div>
)

const MealItem = ({ item }) => (
  <div className="flex items-center justify-between py-2">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
      <p className="text-xs text-gray-600">{item.type} • {item.calories} kcal</p>
    </div>
  </div>
)

const Recommendations = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [medInfo, setMedInfo] = useState(null)
  const [clusterData, setClusterData] = useState(null)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        setLoading(true)
        const [recRes, clusterRes, medsRes] = await Promise.all([
          axios.get('/recommendations/knn'),
          axios.get('/recommendations/cluster-python').catch(() => null),
          axios.get('/auth/food-suggestions').catch(() => null)
        ])
        if (!isMounted) return
        setData(recRes?.data?.data || null)
        setClusterData(clusterRes?.data?.data || null)
        setMedInfo(medsRes?.data?.data || null)
        setError(null)
      } catch (e) {
        if (!isMounted) return
        setError('Failed to load recommendations')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  const sections = useMemo(() => ([
    { key: 'breakfast', title: 'Breakfast' },
    { key: 'lunch', title: 'Lunch' },
    { key: 'dinner', title: 'Dinner' },
    { key: 'snack', title: 'Snack' }
  ]), [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  const budgets = data?.budgets || {}
  const recs = data?.recommendations || {}
  const mealTiming = medInfo?.mealTiming || {}
  const warnings = medInfo?.suggestions?.warnings || []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Personalized Recommendations</h2>
          <p className="text-sm text-gray-600">Powered by KNN and Clustering, tailored to your profile</p>
        </div>
        {data?.totalCalories ? (
          <div className="text-sm text-gray-700">
            Daily target: <span className="font-semibold">{data.totalCalories} kcal</span>
          </div>
        ) : null}
      </div>

      <Card title="Per-meal Calorie Budgets">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">Breakfast: <span className="font-semibold">{budgets.breakfast ?? '-'} kcal</span></div>
          <div className="p-3 rounded-lg bg-amber-50 text-amber-700 text-sm">Lunch: <span className="font-semibold">{budgets.lunch ?? '-'} kcal</span></div>
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-700 text-sm">Dinner: <span className="font-semibold">{budgets.dinner ?? '-'} kcal</span></div>
          <div className="p-3 rounded-lg bg-pink-50 text-pink-700 text-sm">Snack: <span className="font-semibold">{budgets.snack ?? '-'} kcal</span></div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(s => (
          <Card key={s.key} title={`${s.title} Recommendations`}>
            <div className="divide-y divide-gray-100">
              {(recs[s.key] || []).length === 0 && (
                <p className="text-sm text-gray-600">No items available.</p>
              )}
              {(recs[s.key] || []).map(item => (
                <MealItem key={item.name} item={item} />
              ))}
            </div>
          </Card>
        ))}
      </div>

      {clusterData && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Cluster-based Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map(s => (
              <Card key={`cluster-${s.key}`} title={`${s.title} (Cluster)`}>
                <div className="divide-y divide-gray-100">
                  {((clusterData.recommendations || {})[s.key] || []).length === 0 && (
                    <p className="text-sm text-gray-600">No items available.</p>
                  )}
                  {(((clusterData.recommendations || {})[s.key]) || []).map(item => (
                    <MealItem key={`cluster-${item.name}`} item={item} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Medicine timing and warnings */}
      {medInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Medicine Timing Tips">
            {Object.keys(mealTiming).length === 0 ? (
              <p className="text-sm text-gray-600">No timing tips available.</p>
            ) : (
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {Object.entries(mealTiming).map(([med, tip]) => (
                  <li key={med}><span className="font-medium">{med}:</span> {tip}</li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Food–Drug Warnings">
            {warnings.length === 0 ? (
              <p className="text-sm text-gray-600">No warnings detected.</p>
            ) : (
              <ul className="space-y-2">
                {warnings.map((w, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    <span className="font-medium">{w.medication}:</span> avoid {w.avoid.join(', ')} — {w.note}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

export default Recommendations


