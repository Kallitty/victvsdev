export default function ExamCard({ session }) {
  const datetime = session.Date.split('T')

  //TODO: update display of schedule details
  return (
    <section className='ExamCard'>
      <div className='SessionDetails'>
        <h3>{session.Title}</h3>
        <p>{session.Description}</p>
        <p>{session.CandidateId}</p>
        <p>Candidate: {session.CandidateName}</p>
      </div>
      <div className='LocationDetails'>
        <p>{datetime[0]}</p>
        <p>{datetime[1].slice(0, -1)}</p>
        <p className='LocationName'>{session.LocationName}</p>
      </div>
    </section>
  )
}
