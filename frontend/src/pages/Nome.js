//imports react
import React, { useState } from 'react';

//imports components
import MenuBar from '../components/MenuBar';
import Card from '../components/Card/nome'
import SubjectChart from '../components/SubjectChart'

import "./styles/App.style.css"

function App() {
  const [selectedSubjectCode, setSelectedSubjectCode] = useState()
  const [selectedSubject, setSelectedSubject] = useState()

  const handleSelectSubject = (subject, code) => {
    setSelectedSubject(subject)
    setSelectedSubjectCode(code)
  }
  
  return (
    <div className="main-container">
      <MenuBar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-5">
          <Card selectSubject={handleSelectSubject}/>
          </div>
            <SubjectChart 
              selectedSubject={selectedSubject} 
              selectedSubjectCode={selectedSubjectCode}
            />
        </div>
      </div> 
    </div>
  );
}

export default App;