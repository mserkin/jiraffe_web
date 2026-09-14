import './App.css'
import QueryList from './components/QueryList'
import QueryForm from './components/QueryForm'
import Results from './components/Results'

function App() {

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
