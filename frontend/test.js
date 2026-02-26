fetch("http://localhost:3000/api/auth/providers")
  .then(res => res.json())
  .then(console.log)
  .catch(console.error)
