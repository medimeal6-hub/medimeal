import { createContext, useContext, useState } from 'react'

const SearchContext = createContext()

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const updateSearch = (query) => {
    setSearchQuery(query)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <SearchContext.Provider value={{
      searchQuery,
      updateSearch,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  )
}
