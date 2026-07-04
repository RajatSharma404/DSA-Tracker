fetch("http://localhost:3005/api/auth/providers")
  .then(res => res.json())
  .then(console.log)
  .catch(console.error)
