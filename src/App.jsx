import './App.css'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import QueryList from './components/QueryList'
import QueryForm from './components/QueryForm'
import Results from './components/Results'
import { selectTheme } from './redux/slices/settingsSlice'

function App() {
  const theme = useSelector(selectTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  return (
      <div className="appGrid">
          {/* Левая колонка */}
          <div className="leftColumn">
              <QueryList />
          </div>
          
          {/* Правая колонка */}
          <div className="rightColumn">
              <QueryForm />
              <Results />
          </div>
      </div>   
  )
}

export default App
